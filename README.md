# RedisQ Gateway

Express gateway for payment webhooks. It accepts payment events, enqueues receipt jobs with BullMQ/Redis, and a background worker stores transactions in Supabase and sends email through Elastic Email.

## Visualization

Illustrates the full request flow, from Postman into the web service, through Redis/BullMQ, and then into the worker that triggers Elastic Email and writes to Supabase. Visualization created with Google Gemini.

![RedisQ visualization](backend/assets/RedisQ%20Visual.gif)

## Quick Start (Local)

1. Start Redis
    - From `backend/` run:
        ```
        docker compose up -d
        ```
2. Install dependencies
    - From `backend/` run:
        ```
        npm install
        ```
3. Create `.env` in `backend/`

    Required:
    - `SUPABASE_URL`
    - `SUPABASE_KEY`
    - `ELASTIC_EMAIL_API_KEY`
    - `ELASTIC_EMAIL_FROM`
    - `ELASTIC_EMAIL_TO`
    - `REDIS_URL` (local: `redis://127.0.0.1:6379`)

    Optional:
    - `PORT` (default: 3001)
    - `ELASTIC_EMAIL_FROM_NAME` (default: RedisQ Gateway)

4. Start API and worker
    - Terminal 1:
        ```
        npm run dev
        ```
    - Terminal 2:
        ```
        npm run worker
        ```

## API Endpoints (Local)

Base URL: `http://localhost:3001`

- `GET /api/health`
    - Checks Redis and Supabase connectivity.
- `POST /api/webhooks/payments`
    - Enqueues a receipt job.
    - Requires `transaction_id` in the JSON payload.

### Example Request

```bash
curl -X POST http://localhost:3001/api/webhooks/payments \
    -H "Content-Type: application/json" \
    -d '{
        "transaction_id": "TXN-1001",
        "student_id": "STU-42",
        "department": "Computer Science",
        "amount_paid": 1500,
        "description": "Tuition payment",
        "terminal": "POS-1",
        "email": "student@example.com"
    }'
```

If `email` is omitted, the worker uses `ELASTIC_EMAIL_TO` as a fallback recipient.

## Idempotency (Duplicates)

Duplicate payments are avoided by setting the BullMQ `jobId` to `transaction_id`. If the same `transaction_id` is posted again, the job will be rejected as a duplicate and no second email is sent.

## Scripts

From `backend/`:

- `npm run dev` - start API with nodemon
- `npm run start` - start API
- `npm run worker` - start worker
