import { designationIdFor, isInternTitle, staffRuleError, to24h, formatTime, isUnpaidIntern, internLabel, titleOf } from './staffForm';

const designations = [{ _id: 'd1', title: 'Director' }, { _id: 'd2', title: 'Teacher' }, { _id: 'd3', title: 'Intern' }];

test('pre-selects the saved designation, falling back to the role title for older records', () => {
    expect(designationIdFor({ designation: 'd1', role: 'Teacher' }, designations)).toBe('d1');
    expect(designationIdFor({ designation: { _id: 'd2' } }, designations)).toBe('d2');
    expect(designationIdFor({ role: 'director ' }, designations)).toBe('d1');
    expect(designationIdFor({ role: 'Unknown' }, designations)).toBe('');
    expect(titleOf('d3', designations)).toBe('Intern');
});

test('intern rules: type required, paid needs salary, unpaid does not', () => {
    const base = { designationTitle: 'Intern', scheduledCheckIn: '09:00', scheduledCheckOut: '17:00' };
    expect(isInternTitle(' intern ')).toBe(true);
    expect(staffRuleError({ ...base, salary: '1000' })).toMatch(/Paid Intern or Unpaid/);
    expect(staffRuleError({ ...base, internType: 'paid', salary: '0' })).toMatch(/salary above zero/);
    expect(staffRuleError({ ...base, internType: 'paid', salary: '15000' })).toBe('');
    expect(staffRuleError({ ...base, internType: 'unpaid', salary: '' })).toBe('');
});

test('other designations need a salary and a schedule', () => {
    expect(staffRuleError({ designationTitle: '', salary: '1' })).toMatch(/designation/);
    expect(staffRuleError({ designationTitle: 'Director', salary: '', scheduledCheckIn: '09:00', scheduledCheckOut: '17:00' })).toMatch(/salary/);
    expect(staffRuleError({ designationTitle: 'Director', salary: '50000', scheduledCheckIn: '09:00' })).toMatch(/check-out/);
    expect(staffRuleError({ designationTitle: 'Director', salary: '50000' }, { requireSchedule: false })).toBe('');
    expect(staffRuleError({ designationTitle: 'Director', salary: '50000', scheduledCheckIn: '9am', scheduledCheckOut: '17:00' })).toMatch(/check-in/);
});

test('time helpers', () => {
    expect(to24h('09:00AM')).toBe('09:00');
    expect(to24h('06:00PM')).toBe('18:00');
    expect(to24h('12:15 AM')).toBe('00:15');
    expect(to24h('17:45')).toBe('17:45');
    expect(to24h('later')).toBe('');
    expect(formatTime('17:30')).toBe('5:30 PM');
    expect(formatTime('00:05')).toBe('12:05 AM');
});

test('unpaid interns are recognised for payroll', () => {
    expect(isUnpaidIntern({ role: 'Intern', internType: 'unpaid' })).toBe(true);
    expect(isUnpaidIntern({ role: 'Intern', internType: 'paid' })).toBe(false);
    expect(isUnpaidIntern({ role: 'Director', internType: 'unpaid' })).toBe(false);
    expect(internLabel({ role: 'Intern', internType: 'paid' })).toBe('Paid Intern');
    expect(internLabel({ role: 'Teacher' })).toBe('');
});
