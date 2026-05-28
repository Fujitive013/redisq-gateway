const { Router } = require("express");
const createPaymentController = require("../controllers/paymentController");

const createPaymentRouter = ({ receiptQueue, apiLimiter }) => {
    const router = Router();
    const controller = createPaymentController({ receiptQueue });

    router.post("/payments", apiLimiter, controller.postPayment);

    return router;
};

module.exports = createPaymentRouter;
