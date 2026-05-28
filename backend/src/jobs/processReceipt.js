const sendReceiptEmail = async ({
    apiKey,
    fromEmail,
    fromName,
    toEmail,
    subject,
    html,
    text,
}) => {
    if (!apiKey) {
        throw new Error("Missing ELASTIC_EMAIL_API_KEY");
    }
    if (!fromEmail) {
        throw new Error("Missing ELASTIC_EMAIL_FROM");
    }
    if (!toEmail) {
        throw new Error("Missing recipient email for receipt");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
        "https://api.elasticemail.com/v4/emails/transactional",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-ElasticEmail-ApiKey": apiKey,
            },
            body: JSON.stringify({
                Recipients: {
                    To: [toEmail],
                },
                Content: {
                    From: fromEmail,
                    FromName: fromName,
                    Subject: subject,
                    Body: [
                        {
                            ContentType: "HTML",
                            Charset: "utf-8",
                            Content: html,
                        },
                        {
                            ContentType: "PlainText",
                            Charset: "utf-8",
                            Content: text,
                        },
                    ],
                },
            }),
            signal: controller.signal,
        },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Elastic Email API error (${response.status}): ${errorText}`,
        );
    }

    return response.json().catch(() => ({}));
};

const createReceiptProcessor =
    ({ supabase }) =>
    async (job) => {
        const {
            transaction_id,
            student_id,
            department,
            amount_paid,
            description,
            terminal,
            email,
        } = job.data;

        console.log(
            `\n[Job #${job.id}] Processing payment for transaction: ${transaction_id}`,
        );

        const receiptText = `Payment receipt\n\nTransaction: ${transaction_id}\nStudent: ${student_id}\nDepartment: ${department}\nAmount Paid: ${amount_paid}\nDescription: ${description}\nTerminal: ${terminal}`;
        const receiptHtml = `
            <h2>Payment receipt</h2>
            <p><strong>Transaction:</strong> ${transaction_id}</p>
            <p><strong>Student:</strong> ${student_id}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Amount Paid:</strong> ${amount_paid}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Terminal:</strong> ${terminal}</p>
        `;

        await sendReceiptEmail({
            apiKey: process.env.ELASTIC_EMAIL_API_KEY,
            fromEmail: process.env.ELASTIC_EMAIL_FROM,
            fromName: process.env.ELASTIC_EMAIL_FROM_NAME || "RedisQ Gateway",
            toEmail: email || process.env.ELASTIC_EMAIL_TO,
            subject: `Payment receipt ${transaction_id}`,
            html: receiptHtml.trim(),
            text: receiptText,
        });

        console.log(`[Job #${job.id}] Receipt email dispatched.`);

        const { data, error } = await supabase
            .from("transactions")
            .insert([
                {
                    transaction_id,
                    student_id,
                    department,
                    amount_paid,
                    description,
                    terminal,
                    email_status: "SENT", // Mark as successfully dispatched
                },
            ])
            .select();

        if (error) {
            console.error(
                `[Job #${job.id}] Supabase Database Error:`,
                error.message,
            );
            throw new Error(error.message); // Throwing an error tells BullMQ to mark the job as "Failed"
        }

        console.log(
            `[Job #${job.id}] Successfully saved to permanent record. Database ID: ${data[0].id}`,
        );
        return { success: true, dbRecordId: data[0].id };
    };

module.exports = createReceiptProcessor;
