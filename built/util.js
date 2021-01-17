"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = void 0;
const range = (start, end, length = end - start + 1) => {
    return Array.from({ length }, (_, i) => start + i);
};
exports.range = range;
