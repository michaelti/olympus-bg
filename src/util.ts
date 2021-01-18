export const range = (start: number, end: number, length = end - start + 1) => {
    return Array.from({ length }, (_, i) => start + i);
}

export interface _Move { from: number; to: number; subMove?: { from: number; to: number; } }