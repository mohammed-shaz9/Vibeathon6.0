export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
