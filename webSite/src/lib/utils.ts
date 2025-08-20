
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


function getCombinations(str: string, size: number): string[] {
    if (size === 1) return str.split('');
    if (size > str.length) return [];

    const results = [];
    const used = new Set<number>();

    function backtrack(start: number, current: string[]) {
        if (current.length === size) {
            results.push(current.join(''));
            return;
        }

        for (let i = start; i < str.length; i++) {
            if (used.has(i)) continue;

            used.add(i);
            current.push(str[i]);
            backtrack(i + 1, current);
            current.pop();
            used.delete(i);
        }
    }

    backtrack(0, []);
    return results;
}

export function findValidNumbers(input: string, validNumbersArray: number[]) {
    if (!input || input.length < 3) return [];

    // Generate combinations of 3 digits from input
    const combinations = getCombinations(input, 3);

    // Convert valid numbers to 3-digit strings for proper comparison
    const validSet = new Set(validNumbersArray.map(num => num.toString().padStart(3, '0')));

    // Filter combinations to only include valid pannas and remove duplicates
    const validCombinations = combinations.filter(comb => {
        // Ensure the combination is exactly 3 digits
        if (comb.length !== 3) return false;

        // Check if it's in the valid panna numbers
        return validSet.has(comb);
    });

    // Remove duplicates using Set and return sorted array
    return Array.from(new Set(validCombinations)).sort();
}
