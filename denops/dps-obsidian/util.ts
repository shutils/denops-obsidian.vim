export function strToNum(str: string) {
  if (isNaN(Number(str))) {
    throw new Error("Invalid number");
  }
  return Number(str);
}
