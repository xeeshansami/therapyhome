import { lineTotal, sumLineItems, toMoney } from './feeCalc';

describe('fee calculation', () => {
    it('multiplies fee per session by the session count', () => {
        expect(lineTotal({ feePerSession: 2000, sessions: 5 })).toBe(10000);
    });

    it('sums multiple sessions/services into a net fee', () => {
        const items = [
            { feePerSession: 2000, sessions: 4 },
            { feePerSession: 2500, sessions: 2 },
            { feePerSession: 1500, sessions: 3 },
        ];
        expect(items.map(lineTotal)).toEqual([8000, 5000, 4500]);
        expect(sumLineItems(items)).toBe(17500);
    });

    it('treats string inputs from text fields as numbers', () => {
        expect(lineTotal({ feePerSession: '2000', sessions: '5' })).toBe(10000);
        expect(sumLineItems([{ feePerSession: '1500', sessions: '3' }])).toBe(4500);
    });

    it('keeps each line independent so one student does not affect another', () => {
        const studentA = [{ feePerSession: 2000, sessions: 1 }];
        const studentB = [{ feePerSession: 3000, sessions: 1 }];
        expect(sumLineItems(studentA)).toBe(2000);
        expect(sumLineItems(studentB)).toBe(3000);
    });

    it('handles empty, missing and invalid values without blowing up', () => {
        expect(sumLineItems([])).toBe(0);
        expect(sumLineItems(undefined)).toBe(0);
        expect(lineTotal({})).toBe(0);
        expect(lineTotal({ feePerSession: '', sessions: '' })).toBe(0);
        expect(lineTotal({ feePerSession: 'abc', sessions: 2 })).toBe(0);
        expect(toMoney('abc')).toBe(0);
    });
});
