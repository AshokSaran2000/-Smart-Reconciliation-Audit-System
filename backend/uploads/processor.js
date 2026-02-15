const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('../config/db');
const Record = require('../models/Record');
const SystemRecord = require('../models/SystemRecord');
const ReconciliationResult = require('../models/ReconciliationResult');
const AuditLog = require('../models/AuditLog');
const UploadJob = require('../models/UploadJob');
const rules = require('../config/matchingRules');

const BATCH = 500;

const safeParseNumber = v => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const amountWithinVariance = (a, b, percent) => {
  if (a == null || b == null) return false;
  const diff = Math.abs(a - b);
  return diff <= (Math.abs(b) * percent) / 100;
};

process.on('message', async (msg) => {
  const { jobId, filePath, uploader } = msg;
  try {
    await connectDB();
    const job = await UploadJob.findById(jobId);
    if (!job) throw new Error('Upload job not found');

    let rows = [];
    let headers = null;
    const ext = path.extname(filePath).toLowerCase();

    const handleRow = async (rowObj) => {
      // Normalize fields
      const rec = {
        uploadJobId: job._id,
        transactionId: rowObj.transactionId || rowObj.transaction_id || rowObj.TransactionID || rowObj['Transaction ID'] || rowObj.txnId || rowObj.txn || null,
        amount: safeParseNumber(rowObj.amount || rowObj.Amount || rowObj.AMT || rowObj.Value),
        referenceNumber: rowObj.referenceNumber || rowObj.ref || rowObj.Reference || rowObj['Reference Number'] || null,
        date: rowObj.date ? new Date(rowObj.date) : (rowObj.Date ? new Date(rowObj.Date) : null),
        rawData: rowObj
      };
      rows.push(rec);
      if (rows.length >= BATCH) {
        await flushBatch(rows);
        rows = [];
      }
    };

    const flushBatch = async (batch) => {
      if (!batch.length) return;
      // detect duplicates within batch by transactionId
      const seen = new Map();
      const inserts = [];
      for (const r of batch) {
        const key = r.transactionId || JSON.stringify(r.rawData);
        if (seen.has(key)) {
          // mark duplicate result record without inserting again
          inserts.push({ record: r, duplicate: true });
        } else {
          seen.set(key, true);
          inserts.push({ record: r, duplicate: false });
        }
      }

      // bulk insert new records
      const toInsert = inserts.filter(i => !i.duplicate).map(i => i.record);
      let insertedDocs = [];
      if (toInsert.length) {
        const docs = await Record.insertMany(toInsert, { ordered: false });
        insertedDocs = docs;
      }

      // build reconciliation results and audit logs
      const results = [];
      const audits = [];

      // helper to find system matches
      for (const item of inserts) {
        const r = item.record;
        let status = 'Not Matched';
        let mismatchFields = [];

        if (item.duplicate) {
          status = 'Duplicate';
        } else {
          // exact match by transactionId + amount
          if (r.transactionId) {
            const exact = await SystemRecord.findOne({ transactionId: r.transactionId, amount: r.amount });
            if (exact) {
              status = 'Matched';
            } else {
              // partial match by referenceNumber with amount variance
              if (r.referenceNumber) {
                const candidate = await SystemRecord.findOne({ referenceNumber: r.referenceNumber });
                if (candidate && amountWithinVariance(r.amount, candidate.amount, rules.partialMatch.amountVariancePercent)) {
                  status = 'Partially Matched';
                  // determine mismatched fields
                  if (candidate.amount !== r.amount) mismatchFields.push('amount');
                  if (candidate.transactionId !== r.transactionId) mismatchFields.push('transactionId');
                }
              }
            }
          }
        }

        // If we inserted, find inserted doc id
        let recordId = null;
        if (!item.duplicate && insertedDocs.length) {
          // naive matching by transactionId + amount
          const found = insertedDocs.find(d => (d.transactionId === r.transactionId) && (d.amount === r.amount));
          if (found) recordId = found._id;
        }

        results.push({ recordId, status, mismatchFields });

        audits.push({ recordId, userId: uploader || null, oldValue: null, newValue: r, source: 'upload' });
      }

      if (results.length) {
        const rrOps = results.map(r => ({ insertOne: { document: r } }));
        await ReconciliationResult.bulkWrite(rrOps, { ordered: false });
      }
      if (audits.length) {
        // insert audit logs (will enforce immutability in schema)
        await AuditLog.insertMany(audits, { ordered: false });
      }
    };

    if (ext === '.csv' || ext === '.txt') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
          .on('error', err => reject(err))
          .on('data', async row => {
            // pause stream while handling batches
            (async () => { await handleRow(row); })();
          })
          .on('end', async rowCount => {
            try {
              await flushBatch(rows);
              await UploadJob.findByIdAndUpdate(job._id, { status: 'Completed', totalRecords: rowCount });
              resolve();
            } catch (e) { reject(e); }
          });
      });
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];
      let count = 0;
      const headerRow = worksheet.getRow(1);
      const keys = headerRow.values.slice(1).map(h => String(h).trim());
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = {};
        row.values.slice(1).forEach((v, i) => { obj[keys[i]] = v; });
        count++;
        rows.push(obj);
        if (rows.length >= BATCH) { flushBatch(rows); rows = []; }
      });
      if (rows.length) await flushBatch(rows);
      await UploadJob.findByIdAndUpdate(job._id, { status: 'Completed', totalRecords: count });
    } else {
      throw new Error('Unsupported file type');
    }

    process.exit(0);
  } catch (err) {
    try {
      if (msg.jobId) await UploadJob.findByIdAndUpdate(msg.jobId, { status: 'Failed' });
    } catch (e) {}
    console.error('Processor error', err);
    process.exit(1);
  }
});
