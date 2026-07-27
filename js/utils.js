window.ORDR = window.ORDR || {};
window.ORDR.money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
