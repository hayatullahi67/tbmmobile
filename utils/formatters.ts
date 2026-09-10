export function formatNaira(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₦0';
  }
  return `₦${Math.round(value).toLocaleString('en-US')}`;
}
