export const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = typeof obj.balance.toNumber === 'function' ? obj.balance.toNumber() : Number(obj.balance);
  }
  
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = typeof obj.amount.toNumber === 'function' ? obj.amount.toNumber() : Number(obj.amount);
  }
  
  return serialized;
};

export function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY": {
      const currentDay = next.getDate();
      next.setMonth(next.getMonth() + 1);
      // Handle end of month edge case (e.g., Jan 31 -> Mar 3 instead of Feb 28)
      if (next.getDate() !== currentDay) {
        next.setDate(0); 
      }
      break;
    }
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}
