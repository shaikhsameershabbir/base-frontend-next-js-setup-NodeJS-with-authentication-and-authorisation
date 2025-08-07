# Game System & Market Rules

## 📋 Table of Contents
1. [Market System Overview](#market-system-overview)
2. [Market Time Constraints](#market-time-constraints)
3. [Betting Rules & Game Types](#betting-rules--game-types)
4. [Winning Calculation System](#winning-calculation-system)
5. [Result Declaration System](#result-declaration-system)
6. [Market Status Logic](#market-status-logic)
7. [Game Validation Rules](#game-validation-rules)
8. [API Integration](#api-integration)

---

## 🎯 Market System Overview

The MK Matka system operates on a **market-based betting model** where each market represents a specific time window for betting and result declaration. Markets are the core entities that control when players can place bets and when results are declared.

### Market Structure
```typescript
interface Market {
  _id: string;
  name: string;
  openTime: string;      // Format: "HH:MM" or ISO date string
  closeTime: string;     // Format: "HH:MM" or ISO date string
  weekDays: string[];    // ["monday", "tuesday", etc.]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Market Examples
- **Market 1**: Open 9:00 AM, Close 2:00 PM
- **Market 2**: Open 2:00 PM, Close 9:00 PM  
- **Market 3**: Open 9:00 PM, Close 2:00 AM (next day)

---

## ⏰ Market Time Constraints

### Core Time Rules

1. **Market Day Definition**: Each market day starts at **12:00 AM (midnight)** and ends at **11:59 PM**
2. **Betting Window**: Players can bet from **12:00 AM** until **15 minutes before the market's close time**
3. **Loading Periods**: 15-minute loading windows before open and close times
4. **Timezone**: All times are handled in **Indian Standard Time (IST)**

### Detailed Time Logic

#### Market Status Calculation
```typescript
// Market Status States
enum MarketStatus {
  LOADING = "loading",      // 15 min before open/close
  OPEN = "open",           // Open for betting
  CLOSE_ONLY = "close",    // Only close games allowed
  CLOSED = "closed"        // Market closed
}
```

#### Time Windows Breakdown

| Time Period | Status | Allowed Game Types | Description |
|-------------|--------|-------------------|-------------|
| 12:00 AM → 15 min before `openTime` | `OPEN` | Both (open + close) | Full betting allowed |
| 15 min before `openTime` → `openTime` | `LOADING` | None | Loading period |
| `openTime` → 15 min before `closeTime` | `CLOSE_ONLY` | Close only | Only close games allowed |
| 15 min before `closeTime` → `closeTime` | `LOADING` | None | Loading period |
| After `closeTime` | `CLOSED` | None | Market closed |

### Time Validation Logic

```typescript
// Backend time validation (timeUtils.ts)
export const getMarketStatus = (market: Market, currentTime: Date) => {
  const openTime = parseTimeString(market.openTime);
  const closeTime = parseTimeString(market.closeTime);
  
  const openLoadingStart = subtractMinutes(openTime, 15);
  const closeLoadingStart = subtractMinutes(closeTime, 15);
  
  if (isInTimeRange(currentTime, openLoadingStart, openTime)) {
    return 'loading';
  }
  
  if (isInTimeRange(currentTime, openTime, closeLoadingStart)) {
    return 'close';
  }
  
  if (isInTimeRange(currentTime, closeLoadingStart, closeTime)) {
    return 'loading';
  }
  
  return 'closed';
};
```

---

## 🎮 Betting Rules & Game Types

### Available Game Types

#### 1. **Single Game**
- **Description**: Bet on a single digit (0-9)
- **Winning Rate**: 10x the bet amount
- **Example**: Bet ₹100 on "5" → Win ₹1000 if result is "5"

#### 2. **Double Game**
- **Description**: Bet on two digits (00-99)
- **Winning Rate**: 100x the bet amount
- **Example**: Bet ₹100 on "25" → Win ₹10,000 if result is "25"

#### 3. **Triple Game**
- **Description**: Bet on three digits (000-999)
- **Winning Rate**: 1000x the bet amount
- **Example**: Bet ₹100 on "123" → Win ₹100,000 if result is "123"

#### 4. **Single Panna**
- **Description**: Bet on panna numbers (000-999)
- **Winning Rate**: 150x the bet amount
- **Validation**: Must be valid panna number
- **Example**: Bet ₹100 on "123" → Win ₹15,000 if result contains "123"

#### 5. **Double Panna**
- **Description**: Bet on double panna numbers
- **Winning Rate**: 300x the bet amount
- **Validation**: Must be valid double panna number
- **Example**: Bet ₹100 on "123" → Win ₹30,000 if result contains "123"

#### 6. **Triple Panna**
- **Description**: Bet on triple panna numbers
- **Winning Rate**: 500x the bet amount
- **Validation**: Must be valid triple panna number
- **Example**: Bet ₹100 on "123" → Win ₹50,000 if result contains "123"

#### 7. **Half Sangam**
- **Description**: Combination of open and close numbers
- **Winning Rate**: 1500x the bet amount
- **Example**: Bet ₹100 → Win ₹150,000 if both open and close match

#### 8. **Full Sangam**
- **Description**: Complete combination of open, main, and close numbers
- **Winning Rate**: 5000x the bet amount
- **Example**: Bet ₹100 → Win ₹500,000 if all three numbers match

### Game Type Availability by Market Status

| Market Status | Open Games | Close Games | Combined Games |
|---------------|------------|-------------|----------------|
| `OPEN` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `CLOSE_ONLY` | ❌ Disabled | ✅ Allowed | ❌ Disabled |
| `LOADING` | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| `CLOSED` | ❌ Disabled | ❌ Disabled | ❌ Disabled |

---

## 💰 Winning Calculation System

### Win Amount Calculation Logic

```typescript
// Winning rates configuration
const WINNING_RATES = {
  single: 10,
  double: 100,
  triple: 1000,
  singlePanna: 150,
  doublePanna: 300,
  triplePanna: 500,
  halfSangam: 1500,
  fullSangam: 5000
};

// Calculate win amount for a bet
const calculateWinAmount = (bet: Bet, result: Result) => {
  const { gameType, betAmount, betNumber } = bet;
  const { open, main, close } = result;
  
  switch (gameType) {
    case 'single':
      return (open === betNumber || main === betNumber || close === betNumber) 
        ? betAmount * WINNING_RATES.single : 0;
    
    case 'double':
      return (open === betNumber || main === betNumber || close === betNumber)
        ? betAmount * WINNING_RATES.double : 0;
    
    case 'triple':
      return (open === betNumber || main === betNumber || close === betNumber)
        ? betAmount * WINNING_RATES.triple : 0;
    
    case 'singlePanna':
      return isPannaMatch(betNumber, [open, main, close])
        ? betAmount * WINNING_RATES.singlePanna : 0;
    
    // ... other game types
  }
};
```

### Panna Number Validation

```typescript
// Panna number validation rules
const validatePannaNumber = (number: string) => {
  const num = parseInt(number);
  
  // Single Panna: 000-999
  if (number.length === 3) {
    return num >= 0 && num <= 999;
  }
  
  // Double Panna: specific patterns
  if (number.length === 6) {
    // Double panna validation logic
    return isValidDoublePanna(number);
  }
  
  // Triple Panna: specific patterns
  if (number.length === 9) {
    // Triple panna validation logic
    return isValidTriplePanna(number);
  }
  
  return false;
};
```

---

## 📊 Result Declaration System

### Result Structure
```typescript
interface Result {
  _id: string;
  marketId: Market;
  weekStartDate: Date;
  weekEndDate: Date;
  results: {
    [dayName: string]: {
      open: number | null;
      main: number | null;
      close: number | null;
      openDeclationTime: Date | null;
      closeDeclationTime: Date | null;
    }
  };
  declaredBy: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Declaration Rules

1. **Open Result**: Can be declared anytime during the market's open period
2. **Close Result**: Can only be declared after the open result is declared
3. **Main Result**: Automatically calculated as the middle digit of the close result
4. **Weekly Storage**: Results are stored weekly with start/end dates
5. **Validation**: Close result must be a valid 3-digit number

### Declaration Logic

```typescript
// Check if close result can be declared
const canDeclareClose = (marketResult: Result, targetDate: Date) => {
  const dayName = getDayName(targetDate);
  const dayResult = marketResult.results[dayName];
  
  // Must have open result declared
  if (!dayResult?.open) return false;
  
  // Close result not already declared
  if (dayResult.close !== null) return false;
  
  return true;
};
```

---

## 🔄 Market Status Logic

### Frontend Status Display

```typescript
// Market status with color coding
const getMarketStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'text-green-600';
    case 'close': return 'text-orange-600';
    case 'loading': return 'text-yellow-600';
    case 'closed': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

// Market status text
const getMarketStatusText = (status: string) => {
  switch (status) {
    case 'open': return 'Open for Betting';
    case 'close': return 'Close Games Only';
    case 'loading': return 'Loading...';
    case 'closed': return 'Market Closed';
    default: return 'Unknown Status';
  }
};
```

### Real-time Status Updates

The system provides real-time market status updates through:
- **WebSocket connections** for live updates
- **Polling mechanism** for status refresh
- **Context-based state management** for consistent UI updates

---

## ✅ Game Validation Rules

### Frontend Validation

1. **Real-time Input Validation**
   - Panna number format checking
   - Bet amount limits
   - Game type availability based on market status

2. **UI Feedback**
   - Disabled buttons for unavailable games
   - Visual indicators for market status
   - Toast notifications for validation errors

### Backend Validation

1. **Server-side Validation**
   - Market status verification
   - Bet amount validation
   - Game type availability check
   - Time-based restrictions

2. **Database Constraints**
   - Unique bet validation
   - Balance verification
   - Transaction integrity

---

## 🔌 API Integration

### Market Status API
```typescript
// Get market status
GET /api/v1/market/:marketId/status
Response: {
  status: 'open' | 'close' | 'loading' | 'closed',
  currentTime: string,
  openTime: string,
  closeTime: string
}
```

### Betting API
```typescript
// Place a bet
POST /api/v1/bet
Body: {
  marketId: string,
  gameType: string,
  betNumber: string,
  betAmount: number
}
```

### Result API
```typescript
// Declare result
POST /api/v1/result
Body: {
  marketId: string,
  resultType: 'open' | 'close',
  resultNumber: number
}
```

---

## 🚀 Performance Optimizations

### API Call Optimization
- **Centralized Market Data Context** for reducing duplicate API calls
- **Caching mechanism** for market status and results
- **Batch API endpoints** for multiple market data
- **Debounced status updates** to prevent excessive requests

### Frontend Optimizations
- **Component-level caching** for market data
- **Lazy loading** for game components
- **Memoized calculations** for win amounts
- **Optimized re-renders** using React.memo

---

## 📝 Development Notes

### Time Handling Best Practices
1. **Always use IST timezone** for all time calculations
2. **Parse time strings carefully** - handle both "HH:MM" and ISO formats
3. **Account for timezone offsets** when converting ISO dates
4. **Use consistent time utilities** across frontend and backend

### Common Issues & Solutions
1. **"Invalid Date" errors**: Use robust time parsing functions
2. **Market status mismatches**: Ensure frontend/backend time logic alignment
3. **API call duplicates**: Implement proper caching and debouncing
4. **Timezone confusion**: Always convert to local time for display

### Testing Considerations
1. **Test all market status transitions** (open → close → loading → closed)
2. **Validate time boundaries** (15-minute loading windows)
3. **Test game type availability** for each market status
4. **Verify win calculations** across all game types
