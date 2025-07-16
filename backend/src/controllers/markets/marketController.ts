import { Request, Response } from 'express';
import { Market } from '../../models/Market';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        username: string;
        role: string;
    };
}

export const getMarkets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { search = '', page = 1, limit = 10, status } = req.query as { search?: string; page?: string | number; limit?: string | number; status?: string };
        const query: Record<string, unknown> = {};
        if (search) query.marketName = { $regex: search, $options: 'i' };
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const total = await Market.countDocuments(query);
        const markets = await Market.find(query)
            .sort({ createdAt: -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit);

        res.json({
            success: true,
            data: {
                markets,
                pagination: {
                    page: +page,
                    limit: +limit,
                    total,
                    totalPages: Math.ceil(total / +limit)
                }
            }
        });
        return;
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
};

export const createMarket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        console.log('------------------------------------------------->>');
        const { marketName, openTime, closeTime } = req.body;
        const createdBy = req.user?.username || req.user?.userId;
        if (!marketName || !openTime || !closeTime) {
            res.status(400).json({ success: false, message: 'All fields required' });
            return;
        }
        const market = new Market({ marketName, openTime, closeTime, createdBy });
        await market.save();
        res.status(201).json({ success: true, data: { market } });
        return;
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
};

export const updateMarket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { marketId } = req.params;
        const { marketName, openTime, closeTime } = req.body;
        const market = await Market.findById(marketId);
        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }
        if (marketName) market.marketName = marketName;
        if (openTime) market.openTime = openTime;
        if (closeTime) market.closeTime = closeTime;
        await market.save();
        res.json({ success: true, data: { market } });
        return;
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
};

export const deleteMarket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { marketId } = req.params;
        await Market.findByIdAndDelete(marketId);
        res.json({ success: true, message: 'Market deleted' });
        return;
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
};

export const toggleMarketActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { marketId } = req.params;
        const market = await Market.findById(marketId);
        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }
        market.isActive = !market.isActive;
        await market.save();
        res.json({ success: true, data: { market } });
        return;
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
    }
}; 