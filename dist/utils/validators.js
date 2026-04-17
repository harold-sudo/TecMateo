"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.required = required;
exports.isEmail = isEmail;
exports.isPositiveInteger = isPositiveInteger;
function required(value) {
    return !!value && value.trim().length > 0;
}
function isEmail(value) {
    if (!value)
        return false;
    return /\S+@\S+\.\S+/.test(value);
}
function isPositiveInteger(n) {
    return typeof n === 'number' && Number.isInteger(n) && n > 0;
}
