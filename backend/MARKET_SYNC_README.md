# Market Sync System

This system automatically syncs markets from a third-party API to keep your local market database up-to-date.

## Features

- **Automatic Sync**: Runs daily at midnight (00:00) IST
- **Manual Sync**: Trigger sync manually via API or admin panel
- **Smart Updates**: Only updates markets when data changes
- **Error Handling**: Comprehensive error logging and reporting
- **Role-based Access**: Only superadmin and admin users can trigger syncs

## How It Works

1. **Cron Job**: Automatically runs at midnight every day
2. **API Integration**: Fetches data from `https://clmadmin.cloud/api/checkResponse`
3. **Data Processing**: Processes the `all_result` array from the API response
4. **Database Sync**: Creates new markets or updates existing ones based on changes

## API Endpoints

### Manual Market Sync
```http
POST /api/v1/market-sync/sync
Authorization: Bearer <token>
Role: superadmin, admin
```

### Get Sync Status
```http
GET /api/v1/market-sync/status
Authorization: Bearer <token>
Role: superadmin, admin
```

### Get Cron Status
```http
GET /api/v1/market-sync/cron/status
Authorization: Bearer <token>
Role: superadmin, admin
```

### Restart Cron Jobs
```http
POST /api/v1/market-sync/cron/restart
Authorization: Bearer <token>
Role: superadmin
```

### Stop Cron Jobs
```http
POST /api/v1/market-sync/cron/stop
Authorization: Bearer <token>
Role: superadmin
```

## Response Format

### Sync Response
```json
{
  "success": true,
  "message": "Successfully synced 150 markets",
  "data": {
    "created": 5,
    "updated": 145,
    "errors": [],
    "timestamp": "2025-01-27T00:00:00.000Z"
  }
}
```

### Status Response
```json
{
  "success": true,
  "data": {
    "sync": {
      "lastSync": "2025-01-27T00:00:00.000Z",
      "totalMarkets": 150,
      "activeMarkets": 145,
      "inactiveMarkets": 5,
      "goldenMarkets": 10
    },
    "cron": {
      "marketSyncScheduled": true,
      "nextMarketSync": "2025-01-28T00:00:00.000Z"
    },
    "timestamp": "2025-01-27T12:00:00.000Z"
  }
}
```

## Configuration

### Timezone
The cron job runs in **Asia/Kolkata** timezone (IST).

### Schedule
- **Daily at midnight**: `0 0 * * *` (00:00 IST)

### API Configuration
The third-party API configuration is in `liveResultService.ts`:
- Base URL: `https://clmadmin.cloud/api/checkResponse`
- Authentication: API key + HMAC signature
- Rate limiting: Respects API limits

## Testing

### Run Test Script
```bash
npm run test-sync
```

This will:
1. Connect to MongoDB
2. Run a manual market sync
3. Display results and statistics
4. Show any errors encountered

### Manual Testing via API
```bash
# Test sync endpoint
curl -X POST http://localhost:5000/api/v1/market-sync/sync \
  -H "Authorization: Bearer <your-token>"

# Check status
curl http://localhost:5000/api/v1/market-sync/status \
  -H "Authorization: Bearer <your-token>"
```

## Error Handling

The system handles various error scenarios:

- **API Connection Issues**: Logs and reports connection failures
- **Invalid Data**: Skips invalid market entries and logs errors
- **Database Errors**: Comprehensive error logging for database operations
- **Authentication Failures**: Proper error responses for unauthorized access

## Logging

All sync operations are logged with:
- Timestamp
- Operation type (scheduled/manual)
- Success/failure status
- Number of markets processed
- Error details if any

## Monitoring

### Health Checks
- Monitor cron job status via `/api/v1/market-sync/cron/status`
- Check sync statistics via `/api/v1/market-sync/status`

### Alerts
- Failed syncs are logged as errors
- Database connection issues are logged
- API authentication failures are logged

## Troubleshooting

### Common Issues

1. **Cron Job Not Running**
   - Check if the service is running
   - Verify timezone settings
   - Check logs for initialization errors

2. **API Connection Failures**
   - Verify API credentials in `liveResultService.ts`
   - Check network connectivity
   - Verify API endpoint is accessible

3. **Database Errors**
   - Check MongoDB connection
   - Verify database permissions
   - Check disk space

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## Security

- **Authentication Required**: All endpoints require valid JWT tokens
- **Role-based Access**: Only authorized users can trigger syncs
- **Input Validation**: All API inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse

## Performance

- **Efficient Processing**: Only updates markets when data changes
- **Batch Operations**: Processes markets in sequence to avoid overwhelming the database
- **Memory Management**: Processes markets one at a time to manage memory usage
- **Timeout Handling**: API calls have proper timeout configurations
