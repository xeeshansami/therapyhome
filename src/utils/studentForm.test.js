import { buildStudentForm, studentChanges, toInputDate } from './studentForm';

const saved = {
    _id: 's1',
    name: 'Ali',
    gender: 'Male',
    dob: '2018-05-04T00:00:00.000Z',
    parentName: 'Ahmed',
    parentContact: '03001234567',
    parentCNIC: '42101-1234567-1',
    parentProfession: 'Engineer',
    parentAddress: 'Street 1',
    parentGender: 'Male',
    parentMaritalStatus: 'Married',
    reference: 'Doctor',
    days: ['Monday', 'Wednesday'],
    feePlan: [{ sclassName: { _id: 'c1', sclassName: 'Speech' }, serviceName: 'Speech', feePerSession: 2000, sessions: 4 }],
};

describe('student form pre-fill', () => {
    it('fills every field from the saved record', () => {
        const form = buildStudentForm(saved);
        expect(form).toMatchObject({
            name: 'Ali', gender: 'Male', dob: '2018-05-04', parentName: 'Ahmed', parentContact: '03001234567',
            parentCNIC: '42101-1234567-1', parentProfession: 'Engineer', parentAddress: 'Street 1',
            parentGender: 'Male', parentMaritalStatus: 'Married', reference: 'Doctor', days: ['Monday', 'Wednesday'],
        });
        expect(form.feePlan[0]).toMatchObject({ sclassName: 'c1', serviceName: 'Speech', feePerSession: 2000, sessions: 4 });
    });

    it('handles missing, null and invalid values without crashing', () => {
        const form = buildStudentForm({ name: null, dob: 'not a date', days: null, feePlan: undefined });
        expect(form.name).toBe('');
        expect(form.dob).toBe('');
        expect(form.days).toEqual([]);
        expect(form.feePlan).toEqual([]);
        expect(buildStudentForm(undefined).name).toBe('');
        expect(toInputDate(null)).toBe('');
    });
});

describe('student change detection', () => {
    it('reports nothing when the form was only opened', () => {
        expect(studentChanges(saved, buildStudentForm(saved))).toEqual({});
    });

    it('reports only the edited fields', () => {
        const form = { ...buildStudentForm(saved), parentName: 'Ahmed Khan' };
        expect(studentChanges(saved, form)).toEqual({ parentName: 'Ahmed Khan' });
    });

    it('sends the whole agreed fee plan when one rate changes', () => {
        const form = buildStudentForm(saved);
        form.feePlan[0].feePerSession = '3000';
        expect(studentChanges(saved, form)).toEqual({
            feePlan: [{ sclassName: 'c1', serviceName: 'Speech', feePerSession: 3000, sessions: 4 }],
        });
    });
});
