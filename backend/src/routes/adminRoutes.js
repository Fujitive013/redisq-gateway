const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const createAdminRouter = (receiptQueue) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
        queues: [new BullMQAdapter(receiptQueue)],
        serverAdapter: serverAdapter,
    });

    return serverAdapter.getRouter();
};

module.exports = createAdminRouter;
