export function required(value) {
    return !!value && value.trim().length > 0;
}
export function isEmail(value) {
    if (!value)
        return false;
    return /\S+@\S+\.\S+/.test(value);
}
export function isPositiveInteger(n) {
    return typeof n === 'number' && Number.isInteger(n) && n > 0;
}
