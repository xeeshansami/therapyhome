// Pure fee-calculation helpers, kept separate so the arithmetic can be tested
// without rendering the fee portal.

export const toMoney = (value) => Number(value) || 0;

// A line item total is always derived, never stored on its own.
export const lineTotal = (item) =>
    toMoney(item && item.feePerSession) * (parseInt(item && item.sessions, 10) || 0);

export const sumLineItems = (items) =>
    (items || []).reduce((sum, item) => sum + lineTotal(item), 0);
