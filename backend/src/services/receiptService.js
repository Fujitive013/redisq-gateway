const enqueueReceipt = async ({ receiptQueue, payload }) =>
    receiptQueue.add("process-receipt", payload, {
        jobId: payload.transaction_id,
    });

module.exports = { enqueueReceipt };
