module.exports = {
  exactMatch: {
    fields: ['transactionId','amount']
  },
  partialMatch: {
    fields: ['referenceNumber'],
    amountVariancePercent: 2
  }
};
