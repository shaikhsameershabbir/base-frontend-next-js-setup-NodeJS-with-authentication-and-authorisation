
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


function getCombinations(str: string, size: number): string[] {
    if (size === 1) return str.split('');
    const results = [];

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const remaining = str.slice(0, i) + str.slice(i + 1);
        const smallerCombs = getCombinations(remaining, size - 1);
        for (let comb of smallerCombs) {
            results.push(char + comb);
        }
    }
    return results;
}

export function findValidNumbers(input: string, validNumbersArray: number[]) {
    const permutations = getCombinations(input, 3);
    const validSet = new Set(validNumbersArray.map(String)); // convert to string for comparison
    return permutations.filter(p => validSet.has(p));
}
