import { Request, Response } from 'express';
import { Bet } from '../../../models/Bet';

export const getAllLoads = async (req: Request, res: Response) => {
    try {
        // Get date from query or use today
        const { date } = req.query;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let start: Date, end: Date;
        if (date) {
            start = new Date(date as string);
            end = new Date(start);
            end.setDate(start.getDate() + 1);
        } else {
            start = today;
            end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }

        // Get all bets for the date
        const bets = await Bet.find({
            createdAt: { $gte: start, $lt: end }
        }).lean();

        console.log('Raw bets:', bets); // Debug: see the actual bet structure

        // Types to group by
        const types = [
            'single', 'jodi', 'single_panna', 'double_panna', 'triple_panna',
            'motor_sp', 'motor_dp', 'common_sp', 'common_dp', 'common_sp_dp',
            'panna', 'sangam', 'half_bracket', 'full_bracket', 'family_panel', 'cycle_panna'
        ];

        // Group and aggregate
        const result: Record<string, Record<string, number>> = {};
        for (const type of types) {
            result[type] = {};
        }

        // Special handling for sangam types
        result.half_sangam_close = {};
        result.half_sangam_open = {};
        result.full_sangam = {};

        for (const bet of bets) {
            const type = bet.type;

            // Special handling for sangam
            if (type === 'sangam') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Categorize sangam bets
                for (const [key, value] of Object.entries(numbersObj)) {
                    if (key.includes('9X')) {
                        // half_sangam_close
                        if (!result.half_sangam_close[key]) result.half_sangam_close[key] = 0;
                        result.half_sangam_close[key] += value;
                    } else if (key.includes('X') && !key.includes('9X')) {
                        // half_sangam_open
                        if (!result.half_sangam_open[key]) result.half_sangam_open[key] = 0;
                        result.half_sangam_open[key] += value;
                    } else if (key.includes('-')) {
                        // full_sangam
                        if (!result.full_sangam[key]) result.full_sangam[key] = 0;
                        result.full_sangam[key] += value;
                    } else {
                        // fallback to regular sangam
                        if (!result[type][key]) result[type][key] = 0;
                        result[type][key] += value;
                    }
                }
                continue; // Skip the regular processing for sangam
            }

            // Special handling for jodi - format keys as 2-digit numbers
            if (type === 'jodi') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Format jodi keys as 2-digit numbers
                for (const [key, value] of Object.entries(numbersObj)) {
                    const formattedKey = key.padStart(2, '0'); // Convert 1 to 01, 2 to 02, etc.
                    if (!result[type][formattedKey]) result[type][formattedKey] = 0;
                    result[type][formattedKey] += value;
                }
                continue; // Skip the regular processing for jodi
            }

            // Special handling for family_panel - format keys as 2-digit numbers
            if (type === 'family_panel') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Format family_panel keys as 2-digit numbers
                for (const [key, value] of Object.entries(numbersObj)) {
                    const formattedKey = key.padStart(2, '0'); // Convert 1 to 01, 2 to 02, etc.
                    if (!result[type][formattedKey]) result[type][formattedKey] = 0;
                    result[type][formattedKey] += value;
                }
                continue; // Skip the regular processing for family_panel
            }

            if (!result[type]) result[type] = {};

            // Handle selectedNumbers - parse the object structure
            let numbersObj: Record<string, number> = {};

            if (typeof bet.selectedNumbers === 'string') {
                try {
                    numbersObj = JSON.parse(bet.selectedNumbers);
                } catch {
                    numbersObj = { [bet.selectedNumbers]: bet.amount };
                }
            } else if (Array.isArray(bet.selectedNumbers)) {
                // If it's an array, convert to object with equal distribution
                const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                bet.selectedNumbers.forEach((num: unknown) => {
                    const key = String(num);
                    numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                });
            } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                // If it's already an object, use it directly
                numbersObj = bet.selectedNumbers;
            } else {
                // Fallback
                numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
            }

            console.log(`Bet type: ${type}, selectedNumbers:`, bet.selectedNumbers, 'processed as:', numbersObj); // Debug

            // Merge the numbers object into the result
            for (const [key, value] of Object.entries(numbersObj)) {
                if (!result[type][key]) result[type][key] = 0;
                result[type][key] += value;
            }
        }

        // Console log the result for now
        console.log('Load aggregation:', JSON.stringify(result, null, 2));

        res.json({
            success: true,
            message: 'Loads aggregated',
            data: result,
            debug: {
                totalBets: bets.length,
                dateRange: { start, end },
                betTypes: [...new Set(bets.map(b => b.type))]
            }
        });
    } catch (error) {
        console.error('Get all loads error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
