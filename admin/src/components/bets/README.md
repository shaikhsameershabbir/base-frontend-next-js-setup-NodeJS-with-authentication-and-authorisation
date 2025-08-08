# Bets Components

This directory contains optimized, reusable components for the bets management functionality.

## Components

### BetsSummary
Displays summary cards showing total bets, amounts, open/close bets statistics.

**Props:**
- `summary`: Summary data object containing totalBets, totalAmount, openBets, openAmount, closeBets, closeAmount

### BetsFilters
Handles all filtering functionality including date filters and hierarchical user filters.

**Props:**
- `filters`: Current filter state
- `currentUserRole`: Current user's role (superadmin, admin, distributor, agent)
- `hierarchyOptions`: Available hierarchy options for each level
- `onFilterChange`: Callback for filter changes
- `onHierarchyChange`: Callback for hierarchy selection changes

### BetsTable
Displays the bets data in a table format with pagination.

**Props:**
- `bets`: Array of bet objects
- `loading`: Loading state
- `pagination`: Pagination data
- `onViewBet`: Callback for viewing bet details
- `onPageChange`: Callback for page changes

### ErrorDisplay
Displays error messages with dismiss functionality.

**Props:**
- `error`: Error message string
- `onClearError`: Callback to clear error

## Custom Hook

### useBetsManagement
A custom hook that manages all the bets page logic, separating business logic from UI components.

**Returns:**
- All state variables (bets, loading, error, summary, pagination, filters, etc.)
- All action handlers (handleFilterChange, handleHierarchyChange, handlePageChange, etc.)

## Usage

```tsx
import { BetsSummary, BetsFilters, BetsTable, ErrorDisplay } from '@/components/bets';
import { useBetsManagement } from '@/hooks/useBetsManagement';

export default function BetsPage() {
    const {
        bets,
        loading,
        error,
        summary,
        pagination,
        filters,
        hierarchyOptions,
        currentUserRole,
        selectedBetId,
        isDetailModalOpen,
        handleFilterChange,
        handleHierarchyChange,
        handlePageChange,
        handleViewBet,
        handleCloseModal,
        clearError,
        getBets
    } = useBetsManagement();

    return (
        <AdminLayout>
            <BetsSummary summary={summary} />
            <BetsFilters
                filters={filters}
                currentUserRole={currentUserRole}
                hierarchyOptions={hierarchyOptions}
                onFilterChange={handleFilterChange}
                onHierarchyChange={handleHierarchyChange}
            />
            <ErrorDisplay error={error} onClearError={clearError} />
            <BetsTable
                bets={bets}
                loading={loading}
                pagination={pagination}
                onViewBet={handleViewBet}
                onPageChange={handlePageChange}
            />
        </AdminLayout>
    );
}
```

## Benefits

1. **Separation of Concerns**: UI components are separated from business logic
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Each component has a single responsibility
4. **Testability**: Components can be tested in isolation
5. **Performance**: Optimized with proper memoization and callbacks
6. **Type Safety**: Full TypeScript support with proper interfaces
