import { Transfer } from '../models/Transfer';
import { logger } from '../config/logger';

export interface TransferLogData {
    fromUser: string;
    toUser: string;
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
    adminNote?: string;
    processedBy: string;
    fromUserBalanceBefore: number;
    fromUserBalanceAfter: number;
    toUserBalanceBefore: number;
    toUserBalanceAfter: number;
}

/**
 * Creates a transfer log entry for balance changes
 */
export async function createTransferLog(data: TransferLogData): Promise<void> {
    try {
        const transfer = new Transfer({
            fromUser: data.fromUser,
            toUser: data.toUser,
            amount: data.amount,
            type: data.type,
            reason: data.reason,
            adminNote: data.adminNote,
            processedBy: data.processedBy,
            status: 'completed',
            fromUserBalanceBefore: data.fromUserBalanceBefore,
            fromUserBalanceAfter: data.fromUserBalanceAfter,
            toUserBalanceBefore: data.toUserBalanceBefore,
            toUserBalanceAfter: data.toUserBalanceAfter
        });

        await transfer.save();
        logger.info(`Transfer log created: ${data.type} ${data.amount} from ${data.fromUser} to ${data.toUser} - ${data.reason}`);
    } catch (error) {
        logger.error('Error creating transfer log:', error);
        // Don't throw error to avoid breaking the main operation
    }
}

/**
 * Creates a system transfer log for bet placement (user to market)
 */
export async function createBetTransferLog(
    userId: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    betId: string,
    marketName: string,
    gameType: string
): Promise<void> {
    // For bet placement, we need to create a system user ID for the market
    // Using a special system user ID that represents the market
    const marketSystemUserId = '000000000000000000000000'; // Special system user ID for market

    await createTransferLog({
        fromUser: userId,
        toUser: marketSystemUserId, // User to Market
        amount: amount,
        type: 'debit',
        reason: `Bet placed - ${gameType} in ${marketName}`,
        adminNote: `Bet ID: ${betId}`,
        processedBy: userId,
        fromUserBalanceBefore: balanceBefore,
        fromUserBalanceAfter: balanceAfter,
        toUserBalanceBefore: 0, // Market balance (system)
        toUserBalanceAfter: 0   // Market balance (system)
    });
}

/**
 * Creates a system transfer log for bet claiming (market to user)
 */
export async function createClaimTransferLog(
    userId: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    betIds: string[]
): Promise<void> {
    // For claims, we need to create a system user ID for the market
    // Using a special system user ID that represents the market
    const marketSystemUserId = '000000000000000000000000'; // Special system user ID for market

    await createTransferLog({
        fromUser: marketSystemUserId, // Market to User
        toUser: userId,
        amount: amount,
        type: 'credit',
        reason: `Winning tickets claimed - ${betIds.length} tickets`,
        adminNote: `Bet IDs: ${betIds.join(', ')}`,
        processedBy: userId,
        fromUserBalanceBefore: 0, // Market balance (system)
        fromUserBalanceAfter: 0,  // Market balance (system)
        toUserBalanceBefore: balanceBefore,
        toUserBalanceAfter: balanceAfter
    });
}

/**
 * Creates a transfer log for manual credit/debit operations
 */
export async function createManualTransferLog(
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: 'credit' | 'debit',
    reason: string,
    adminNote: string,
    processedBy: string,
    fromUserBalanceBefore: number,
    fromUserBalanceAfter: number,
    toUserBalanceBefore: number,
    toUserBalanceAfter: number
): Promise<void> {
    await createTransferLog({
        fromUser: fromUserId,
        toUser: toUserId,
        amount: amount,
        type: type,
        reason: reason,
        adminNote: adminNote,
        processedBy: processedBy,
        fromUserBalanceBefore: fromUserBalanceBefore,
        fromUserBalanceAfter: fromUserBalanceAfter,
        toUserBalanceBefore: toUserBalanceBefore,
        toUserBalanceAfter: toUserBalanceAfter
    });
}
