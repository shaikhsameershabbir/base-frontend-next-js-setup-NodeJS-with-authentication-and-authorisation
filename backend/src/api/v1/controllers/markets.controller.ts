import { Request, Response } from 'express';
import { Market } from '../../../models/Market';
import { logger } from '../../../config/logger';

export class MarketsController {
    async getAllMarkets(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: { status?: string } = {};
            if (status) {
                query.status = status as string;
            }

            const markets = await Market.find(query)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Market.countDocuments(query);

            res.json({
                success: true,
                message: 'Markets retrieved successfully',
                data: markets,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMarketById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const market = await Market.findById(id);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market retrieved successfully',
                data: { market }
            });
        } catch (error) {
            logger.error('Get market by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async createMarket(req: Request, res: Response): Promise<void> {
        try {
            const { marketName, openTime, closeTime } = req.body;

            // Check if market already exists
            const existingMarket = await Market.findOne({ marketName });
            if (existingMarket) {
                res.status(409).json({
                    success: false,
                    message: 'Market with this name already exists'
                });
                return;
            }

            const newMarket = new Market({
                marketName,
                openTime,
                closeTime,
                isActive: true
            });

            await newMarket.save();

            res.status(201).json({
                success: true,
                message: 'Market created successfully',
                data: { market: newMarket }
            });
        } catch (error) {
            logger.error('Create market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateMarket(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market updated successfully',
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Update market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteMarket(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const deletedMarket = await Market.findByIdAndDelete(id);
            if (!deletedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market deleted successfully'
            });
        } catch (error) {
            logger.error('Delete market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateMarketStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                { isActive },
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market status updated successfully',
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Update market status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 