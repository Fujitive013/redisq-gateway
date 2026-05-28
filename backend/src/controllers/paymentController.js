const { enqueueReceipt } = require("../services/receiptService");

const createPaymentController = ({ receiptQueue }) => ({
    postPayment: async (req, res) => {
        try {
            const payload = req.body;
            if (!payload?.transaction_id) {
                return res
                    .status(400)
                    .json({ error: "transaction_id is required" });
            }
            const job = await enqueueReceipt({ receiptQueue, payload });

            res.status(202).json({
                message:
                    "Payment received. Receipt is processing in the background.",
                jobId: job.id,
            });
        } catch (error) {
            if (error?.code === "EJOBDUPLICATE") {
                return res.status(202).json({
                    message: "Payment already received. Receipt is processing.",
                });
            }
            console.error("Error queueing job:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
});

module.exports = createPaymentController;
