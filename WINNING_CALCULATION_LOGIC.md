# Complete Winning Calculation Logic Documentation

## Overview
This document outlines the complete winning calculation logic for the Matka betting system, including all bet types, calculation methods, and implementation details for both frontend and backend.

## Table of Contents
1. [Bet Types and Rates](#bet-types-and-rates)
2. [Main Value Calculation](#main-value-calculation)
3. [Open Result Calculations](#open-result-calculations)
4. [Close Result Calculations](#close-result-calculations)
5. [Sangam Bet Calculations](#sangam-bet-calculations)
6. [Implementation Details](#implementation-details)
7. [Helper Functions](#helper-functions)
8. [Examples](#examples)

---

## Bet Types and Rates

### Winning Rates
```typescript
const WINNING_RATES = {
    single: 9,           // Single number (0-9)
    double: 90,          // Double number (00-99)
    singlePanna: 150,    // Single panna (3-digit)
    doublePanna: 300,    // Double panna (3-digit)
    triplePanna: 900,    // Triple panna (3-digit)
    halfSangam: 1500,    // Half sangam
    fullSangam: 10000    // Full sangam
};
```

### Valid Numbers
- **Single Numbers**: 0-9
- **Double Numbers**: 00-99
- **Single Panna**: 100-999 (specific valid numbers)
- **Double Panna**: 100-999 (specific valid numbers)
- **Triple Panna**: 000-999 (specific valid numbers)

---

## Main Value Calculation

### Logic
The main value is calculated from the digit sum of a 3-digit number:
1. Sum all digits of the 3-digit number
2. If sum > 9, take the last digit (sum % 10)
3. If sum ≤ 9, use the sum as is

### Implementation
```typescript
const calculateDigitSum = (number: number): number => {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

const calculateMainValue = (number: number): number => {
    const digitSum = calculateDigitSum(number);
    return digitSum > 9 ? digitSum % 10 : digitSum;
};
```

### Examples
- 123 → 1+2+3 = 6 → Main = 6
- 456 → 4+5+6 = 15 → Main = 5 (15 % 10)
- 789 → 7+8+9 = 24 → Main = 4 (24 % 10)

---

## Open Result Calculations

### Single Number (0-9)
- **Bet Type**: Single number bet
- **Calculation**: `betAmount × 9`
- **Example**: Bet ₹100 on 5, Result 5 → Win ₹900

### Double Number (00-99)
- **Bet Type**: Double number bet
- **Calculation**: `betAmount × 90`
- **Example**: Bet ₹100 on 25, Result 25 → Win ₹9,000

### Panna Numbers (3-digit)
For 3-digit results, calculate both:
1. **Panna Win**: `betAmount × pannaRate`
2. **Digit Sum Win**: `singleNumberBet × 9`

#### Single Panna
- **Panna Rate**: 150x
- **Example**: Result 123
  - Panna bet on 123: ₹100 → Win ₹15,000
  - Single bet on 6 (1+2+3): ₹50 → Win ₹450
  - Total Win: ₹15,450

#### Double Panna
- **Panna Rate**: 300x
- **Example**: Result 456
  - Panna bet on 456: ₹100 → Win ₹30,000
  - Single bet on 5 (4+5+6=15→5): ₹50 → Win ₹450
  - Total Win: ₹30,450

#### Triple Panna
- **Panna Rate**: 900x
- **Example**: Result 789
  - Panna bet on 789: ₹100 → Win ₹90,000
  - Single bet on 4 (7+8+9=24→4): ₹50 → Win ₹450
  - Total Win: ₹90,450

---

## Close Result Calculations

Close results include all open calculations PLUS additional calculations based on the open result.

### Base Calculations (Same as Open)
1. **Panna Win**: `betAmount × pannaRate`
2. **Digit Sum Win**: `singleNumberBet × 9`

### Additional Close Calculations

#### 1. Combined Main Win
- **Logic**: Combine open main + close main
- **Calculation**: `doubleNumberBet × 90`
- **Example**: 
  - Open: 123 (main=6), Close: 456 (main=5)
  - Combined: 65
  - Double bet on 65: ₹100 → Win ₹9,000

#### 2. Half Sangam Open
- **Pattern**: `openMain X closePanna`
- **Rate**: 1,500x
- **Example**: Open main=6, Close=456
  - Pattern: `6X456`
  - Bet: ₹100 → Win ₹150,000

#### 3. Half Sangam Close
- **Pattern**: `openPanna X closeMain`
- **Rate**: 1,500x
- **Example**: Open=123, Close main=5
  - Pattern: `123X5`
  - Bet: ₹100 → Win ₹150,000

#### 4. Full Sangam
- **Pattern**: `openPanna X combinedDigitSums X closePanna`
- **Rate**: 10,000x
- **Calculation**: 
  - Open digit sum + Close digit sum
  - Example: Open=123 (sum=6), Close=456 (sum=15→5)
  - Combined: 65
  - Pattern: `123X65X456`
  - Bet: ₹100 → Win ₹1,000,000

---

## Sangam Bet Calculations

### Half Sangam Open
```typescript
const halfSangamOpenPattern = `${openMain}X${closePanna}`;
const halfSangamOpenAmount = processedData.halfSangamOpen[halfSangamOpenPattern] || 0;
const halfSangamOpenWin = halfSangamOpenAmount * WINNING_RATES.halfSangam;
```

### Half Sangam Close
```typescript
const halfSangamClosePattern = `${openPanna}X${closeMain}`;
const halfSangamCloseAmount = processedData.halfSangamClose[halfSangamClosePattern] || 0;
const halfSangamCloseWin = halfSangamCloseAmount * WINNING_RATES.halfSangam;
```

### Full Sangam
```typescript
const openDigitSum = calculateDigitSum(parseInt(openResult));
const closeDigitSum = calculateDigitSum(parseInt(closeResult));
const combinedDigitSums = `${openDigitSum}${closeDigitSum}`;
const fullSangamPattern = `${openResult}X${combinedDigitSums}X${closeResult}`;
const fullSangamAmount = processedData.fullSangam[fullSangamPattern] || 0;
const fullSangamWin = fullSangamAmount * WINNING_RATES.fullSangam;
```

---

## Implementation Details

### Backend Implementation

#### 1. Main Value Calculation
```typescript
// In declareResult.controller.ts
const digitSum = resultNumber.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
const mainValue = digitSum > 9 ? digitSum % 10 : digitSum;
```

#### 2. Combined Main (Close Only)
```typescript
// For close results
const openMain = dayResult.main || 0;
const closeMain = mainValue;
const combinedMain = parseInt(openMain.toString() + closeMain.toString());
const finalMain = combinedMain > 99 ? combinedMain % 100 : combinedMain;
```

#### 3. Bet Result Updates
```typescript
// Update bet with win amount or mark as loss
if (totalWinAmount > 0) {
    bet.winAmount = totalWinAmount;
    bet.result = 'won';
} else {
    bet.winAmount = 0;
    bet.result = 'loss';
}
```

### Frontend Implementation

#### 1. Helper Functions
```typescript
const calculateDigitSum = (number: number): number => {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

const calculateMainValue = (number: number): number => {
    const digitSum = calculateDigitSum(number);
    return digitSum > 9 ? digitSum % 10 : digitSum;
};
```

#### 2. Win Amount Calculation
```typescript
// For panna games
const pannaWin = pannaAmount * WINNING_RATES[gameType];
const digitSum = calculateMainValue(parseInt(resultNumber));
const singleNumberAmount = processedData.singleNumbers[digitSum.toString()] || 0;
const digitSumWin = singleNumberAmount * WINNING_RATES.single;
totalWinAmount = pannaWin + digitSumWin;
```

---

## Helper Functions

### Backend (winningCalculation.service.ts)
```typescript
function calculateDigitSum(number: number): number {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
}

function getLastDigit(number: number): number {
    return number % 10;
}

function checkBetMatch(betNumber: string, resultNumber: string): boolean {
    return betNumber === resultNumber.toString();
}

function getNumberTypeAndRate(number: string): { type: string; rate: number } {
    const num = parseInt(number);
    if (number.length === 1) return { type: 'single', rate: 9 };
    if (number.length === 2) return { type: 'double', rate: 90 };
    // Add panna logic here
    return { type: 'unknown', rate: 0 };
}
```

### Frontend (FiltersSection.tsx)
```typescript
const calculateDigitSum = (number: number): number => {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

const calculateMainValue = (number: number): number => {
    const digitSum = calculateDigitSum(number);
    return digitSum > 9 ? digitSum % 10 : digitSum;
};
```

---

## Examples

### Example 1: Open Result
**Result**: 123
**Bets**:
- Single bet on 6 (1+2+3): ₹100
- Panna bet on 123: ₹200

**Calculations**:
- Single win: ₹100 × 9 = ₹900
- Panna win: ₹200 × 150 = ₹30,000
- Total: ₹30,900

### Example 2: Close Result
**Open**: 123 (main=6)
**Close**: 456 (main=5)
**Bets**:
- Single bet on 5: ₹100
- Panna bet on 456: ₹200
- Double bet on 65: ₹50
- Half sangam open (6X456): ₹100
- Half sangam close (123X5): ₹100
- Full sangam (123X65X456): ₹100

**Calculations**:
- Single win: ₹100 × 9 = ₹900
- Panna win: ₹200 × 300 = ₹60,000
- Combined main win: ₹50 × 90 = ₹4,500
- Half sangam open: ₹100 × 1,500 = ₹150,000
- Half sangam close: ₹100 × 1,500 = ₹150,000
- Full sangam: ₹100 × 10,000 = ₹1,000,000
- Total: ₹1,365,400

### Example 3: Main Value Calculation
**Number**: 789
**Calculation**: 7+8+9 = 24 → 24 % 10 = 4
**Main Value**: 4

---

## Important Notes

### 1. Main Value Limit
- Combined main values are limited to 2 digits
- If combined main > 99, use `combinedMain % 100`

### 2. Full Sangam Pattern
- Format: `openPanna X combinedDigitSums X closePanna`
- Combined digit sums: `openDigitSum + closeDigitSum`
- Example: Open=123 (sum=6), Close=456 (sum=15→5) → Pattern: `123X65X456`

### 3. Bet Result Updates
- All bets are updated with result ('won' or 'loss')
- Win amounts are calculated for winning bets
- Loss bets get winAmount = 0

### 4. Data Processing
- Backend processes individual bets
- Frontend aggregates bet amounts
- Both use identical calculation logic

### 5. Date Filtering
- Backend uses startOfDay/endOfDay for date filtering
- Frontend should apply same date range for consistency

---

## Debug Functions

### Frontend Debug
```typescript
const debugCalculation = (processedData, resultNumber, resultType, marketResults) => {
    console.log('=== FRONTEND CALCULATION DEBUG ===');
    // Log all calculation steps
    console.log('=== END FRONTEND DEBUG ===');
};
```

### Backend Debug
```typescript
console.log(`Bet ${bet._id}: Number ${number} matches result ${resultNumber}, win amount: ${winAmount}`);
console.log(`Full sangam match: ${betKey} = ${fullSangamPattern}, win amount: ${winAmount}`);
```

---

This document serves as a complete reference for implementing winning calculations in the Matka betting system. All calculations should follow this logic for consistency between frontend and backend implementations.
