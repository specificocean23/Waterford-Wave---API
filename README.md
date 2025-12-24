# 🚀 API Server

Dedicated API server for background jobs, webhooks, and future API endpoints.

## Features

- ✅ Express REST API
- ✅ PostgreSQL with Prisma
- ✅ Health check endpoint
- ✅ Ready for background jobs
- ✅ Ready for webhooks
- ✅ Railway deployment config

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

Server runs on `http://localhost:8080`

### Testing

```bash
# Health check
curl http://localhost:8080/health

# Root endpoint
curl http://localhost:8080/
```

## Deployment

### Railway

1. Create new Railway project
2. Connect to GitHub repo
3. Set root directory: `railway-api-server`
4. Add environment variables:
   - `DATABASE_URL` (from Railway Postgres)
   - `NODE_ENV=production`
5. Deploy!

### Health Check

```bash
curl https://your-domain.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-12-24T..."
}
```

## Project Structure

```
railway-api-server/
├── src/
│   ├── index.ts       # Main API server
│   └── db.ts          # Prisma client
├── prisma/
│   └── schema.prisma  # Database schema
├── package.json
├── tsconfig.json
├── railway.json       # Railway config
└── .env.example
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Environment
NODE_ENV="production"

# Port (Railway sets automatically)
PORT=8080
```

## Adding API Endpoints

### Example: Send Notifications

```typescript
// Add to src/index.ts

app.post("/api/notifications/send", async (req, res) => {
  const { userId, message, type } = req.body;
  
  try {
    // Save notification to database
    const notification = await prisma.notifications.create({
      data: {
        userId,
        message,
        type,
        read: false,
      },
    });
    
    // TODO: Send push notification (add later)
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Failed to send notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});
```

### Example: Background Job (Cleanup)

```typescript
app.post("/api/jobs/cleanup-old-messages", async (req, res) => {
  try {
    // Delete messages older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const deleted = await prisma.messages.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
    
    console.log(`Deleted ${deleted.count} old messages`);
    res.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error("Cleanup failed:", error);
    res.status(500).json({ error: "Cleanup failed" });
  }
});
```

### Example: Webhook Handler

```typescript
app.post("/webhooks/stripe", async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case "payment_intent.succeeded":
      // Handle successful payment
      break;
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      break;
  }
  
  res.json({ received: true });
});
```

## Future Use Cases

### Scheduled Jobs

Use Railway's cron jobs or add node-cron:

```bash
npm install node-cron
```

```typescript
import cron from 'node-cron';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cleanup...');
  // Cleanup old data
});
```

### Email Sending

```bash
npm install nodemailer
```

```typescript
app.post("/api/email/send", async (req, res) => {
  const { to, subject, html } = req.body;
  
  await transporter.sendMail({
    from: "noreply@waterfordwave.ie",
    to,
    subject,
    html,
  });
  
  res.json({ success: true });
});
```

### Image Processing

```bash
npm install sharp
```

```typescript
app.post("/api/images/resize", async (req, res) => {
  const { imageUrl, width, height } = req.body;
  
  // Download, resize, upload
  const resized = await sharp(imageBuffer)
    .resize(width, height)
    .toBuffer();
  
  res.json({ success: true, url: newUrl });
});
```

## Monitoring

### Logs

Railway captures all console output:
```typescript
console.log("Info message");
console.error("Error message");
```

### Custom Metrics

Add Prometheus or custom endpoint:
```typescript
app.get("/metrics", async (_req, res) => {
  const userCount = await prisma.users.count();
  const postCount = await prisma.posts.count();
  
  res.json({
    users: userCount,
    posts: postCount,
    timestamp: new Date().toISOString(),
  });
});
```

## Security

### API Key Authentication

```typescript
const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## Troubleshooting

### Server Won't Start

**Problem**: Railway health check fails

**Solutions**:
1. Check Railway logs for errors
2. Verify DATABASE_URL is set
3. Test locally: `npm run build && npm start`

### Database Connection Fails

**Problem**: `Prisma connection error`

**Solutions**:
1. Verify DATABASE_URL format
2. Check Railway Postgres is running
3. Run `npx prisma db push` to sync schema

## Performance

### Current
- ✅ Lightweight (no WebSocket overhead)
- ✅ Fast startup (<5 seconds)
- ✅ Low memory (~30MB base)

### Optimization
- Add Redis caching (see [../REDIS_EXPLAINED.md](../REDIS_EXPLAINED.md))
- Use database connection pooling
- Add response compression
- Enable HTTP/2

## Related Docs

- [Railway Split Backend Guide](../RAILWAY_SPLIT_BACKEND_GUIDE.md)
- [Redis Explained](../REDIS_EXPLAINED.md)
- [MVP Status](../MVP_STATUS_AND_ROADMAP.md)

---

**Built with**: TypeScript, Express, Prisma, Railway

**Status**: Production-ready ✅
