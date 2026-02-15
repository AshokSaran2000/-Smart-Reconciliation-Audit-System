require('dotenv').config({ path: __dirname + '/../uploads/.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const SystemRecord = require('../models/SystemRecord');
const UploadJob = require('../models/UploadJob');
const Record = require('../models/Record');
const ReconciliationResult = require('../models/ReconciliationResult');
const AuditLog = require('../models/AuditLog');

const run = async () => {
  try {
    await connectDB();
    console.log('Seeding DB...');

    // clear small set (for demo)
    await SystemRecord.deleteMany({});
    await UploadJob.deleteMany({});
    await Record.deleteMany({});
    await ReconciliationResult.deleteMany({});
    await AuditLog.deleteMany({});

    // create demo users
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    await User.deleteMany({});
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const analystPass = await bcrypt.hash('Analyst123!', 10);
    const viewerPass = await bcrypt.hash('Viewer123!', 10);
    const adminUser = await User.create({ name: 'Admin User', email: 'admin@example.com', password: adminPass, role: 'Admin' });
    const analystUser = await User.create({ name: 'Analyst User', email: 'analyst@example.com', password: analystPass, role: 'Analyst' });
    const viewerUser = await User.create({ name: 'Viewer User', email: 'viewer@example.com', password: viewerPass, role: 'Viewer' });

    // create system records
    const sys = [];
    for (let i = 1; i <= 100; i++) {
      sys.push({ transactionId: `SYS${1000 + i}`, amount: Math.round(Math.random()*10000)/100, referenceNumber: `REF${2000+i}`, date: new Date(), metadata: { source: 'bank' } });
    }
    await SystemRecord.insertMany(sys);

    // create sample upload job
    const job = await UploadJob.create({ fileName: 'transactions_sample.csv', fileHash: 'samplehash', status: 'Completed', totalRecords: 4, uploadedBy: adminUser._id });

    const recs = [
      { uploadJobId: job._id, transactionId: 'SYS1001', amount: sys[0].amount, referenceNumber: sys[0].referenceNumber, date: new Date(), rawData: {} },
      { uploadJobId: job._id, transactionId: 'XTRN-555', amount: 123.45, referenceNumber: 'REF9001', date: new Date(), rawData: {} },
      { uploadJobId: job._id, transactionId: 'SYS1003', amount: sys[2].amount * 1.01, referenceNumber: sys[2].referenceNumber, date: new Date(), rawData: {} },
      { uploadJobId: job._id, transactionId: 'SYS1001', amount: sys[0].amount, referenceNumber: sys[0].referenceNumber, date: new Date(), rawData: {} }
    ];
    const inserted = await Record.insertMany(recs);

    const results = [];
    for (const r of inserted) {
      if (r.transactionId === 'XTRN-555') {
        results.push({ recordId: r._id, status: 'Not Matched', mismatchFields: [] });
        await AuditLog.create({ recordId: r._id, userId: null, oldValue: null, newValue: r, source: 'seed' });
      } else if (r.transactionId === 'SYS1001' && r._id) {
        // duplicates for SYS1001
        results.push({ recordId: r._id, status: 'Duplicate', mismatchFields: [] });
        await AuditLog.create({ recordId: r._id, userId: null, oldValue: null, newValue: r, source: 'seed' });
      } else {
        results.push({ recordId: r._id, status: 'Partially Matched', mismatchFields: ['amount'] });
        await AuditLog.create({ recordId: r._id, userId: null, oldValue: null, newValue: r, source: 'seed' });
      }
    }
    await ReconciliationResult.insertMany(results);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
};

run();
