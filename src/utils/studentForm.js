// Pure helpers for the student profile form, kept separate so the pre-fill and
// change-detection rules can be tested without rendering the page.
import { toMoney } from './feeCalc';

export const toInputDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const idOf = (v) => (v && typeof v === 'object' ? (v._id || v.$oid) : v);

// Yes/no answers from the consultant form (medical history and recommendations).
export const STUDENT_BOOLEAN_FIELDS = [
    'doctorDiagnosisCondition', 'takingTherapiesBefore', 'onMedication', 'childAttendsSchool',
    'rec_speech_difficultyPronouncing', 'rec_speech_stuttering', 'rec_speech_followInstructions',
    'rec_behavior_concern', 'rec_behavior_diagnosis', 'rec_behavior_socialChallenges',
    'rec_occupational_dailyActivities', 'rec_occupational_sensoryIssue',
    'rec_remedial_difficultiesLearning', 'rec_remedial_specialEducation',
    'rec_additional_iep', 'rec_additional_fl',
];

export const THERAPY_OPTIONS = ['Speech Therapy', 'Behavior Therapy', 'Occupational Therapy', 'Remedial Therapy'];

let feeLineSeed = 0;
export const feeLineKey = () => `fp-${++feeLineSeed}`;

/** Paid / Partially Paid / Unpaid and the balance for one fee slip. */
export const feeStatus = (slip = {}) => {
    if (slip.paymentStatus) return { status: slip.paymentStatus, outstanding: Number(slip.outstanding) || 0 };
    const net = toMoney(slip.netTotalFee);
    const paid = Math.min(toMoney(slip.paidFee), net);
    const outstanding = Math.max(0, net - paid);
    return { status: outstanding === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid', outstanding };
};

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
    studentEmail: s.studentEmail || '',
    sessionTime: s.sessionTime || '',
    assignedTeacher: s.assignedTeacher || '',
    doctorDiagnosisDetails: s.doctorDiagnosisDetails || '',
    therapiesBeforeDetails: s.therapiesBeforeDetails || '',
    medicationDetails: s.medicationDetails || '',
    therapiesSeeking: Array.isArray(s.therapiesSeeking) ? s.therapiesSeeking : [],
    therapiesSeekingSpecific: s.therapiesSeekingSpecific || '',
    schoolDetails: s.schoolDetails || '',
    ...Object.fromEntries(STUDENT_BOOLEAN_FIELDS.map((k) => [k, !!s[k]])),
    className: (Array.isArray(s.className) ? s.className : []).map(idOf).filter(Boolean),
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
