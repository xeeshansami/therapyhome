// Pure helpers for the student profile form, kept separate so the pre-fill and
// change-detection rules can be tested without rendering the page.
import { toMoney } from './feeCalc';

export const toInputDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const idOf = (v) => (v && typeof v === 'object' ? (v._id || v.$oid) : v);

let feeLineSeed = 0;
export const feeLineKey = () => `fp-${++feeLineSeed}`;

// The single source for the editable form, used on load and on Cancel so both
// always reflect what is saved in the database.
export const buildStudentForm = (s = {}) => ({
    name: s.name || '',
    gender: s.gender || '',
    age: s.age || '',
    dob: toInputDate(s.dob),
    reference: s.reference || '',
    parentName: s.parentName || '',
    parentContact: s.parentContact || '',
    parentCNIC: s.parentCNIC || '',
    parentProfession: s.parentProfession || '',
    parentAddress: s.parentAddress || '',
    parentGender: s.parentGender || '',
    parentMaritalStatus: s.parentMaritalStatus || '',
    days: Array.isArray(s.days) ? s.days : [],
    feePlan: (Array.isArray(s.feePlan) ? s.feePlan : []).map((l) => ({
        key: feeLineKey(),
        sclassName: idOf(l.sclassName) || '',
        serviceName: l.serviceName || '',
        feePerSession: l.feePerSession ?? '',
        sessions: l.sessions ?? 1,
    })),
});

// Comparable shape of the form (fee lines without their UI keys).
const comparable = (form) => ({
    ...form,
    feePlan: form.feePlan.map(({ key, ...rest }) => ({
        ...rest, feePerSession: toMoney(rest.feePerSession), sessions: parseInt(rest.sessions, 10) || 0,
    })),
});

// Only the fields that actually changed are sent, so untouched values
// (including the agreed fees) are never rewritten.
export const studentChanges = (savedStudent, form) => {
    const original = comparable(buildStudentForm(savedStudent));
    const current = comparable(form);
    const changes = {};
    Object.keys(current).forEach((field) => {
        if (JSON.stringify(current[field]) !== JSON.stringify(original[field])) changes[field] = current[field];
    });
    if (changes.feePlan) {
        changes.feePlan = changes.feePlan.map((l) => ({ ...l, sclassName: l.sclassName || undefined }));
    }
    return changes;
};
