# Auto Result System

## Overview
The Auto Result System automatically fetches and declares results for markets with `autoResult: true` based on their open and close times. It integrates with the existing Live Result Service to get real-time results from the third-party API.

## Features

### 🔄 **Automatic Result Declaration**
- **Open Results**: Automatically declared at market open time
- **Close Results**: Automatically declared at market close time
- **Smart Timing**: Checks results within 5 minutes of scheduled times
- **Date Validation**: Ensures results are for the current date

### ⏰ **Time-Based Processing**
- **Open Time**: Fetches results when market opens (e.g., 10:00 AM)
- **Close Time**: Fetches results when market closes (e.g., 11:00 AM)
- **Continuous Monitoring**: Checks every minute during market hours
- **Overnight Markets**: Handles markets that operate across midnight

### 📊 **Result Format Parsing**
- **Open Result**: `"336-2"` → Open: 336, Main: 2
- **Close Result**: `"336-20-569"` → Close: 569, Combined Main: 20
- **Main Calculation**: Automatically combines open and close main values

### 🛡️ **Safety Features**
- **Duplicate Prevention**: Won't declare results twice
- **Validation**: Ensures 3-digit panna numbers (100-999)
- **Error Handling**: Comprehensive logging and error recovery
- **Market Status**: Only processes active markets

## Architecture

### **Core Components**

1. **AutoResultService** (`src/services/autoResultService.ts`)
   - Main service managing auto result functionality
   - Cron job management for each market
   - Result parsing and validation
   - Database operations

2. **AutoResultController** (`src/api/v1/controllers/autoResult.controller.ts`)
   - REST API endpoints for service management
   - Status monitoring and control
   - Market management

3. **AutoResult Routes** (`src/api/v1/routes/autoResult.routes.ts`)
   - API routing for auto result operations
   - Superadmin-only access

### **Integration Points**

- **Market Model**: Uses `autoResult` boolean field
- **Result Model**: Stores declared results
- **Live Result Service**: Fetches third-party API data
- **Winning Calculation Service**: Calculates winnings automatically

## API Endpoints

### **Service Management**
```
GET    /api/v1/auto-result/status          # Get service status
POST   /api/v1/auto-result/start           # Start service
POST   /api/v1/auto-result/stop            # Stop service
POST   /api/v1/auto-result/restart         # Restart service
```

### **Market Management**
```
POST   /api/v1/auto-result/market/:id/add    # Add market to auto result
DELETE /api/v1/auto-result/market/:id/remove # Remove market from auto result
```

### **Monitoring & Logs**
```
GET    /api/v1/auto-result/market/:id/logs   # Get market logs
GET    /api/v1/auto-result/logs              # Get all logs
```

## Configuration

### **Market Setup**
```typescript
// Enable auto result for a market
{
  marketName: "KALYAN",
  openTime: "10:00",      // 24-hour format
  closeTime: "11:00",     // 24-hour format
  weekDays: 7,            // Days per week
  autoResult: true,       // Enable auto result
  isActive: true          // Market must be active
}
```

### **Time Format**
- **Open Time**: `"10:00"` (10:00 AM)
- **Close Time**: `"11:00"` (11:00 AM)
- **24-hour format** for consistency

## How It Works

### **1. Initialization**
```typescript
// Service starts automatically when app starts
const autoResultService = new AutoResultService();

// Finds all markets with autoResult: true
// Sets up cron jobs for each market
```

### **2. Open Time Processing**
```typescript
// At 10:00 AM (market open time)
1. Fetch live results from third-party API
2. Find result for "KALYAN" market
3. Parse open result: "336-2"
4. Declare: Open = 336, Main = 2
5. Calculate open winnings
6. Save to database
```

### **3. Close Time Processing**
```typescript
// At 11:00 AM (market close time)
1. Fetch live results from third-party API
2. Find result for "KALYAN" market
3. Parse close result: "336-20-569"
4. Declare: Close = 569
5. Calculate combined main: 20
6. Calculate close winnings
7. Update database
```

### **4. Result Parsing Examples**

#### **Open Result**
```
Input: "336-2"
Output:
- Open: 336
- Main: 2
- Close: null
```

#### **Close Result**
```
Input: "336-20-569"
Output:
- Open: 336 (existing)
- Main: 20 (combined)
- Close: 569
```

## Error Handling

### **Common Scenarios**
1. **No Result Found**: Logs info, continues monitoring
2. **Invalid Format**: Logs warning, skips declaration
3. **API Errors**: Logs error, retries on next cycle
4. **Database Errors**: Logs error, continues operation

### **Logging Levels**
- **INFO**: Normal operations, successful declarations
- **WARN**: Format issues, validation failures
- **ERROR**: System errors, API failures

## Monitoring

### **Service Status**
```typescript
{
  isRunning: true,
  activeMarkets: 5,
  markets: [
    {
      _id: "market123",
      marketName: "KALYAN",
      openTime: "10:00",
      closeTime: "11:00",
      weekDays: 7
    }
  ]
}
```

### **Market Logs**
```typescript
{
  marketId: "market123",
  marketName: "KALYAN",
  date: "2025-01-27",
  dayName: "monday",
  result: {
    open: 336,
    main: 20,
    close: 569,
    openDeclationTime: "2025-01-27T10:00:00Z",
    closeDeclationTime: "2025-01-27T11:00:00Z"
  }
}
```

## Security

### **Access Control**
- **Superadmin Only**: All auto result operations require superadmin role
- **Authentication Required**: JWT token validation
- **Market Isolation**: Users can only access assigned markets

### **Data Validation**
- **Input Sanitization**: All inputs are validated and sanitized
- **Type Safety**: TypeScript interfaces ensure data integrity
- **SQL Injection Protection**: Mongoose provides built-in protection

## Performance

### **Optimization Features**
- **Cron Jobs**: Efficient scheduling per market
- **Minute-based Checks**: Only during market hours
- **Smart Filtering**: Skips markets with completed results
- **Async Operations**: Non-blocking result processing

### **Resource Usage**
- **Memory**: Minimal memory footprint
- **CPU**: Low CPU usage during idle periods
- **Network**: API calls only when needed
- **Database**: Optimized queries and indexing

## Troubleshooting

### **Common Issues**

1. **Service Not Starting**
   - Check database connection
   - Verify market data integrity
   - Check logs for initialization errors

2. **Results Not Declaring**
   - Verify market `autoResult: true`
   - Check market `isActive: true`
   - Verify open/close times
   - Check third-party API status

3. **Timing Issues**
   - Verify timezone settings
   - Check market time formats
   - Ensure 5-minute buffer is sufficient

### **Debug Commands**
```bash
# Check service status
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/auto-result/status

# Restart service
curl -X POST -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/auto-result/restart

# Check market logs
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/auto-result/market/<marketId>/logs
```

## Future Enhancements

### **Planned Features**
1. **WebSocket Notifications**: Real-time result updates
2. **Advanced Scheduling**: Custom time patterns
3. **Result Templates**: Predefined result formats
4. **Analytics Dashboard**: Performance metrics
5. **Mobile Notifications**: Push notifications for results

### **Scalability Improvements**
1. **Queue System**: Redis-based job queuing
2. **Load Balancing**: Multiple service instances
3. **Caching**: Result caching for performance
4. **Microservices**: Service decomposition

## Support

For technical support or questions about the Auto Result System:
- Check application logs for detailed error information
- Verify market configuration and timing settings
- Ensure third-party API is accessible
- Contact system administrator for persistent issues
