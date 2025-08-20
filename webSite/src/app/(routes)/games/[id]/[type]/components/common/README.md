# Common Game Components

This directory contains reusable components that can be used across all game components to reduce code duplication while maintaining the exact same UI.

## Components

### 1. `AmountSelection`
Reusable amount selection grid with the same styling and behavior across all games.

**Props:**
- `selectedAmount: number | null` - Currently selected amount
- `onAmountSelect: (amount: number) => void` - Callback when amount is selected
- `amountOptions?: number[]` - Array of amount options (defaults to [5, 10, 50, 100, 200, 500, 1000, 5000])

**Usage:**
```tsx
import { AmountSelection } from './common';

<AmountSelection
  selectedAmount={selectedAmount}
  onAmountSelect={handleAmountSelect}
  amountOptions={[10, 20, 50, 100]}
/>
```

### 2. `TotalDisplay`
Reusable total amount display with gradient background.

**Props:**
- `total: number` - Total amount to display

**Usage:**
```tsx
import { TotalDisplay } from './common';

<TotalDisplay total={totalAmount} />
```

### 3. `ActionButtons`
Reusable action buttons (Reset and Submit) with consistent styling.

**Props:**
- `onReset: () => void` - Reset button click handler
- `onSubmit: () => void` - Submit button click handler
- `isSubmitting: boolean` - Loading state
- `isSubmitDisabled: boolean` - Whether submit button should be disabled
- `submitText?: string` - Custom submit button text (defaults to "Submit")
- `loadingText?: string` - Custom loading text (defaults to "Placing Bet...")

**Usage:**
```tsx
import { ActionButtons } from './common';

<ActionButtons
  onReset={handleReset}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  isSubmitDisabled={total === 0}
  submitText="Place Bet"
  loadingText="Processing..."
/>
```

### 4. `GameHeader`
Reusable game header with market name, game type, and optional bet type buttons.

**Props:**
- `marketName: string` - Name of the market
- `gameTypeName: string` - Display name of the game type
- `statusColor?: 'green' | 'red'` - Status indicator color (defaults to 'green')
- `showBetTypeButtons?: boolean` - Whether to show OPEN/CLOSE buttons (defaults to false)
- `selectedBetType?: 'open' | 'close' | 'both'` - Currently selected bet type
- `onBetTypeChange?: (type: 'open' | 'close' | 'both') => void` - Bet type change handler
- `openAllowed?: boolean` - Whether open betting is allowed
- `closeAllowed?: boolean` - Whether close betting is allowed
- `betTypeDisplay?: string` - Static text to display instead of buttons (e.g., "BOTH")

**Usage:**
```tsx
import { GameHeader } from './common';

// With bet type buttons
<GameHeader
  marketName="Market Name"
  gameTypeName="Single Game"
  showBetTypeButtons={true}
  selectedBetType={selectedBetType}
  onBetTypeChange={setSelectedBetType}
  openAllowed={checkBetTypeAllowed('open')}
  closeAllowed={checkBetTypeAllowed('close')}
/>

// With static bet type display
<GameHeader
  marketName="Market Name"
  gameTypeName="Jodi Game"
  betTypeDisplay="BOTH"
/>
```

### 5. `FormLayout`
Reusable form wrapper with consistent spacing.

**Props:**
- `children: React.ReactNode` - Form content
- `onSubmit: (e: React.FormEvent) => void` - Form submit handler
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { FormLayout } from './common';

<FormLayout onSubmit={handleSubmit}>
  {/* Form content */}
</FormLayout>
```

### 6. `AmountAndTotalSection`
Combines amount selection and total display in the common grid layout.

**Props:**
- `selectedAmount: number | null` - Currently selected amount
- `onAmountSelect: (amount: number) => void` - Amount selection handler
- `total: number` - Total amount
- `amountOptions?: number[]` - Amount options array

**Usage:**
```tsx
import { AmountAndTotalSection } from './common';

<AmountAndTotalSection
  selectedAmount={selectedAmount}
  onAmountSelect={handleAmountSelect}
  total={total}
  amountOptions={[5, 10, 50, 100]}
/>
```

## Migration Guide

To migrate existing game components to use these common components:

1. **Import the common components:**
```tsx
import { 
  GameHeader, 
  FormLayout, 
  AmountAndTotalSection, 
  ActionButtons 
} from './common';
```

2. **Replace the header section:**
```tsx
// Before
<div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 mb-2 sm:mb-4 border border-gray-100">
  {/* Complex header code */}
</div>

// After
<GameHeader
  marketName={marketName}
  gameTypeName={getGameTypeName(gameType)}
  // ... other props
/>
```

3. **Replace the amount and total section:**
```tsx
// Before
<div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
  {/* Amount selection code */}
  {/* Total display code */}
</div>

// After
<AmountAndTotalSection
  selectedAmount={selectedAmount}
  onAmountSelect={handleAmountSelect}
  total={total}
/>
```

4. **Replace the action buttons:**
```tsx
// Before
<div className="flex gap-2 sm:gap-3">
  {/* Reset and submit buttons */}
</div>

// After
<ActionButtons
  onReset={handleReset}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  isSubmitDisabled={total === 0}
/>
```

5. **Wrap the form:**
```tsx
// Before
<form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
  {/* Form content */}
</form>

// After
<FormLayout onSubmit={handleSubmit}>
  {/* Form content */}
</FormLayout>
```

## Benefits

- **Reduced Code Duplication**: Common UI elements are defined once
- **Consistent Styling**: All games use the same visual components
- **Easier Maintenance**: Changes to common elements apply to all games
- **Better Type Safety**: TypeScript interfaces for all props
- **Same UI**: No visual changes when migrating

## Example Migration

See `SingleGame.tsx` for a complete example of how to migrate an existing component to use these common components.
