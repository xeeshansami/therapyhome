import { suggestedAmount, dailyRate, totalDeductions, ruleText, typeLabel } from './payroll';

const policy = { workingDaysPerMonth: 30, halfDayFraction: 0.5, latesPerDayDeduction: 3, sandwichDays: 2 };

test('one day of pay is basic salary over working days', () => {
    expect(dailyRate(30000, policy)).toBe(1000);
    expect(dailyRate(26000, { ...policy, workingDaysPerMonth: 26 })).toBe(1000);
});

test('each deduction type follows the policy', () => {
    expect(suggestedAmount('absent', 2, 30000, policy)).toBe(2000);
    expect(suggestedAmount('halfDay', 3, 30000, policy)).toBe(1500);
    expect(suggestedAmount('late', 2, 30000, policy)).toBe(0);
    expect(suggestedAmount('late', 7, 30000, policy)).toBe(2000);
    expect(suggestedAmount('sandwich', 1, 30000, policy)).toBe(2000);
    expect(suggestedAmount('other', 9, 30000, policy)).toBe(0);
    expect(suggestedAmount('absent', -3, 30000, policy)).toBe(0);
});

test('totals and labels', () => {
    expect(totalDeductions([{ amount: 2000 }, { amount: '500' }, { amount: '' }])).toBe(2500);
    expect(ruleText('late', policy)).toMatch(/3 late/);
    expect(typeLabel('sandwich')).toBe('Weekend Sandwich');
});
