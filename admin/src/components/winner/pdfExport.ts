import jsPDF from 'jspdf';
import { organizeDataByGameTypes, getDigitSum, getGameTypeAndAmount } from './utils';
import { WINNING_RATES } from './constants';

export interface PDFExportData {
    data: any;
    selectedDate: string;
    selectedBetType: string;
    selectedMarket: string;
    assignedMarkets: any[];
    cuttingAmount: string;
}

export const exportToPDF = (gameType: string, gameTypeLabel: string, exportData: PDFExportData) => {
    const { data, selectedDate, selectedBetType, selectedMarket, assignedMarkets, cuttingAmount } = exportData;

    try {
        const doc = new jsPDF();

        // Get market name
        const selectedMarketName = selectedMarket !== 'all'
            ? assignedMarkets.find((market: any) => market._id === selectedMarket)?.marketName || 'All Markets'
            : 'All Markets';

        // Get current date and time
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-IN');
        const currentTime = now.toLocaleTimeString('en-IN');

        // Add title
        doc.setFontSize(16);
        doc.text(`${gameTypeLabel} - Bet Data`, 14, 20);

        // Add market name
        doc.setFontSize(10);
        doc.text(`Market: ${selectedMarketName}`, 14, 30);

        // Add date and filters info
        doc.text(`Date: ${selectedDate || 'Today'}`, 14, 35);
        doc.text(`Bet Type: ${selectedBetType}`, 14, 40);

        // Add PDF creation time
        doc.text(`Generated on: ${currentDate} at ${currentTime}`, 14, 45);

        // Use the exact same logic as the web interface to get the data
        const gameData: Array<{ number: string; amount: number; winningAmount: number }> = [];

        // Organize data by game types (same as web interface)
        const organizedData = organizeDataByGameTypes(data);
        if (!organizedData) {
            alert(`No data available for ${gameTypeLabel}`);
            return;
        }

        // Create table data organized by digit sum (0-9) - same as web interface
        const tableData: Record<number, Array<{ number: string, amount: number, gameType: string, rate: number, winningAmount: number, betBreakdown: string }>> = {
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
        };

        // Process all numbers and categorize by digit sum (same as web interface)
        Object.entries(organizedData).forEach(([category, numbers]) => {
            if (category === 'halfSangam' || category === 'fullSangam') return; // Skip sangam for now

            Object.entries(numbers as Record<string, number>).forEach(([number, amount]) => {
                // For single game type, include single digits (0-9)
                // For double game type, include only 2-digit numbers
                // For other game types, skip single digits (0-9) and double digits (00-99)
                if (gameType === 'single' && number.length !== 1) return;
                if (gameType === 'double' && number.length !== 2) return;
                if (gameType !== 'single' && gameType !== 'double' && (number.length === 1 || number.length === 2)) return;

                // Apply cutting filter
                const cuttingValue = parseFloat(cuttingAmount) || 0;
                if (amount <= cuttingValue) return;

                // Filter out "1 60" entries
                if (number === "1" && amount === 60) return;

                // Validate number format
                if (!/^\d+$/.test(number)) {
                    return;
                }

                const digitSum = getDigitSum(number);

                // Validate digitSum is a valid number between 0-9
                if (isNaN(digitSum) || digitSum < 0 || digitSum > 9) {
                    return;
                }

                // Ensure tableData[digitSum] exists
                if (!tableData[digitSum]) {
                    tableData[digitSum] = [];
                }

                const { type, rate, amount: winningAmount } = getGameTypeAndAmount(number, amount);

                // For single digits, use the number as is
                let totalWinningAmount = winningAmount;
                let combinedNumbers = number;
                let betBreakdown = `${category}: ₹${amount.toLocaleString()} = ₹${winningAmount.toLocaleString()}`;

                // For triple digits, also calculate winning for the digit sum
                if (number.length === 3) {
                    const digitSumStr = digitSum.toString();
                    const digitSumAmount = organizedData.single?.[digitSumStr] || 0;
                    const digitSumWinning = digitSumAmount * WINNING_RATES.single;
                    totalWinningAmount += digitSumWinning;
                    combinedNumbers = `${number}-${digitSum}`;

                    if (digitSumAmount > 0) {
                        betBreakdown += ` | Single(${digitSum}): ₹${digitSumAmount.toLocaleString()} = ₹${digitSumWinning.toLocaleString()}`;
                    }
                }

                // Add total calculation
                betBreakdown += ` | Total Win = ₹${totalWinningAmount.toLocaleString()}`;

                tableData[digitSum].push({
                    number: combinedNumbers,
                    amount,
                    gameType: type,
                    rate,
                    winningAmount: totalWinningAmount,
                    betBreakdown
                });
            });
        });

        // Process Double data (2-digit numbers from various bet types) - same as web interface
        if (gameType === 'double') {
            const cuttingValue = parseFloat(cuttingAmount) || 0;
            const betTypesToCheck = [
                'jodi', 'half_bracket', 'full_bracket', 'family_panel'
            ];

            betTypesToCheck.forEach(betType => {
                if (data?.data?.[betType]) {
                    const betData = data.data[betType];

                    // Handle different data structures
                    let entries: [string, number][] = [];

                    if (betData.both) {
                        entries = Object.entries(betData.both);
                    } else if (betData.open || betData.close) {
                        const openData = betData.open || {};
                        const closeData = betData.close || {};

                        if (selectedBetType === 'all' || selectedBetType === 'open') {
                            entries.push(...Object.entries(openData));
                        }
                        if (selectedBetType === 'all' || selectedBetType === 'close') {
                            entries.push(...Object.entries(closeData));
                        }
                    }

                    entries.forEach(([number, amount]) => {
                        const numAmount = amount as number;

                        // Only process 2-digit numbers
                        if (number.length === 2 && /^\d{2}$/.test(number)) {
                            if (numAmount > cuttingValue) {
                                const firstDigit = parseInt(number.charAt(0));
                                const secondDigit = parseInt(number.charAt(1));
                                const digitSum = (firstDigit + secondDigit) % 10; // Sum of digits, modulo 10

                                if (!isNaN(digitSum) && digitSum >= 0 && digitSum <= 9) {
                                    const winningAmount = numAmount * WINNING_RATES.double; // Double rate

                                    tableData[digitSum].push({
                                        number: number,
                                        amount: numAmount,
                                        gameType: 'double',
                                        rate: WINNING_RATES.double,
                                        winningAmount: winningAmount,
                                        betBreakdown: `${betType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ₹${numAmount.toLocaleString()} × ${WINNING_RATES.double} = ₹${winningAmount.toLocaleString()}`
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }

        // Process Sangam data (Half Sangam and Full Sangam) - same as web interface
        if (gameType === 'halfSangam' || gameType === 'fullSangam') {
            const cuttingValue = parseFloat(cuttingAmount) || 0;

            // Process Half Sangam data
            if (gameType === 'halfSangam' && data?.data?.half_sangam_open?.both) {
                Object.entries(data.data.half_sangam_open.both).forEach(([number, amount]) => {
                    const numAmount = amount as number;

                    if (numAmount > cuttingValue) {
                        // Extract the first digit for categorization
                        const firstDigit = parseInt(number.charAt(0));
                        if (!isNaN(firstDigit) && firstDigit >= 0 && firstDigit <= 9) {
                            const winningAmount = numAmount * 1000; // Half Sangam rate

                            tableData[firstDigit].push({
                                number: number,
                                amount: numAmount,
                                gameType: 'halfSangam',
                                rate: 1000,
                                winningAmount: winningAmount,
                                betBreakdown: `Half Sangam: ₹${numAmount.toLocaleString()} × 1000 = ₹${winningAmount.toLocaleString()}`
                            });
                        }
                    }
                });
            }

            // Process Full Sangam data
            if (gameType === 'fullSangam' && data?.data?.full_sangam?.both) {
                Object.entries(data.data.full_sangam.both).forEach(([number, amount]) => {
                    const numAmount = amount as number;

                    if (numAmount > cuttingValue) {
                        // Extract the first digit for categorization
                        const firstDigit = parseInt(number.charAt(0));
                        if (!isNaN(firstDigit) && firstDigit >= 0 && firstDigit <= 9) {
                            const winningAmount = numAmount * 10000; // Full Sangam rate

                            tableData[firstDigit].push({
                                number: number,
                                amount: numAmount,
                                gameType: 'fullSangam',
                                rate: 10000,
                                winningAmount: winningAmount,
                                betBreakdown: `Full Sangam: ₹${numAmount.toLocaleString()} × 10000 = ₹${winningAmount.toLocaleString()}`
                            });
                        }
                    }
                });
            }
        }

        // Extract data for the specific game type (same as web interface)
        Object.values(tableData).forEach(columnEntries => {
            columnEntries.forEach(entry => {
                if (entry.gameType === gameType) {
                    gameData.push({
                        number: entry.number,
                        amount: entry.amount,
                        winningAmount: entry.winningAmount
                    });
                }
            });
        });

        if (gameData.length === 0) {
            alert(`No data available for ${gameTypeLabel}`);
            return;
        }

        // Add table header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bet Number', 14, 65);
        doc.text('Bet Amount', 45, 65);
        doc.text('Bet Number', 85, 65);
        doc.text('Bet Amount', 116, 65);
        doc.text('Bet Number', 156, 65);
        doc.text('Bet Amount', 187, 65);

        // Add table data
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPosition = 75;

        // Process data in groups of 3 for 3 columns
        for (let i = 0; i < gameData.length; i += 3) {
            if (yPosition > 280) {
                // Add new page if running out of space
                doc.addPage();
                yPosition = 20;
            }

            const row = gameData.slice(i, i + 3);

            // First column
            if (row[0]) {
                doc.text(row[0].number, 14, yPosition);
                doc.text(`${row[0].amount.toLocaleString()}`, 45, yPosition);
            }

            // Second column
            if (row[1]) {
                doc.text(row[1].number, 85, yPosition);
                doc.text(`${row[1].amount.toLocaleString()}`, 116, yPosition);
            }

            // Third column
            if (row[2]) {
                doc.text(row[2].number, 156, yPosition);
                doc.text(`${row[2].amount.toLocaleString()}`, 187, yPosition);
            }

            yPosition += 7;
        }

        // Save PDF
        doc.save(`${gameTypeLabel}_${selectedDate || 'today'}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Failed to generate PDF. Please try again.');
    }
};

export const exportAllToPDF = (exportData: PDFExportData) => {
    const { data, selectedDate, selectedBetType, selectedMarket, assignedMarkets, cuttingAmount } = exportData;

    try {
        const doc = new jsPDF();

        // Get market name
        const selectedMarketName = selectedMarket !== 'all'
            ? assignedMarkets.find((market: any) => market._id === selectedMarket)?.marketName || 'All Markets'
            : 'All Markets';

        // Get current date and time
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-IN');
        const currentTime = now.toLocaleTimeString('en-IN');

        // Add title
        doc.setFontSize(16);
        doc.text('Complete Bet Data Report', 14, 20);

        // Add market name
        doc.setFontSize(10);
        doc.text(`Market: ${selectedMarketName}`, 14, 30);

        // Add date and filters info
        doc.text(`Date: ${selectedDate || 'Today'}`, 14, 35);
        doc.text(`Bet Type: ${selectedBetType}`, 14, 40);

        // Add PDF creation time
        doc.text(`Generated on: ${currentDate} at ${currentTime}`, 14, 45);

        let yPosition = 65;

        // Define all game types to export
        const gameTypes = [
            { key: 'single', label: 'Single' },
            { key: 'double', label: 'Double' },
            { key: 'singlePanna', label: 'Single Panna' },
            { key: 'doublePanna', label: 'Double Panna' },
            { key: 'triplePanna', label: 'Triple Panna' },
            { key: 'halfSangam', label: 'Half Sangam' },
            { key: 'fullSangam', label: 'Full Sangam' }
        ];

        // Export each game type
        gameTypes.forEach((gameType) => {
            // Get data for this game type
            const gameData: Array<{ number: string; amount: number; winningAmount: number }> = [];

            // Use the same data organization logic as the web interface
            const organizedData = organizeDataByGameTypes(data);
            if (!organizedData) return;

            // Create table data organized by digit sum (0-9) - same as web interface
            const tableData: Record<number, Array<{ number: string, amount: number, gameType: string, rate: number, winningAmount: number, betBreakdown: string }>> = {
                0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
            };

            // Process all numbers and categorize by digit sum (same as web interface)
            Object.entries(organizedData).forEach(([category, numbers]) => {
                if (category === 'halfSangam' || category === 'fullSangam') return; // Skip sangam for now

                Object.entries(numbers as Record<string, number>).forEach(([number, amount]) => {
                    // For single game type, include single digits (0-9)
                    // For double game type, include only 2-digit numbers
                    // For other game types, skip single digits (0-9) and double digits (00-99)
                    if (gameType.key === 'single' && number.length !== 1) return;
                    if (gameType.key === 'double' && number.length !== 2) return;
                    if (gameType.key !== 'single' && gameType.key !== 'double' && (number.length === 1 || number.length === 2)) return;

                    // Apply cutting filter
                    const cuttingValue = parseFloat(cuttingAmount) || 0;
                    if (amount <= cuttingValue) return;

                    // Filter out "1 60" entries
                    if (number === "1" && amount === 60) return;

                    // Validate number format
                    if (!/^\d+$/.test(number)) {
                        return;
                    }

                    const digitSum = getDigitSum(number);

                    // Validate digitSum is a valid number between 0-9
                    if (isNaN(digitSum) || digitSum < 0 || digitSum > 9) {
                        return;
                    }

                    // Ensure tableData[digitSum] exists
                    if (!tableData[digitSum]) {
                        tableData[digitSum] = [];
                    }

                    const { type, rate, amount: winningAmount } = getGameTypeAndAmount(number, amount);

                    // For single digits, use the number as is
                    let totalWinningAmount = winningAmount;
                    let combinedNumbers = number;
                    let betBreakdown = `${category}: ₹${amount.toLocaleString()} = ₹${winningAmount.toLocaleString()}`;

                    // For triple digits, also calculate winning for the digit sum
                    if (number.length === 3) {
                        const digitSumStr = digitSum.toString();
                        const digitSumAmount = organizedData.single?.[digitSumStr] || 0;
                        const digitSumWinning = digitSumAmount * WINNING_RATES.single;
                        totalWinningAmount += digitSumWinning;
                        combinedNumbers = `${number}-${digitSum}`;

                        if (digitSumAmount > 0) {
                            betBreakdown += ` | Single(${digitSum}): ₹${digitSumAmount.toLocaleString()} = ₹${digitSumWinning.toLocaleString()}`;
                        }
                    }

                    // Add total calculation
                    betBreakdown += ` | Total Win = ₹${totalWinningAmount.toLocaleString()}`;

                    tableData[digitSum].push({
                        number: combinedNumbers,
                        amount,
                        gameType: type,
                        rate,
                        winningAmount: totalWinningAmount,
                        betBreakdown
                    });
                });
            });

            // Process Double data (2-digit numbers from various bet types) - same as web interface
            if (gameType.key === 'double') {
                const cuttingValue = parseFloat(cuttingAmount) || 0;
                const betTypesToCheck = [
                    'jodi', 'half_bracket', 'full_bracket', 'family_panel'
                ];

                betTypesToCheck.forEach(betType => {
                    if (data?.data?.[betType]) {
                        const betData = data.data[betType];

                        // Handle different data structures
                        let entries: [string, number][] = [];

                        if (betData.both) {
                            entries = Object.entries(betData.both);
                        } else if (betData.open || betData.close) {
                            const openData = betData.open || {};
                            const closeData = betData.close || {};

                            if (selectedBetType === 'all' || selectedBetType === 'open') {
                                entries.push(...Object.entries(openData));
                            }
                            if (selectedBetType === 'all' || selectedBetType === 'close') {
                                entries.push(...Object.entries(closeData));
                            }
                        }

                        entries.forEach(([number, amount]) => {
                            const numAmount = amount as number;

                            // Only process 2-digit numbers
                            if (number.length === 2 && /^\d{2}$/.test(number)) {
                                if (numAmount > cuttingValue) {
                                    const firstDigit = parseInt(number.charAt(0));
                                    const secondDigit = parseInt(number.charAt(1));
                                    const digitSum = (firstDigit + secondDigit) % 10; // Sum of digits, modulo 10

                                    if (!isNaN(digitSum) && digitSum >= 0 && digitSum <= 9) {
                                        const winningAmount = numAmount * WINNING_RATES.double; // Double rate

                                        tableData[digitSum].push({
                                            number: number,
                                            amount: numAmount,
                                            gameType: 'double',
                                            rate: WINNING_RATES.double,
                                            winningAmount: winningAmount,
                                            betBreakdown: `${betType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ₹${numAmount.toLocaleString()} × ${WINNING_RATES.double} = ₹${winningAmount.toLocaleString()}`
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            }

            // Process Sangam data (Half Sangam and Full Sangam) - same as web interface
            if (gameType.key === 'halfSangam' || gameType.key === 'fullSangam') {
                const cuttingValue = parseFloat(cuttingAmount) || 0;

                // Process Half Sangam data
                if (gameType.key === 'halfSangam' && data?.data?.half_sangam_open?.both) {
                    Object.entries(data.data.half_sangam_open.both).forEach(([number, amount]) => {
                        const numAmount = amount as number;

                        if (numAmount > cuttingValue) {
                            // Extract the first digit for categorization
                            const firstDigit = parseInt(number.charAt(0));
                            if (!isNaN(firstDigit) && firstDigit >= 0 && firstDigit <= 9) {
                                const winningAmount = numAmount * 1000; // Half Sangam rate

                                tableData[firstDigit].push({
                                    number: number,
                                    amount: numAmount,
                                    gameType: 'halfSangam',
                                    rate: 1000,
                                    winningAmount: winningAmount,
                                    betBreakdown: `Half Sangam: ₹${numAmount.toLocaleString()} × 1000 = ₹${winningAmount.toLocaleString()}`
                                });
                            }
                        }
                    });
                }

                // Process Full Sangam data
                if (gameType.key === 'fullSangam' && data?.data?.full_sangam?.both) {
                    Object.entries(data.data.full_sangam.both).forEach(([number, amount]) => {
                        const numAmount = amount as number;

                        if (numAmount > cuttingValue) {
                            // Extract the first digit for categorization
                            const firstDigit = parseInt(number.charAt(0));
                            if (!isNaN(firstDigit) && firstDigit >= 0 && firstDigit <= 9) {
                                const winningAmount = numAmount * 10000; // Full Sangam rate

                                tableData[firstDigit].push({
                                    number: number,
                                    amount: numAmount,
                                    gameType: 'fullSangam',
                                    rate: 10000,
                                    winningAmount: winningAmount,
                                    betBreakdown: `Full Sangam: ₹${numAmount.toLocaleString()} × 10000 = ₹${winningAmount.toLocaleString()}`
                                });
                            }
                        }
                    });
                }
            }

            // Extract data for the specific game type (same as web interface)
            Object.values(tableData).forEach(columnEntries => {
                columnEntries.forEach(entry => {
                    if (entry.gameType === gameType.key) {
                        gameData.push({
                            number: entry.number,
                            amount: entry.amount,
                            winningAmount: entry.winningAmount
                        });
                    }
                });
            });

            if (gameData.length > 0) {
                // Add game type header
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`${gameType.label} - Bet Data`, 14, yPosition);
                yPosition += 10;

                // Add table header
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Bet Number', 14, yPosition);
                doc.text('Bet Amount', 45, yPosition);
                doc.text('Bet Number', 85, yPosition);
                doc.text('Bet Amount', 116, yPosition);
                doc.text('Bet Number', 156, yPosition);
                doc.text('Bet Amount', 187, yPosition);
                yPosition += 10;

                // Add table data
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');

                // Process data in groups of 3 for 3 columns
                for (let i = 0; i < gameData.length; i += 3) {
                    if (yPosition > 280) {
                        // Add new page if running out of space
                        doc.addPage();
                        yPosition = 20;
                    }

                    const row = gameData.slice(i, i + 3);

                    // First column
                    if (row[0]) {
                        doc.text(row[0].number, 14, yPosition);
                        doc.text(`${row[0].amount.toLocaleString()}`, 45, yPosition);
                    }

                    // Second column
                    if (row[1]) {
                        doc.text(row[1].number, 85, yPosition);
                        doc.text(`${row[1].amount.toLocaleString()}`, 116, yPosition);
                    }

                    // Third column
                    if (row[2]) {
                        doc.text(row[2].number, 156, yPosition);
                        doc.text(`${row[2].amount.toLocaleString()}`, 187, yPosition);
                    }

                    yPosition += 7;
                }

                yPosition += 15; // Add space between sections
            }
        });

        // Save PDF
        doc.save(`Complete_Bet_Data_${selectedDate || 'today'}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Failed to generate PDF. Please try again.');
    }
}; 