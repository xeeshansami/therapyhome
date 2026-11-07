// Salary deduction rules, mirroring the server (lib/payroll.js). The portal uses
// them to suggest amounts; each amount stays editable before the slip is issued.

export const DEDUCTION_TYPES = [
    { value: 'absent', label: 'Absent', countLabel: 'Days absent' },
    { value: 'halfDay', label: 'Half Day', countLabel: 'Half days' },
    { value: 'late', label: 'Late Arrival', countLabel: 'Late arrivals' },
    { value: 'sandwich', label: 'Weekend Sandwich', countLabel: 'Weekends' },
    { value: 'other', label: 'Other (manual)', countLabel: '' },
];

export const DEFAULT_PAYROLL_POLICY = {
    workingDaysPerMonth: 30,
    halfDayFraction: 0.5,
    latesPerDayDeduction: 3,
    sandwichDays: 2,
};

export const typeLabel = (type) => (DEDUCTION_TYPES.find((t) => t.value === type) || {}).label || type;

/** One day of basic salary under the policy. */
export const dailyRate = (baseSalary, policy = DEFAULT_PAYROLL_POLICY) =>
    (Number(baseSalary) || 0) / ((policy && policy.workingDaysPerMonth) || DEFAULT_PAYROLL_POLICY.workingDaysPerMonth);

/** Suggested amount for one deduction row (whole rupees). */
export const suggestedAmount = (type, count, baseSalary, policy = DEFAULT_PAYROLL_POLICY) => {
    const p = { ...DEFAULT_PAYROLL_POLICY, ...(policy || {}) };
    const c = Math.max(0, Number(count) || 0);
    const day = dailyRate(baseSalary, p);
    switch (type) {
        case 'absent': return Math.round(c * day);
        case 'halfDay': return Math.round(c * p.halfDayFraction * day);
        case 'late': return Math.round(Math.floor(c / p.latesPerDayDeduction) * day);
        case 'sandwich': return Math.round(c * p.sandwichDays * day);
        default: return 0;
    }
};

/** Short explanation of how a row's suggestion is worked out. */
export const ruleText = (type, policy = DEFAULT_PAYROLL_POLICY) => {
    const p = { ...DEFAULT_PAYROLL_POLICY, ...(policy || {}) };
    switch (type) {
        case 'absent': return '1 day of pay per absence';
        case 'halfDay': return `${p.halfDayFraction} day of pay per half day`;
        case 'late': return `1 day of pay per ${p.latesPerDayDeduction} late arrivals`;
        case 'sandwich': return `${p.sandwichDays} days of pay per sandwiched weekend`;
        default: return 'Enter the amount';
    }
};

export const totalDeductions = (items) => (items || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
