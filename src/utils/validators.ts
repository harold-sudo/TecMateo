export function required(value: string | undefined): boolean {
  return !!value && value.trim().length > 0;
}

export function isEmail(value: string | undefined): boolean {
  if (!value) return false;
  return /\S+@\S+\.\S+/.test(value);
}

export function isPositiveInteger(n: number | undefined): boolean {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}