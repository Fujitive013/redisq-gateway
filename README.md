# RedisQ Gateway

A small Express gateway that accepts payment webhooks, enqueues receipt work with BullMQ, and processes background jobs that store transactions in Supabase and send email via Elastic Email.

## Architecture

- HTTP API: Express app wired in `src/app.js`
- Queue: BullMQ with Redis
- Worker: `src/worker.js` processes `receipt-queue`
- Email: Elastic Email v4 Transactional API
- Database: Supabase (Postgres)

## Endpoints

- `GET /api/health`
    - Checks Redis and Supabase connectivity
- `POST /api/webhooks/payments`
    - Enqueues a receipt job
    - Requires `transaction_id` in the JSON payload

## Queue Idempotency

Duplicate payments are avoided by setting the BullMQ `jobId` to `transaction_id`. If the same `transaction_id` is posted again, the job will be rejected as a duplicate and no email is sent a second time.

## Environment Variables

Required:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `ELASTIC_EMAIL_API_KEY`
- `ELASTIC_EMAIL_FROM`
- `ELASTIC_EMAIL_TO`

Recommended for deployment:

- `REDIS_URL` or `REDIS_TLS_URL` (managed Redis connection string)

Optional:

- `PORT` (default: 3001)
- `REDIS_HOST` (default: 127.0.0.1)
- `REDIS_PORT` (default: 6379)
- `ELASTIC_EMAIL_FROM_NAME` (default: RedisQ Gateway)

## Example Payload

```json
{
    "transaction_id": "TXN-1001",
    "student_id": "STU-42",
    "department": "Computer Science",
    "amount_paid": 1500,
    "description": "Tuition payment",
    "terminal": "POS-1",
    "email": "student@example.com"
}
```

If `email` is omitted, the worker uses `ELASTIC_EMAIL_TO` as a fallback recipient.

## Scripts

From `backend/`:

- `npm run dev` - start API with nodemon
- `npm run start` - start API
- `npm run worker` - start worker

## Local Redis

Use the docker compose file in `backend/docker-compose.yml`:

```
docker compose up -d
```

## Deployment (Render)

Render free plan works well with two services and a managed Redis instance.

1. Create a Redis instance and copy its internal URL into `REDIS_URL`.
2. Create a Web Service:
    - Root directory: `backend`
    - Build command: `npm install`
    - Start command: `npm run start`
3. Create a Background Worker:
    - Root directory: `backend`
    - Build command: `npm install`
    - Start command: `npm run worker`
4. Add the same environment variables to both services.

Notes:

- Render provides `PORT` automatically.
- If you use the Redis TLS URL, set `REDIS_TLS_URL` instead of `REDIS_URL`.
- Free plan services can sleep when idle; background workers may also pause.
