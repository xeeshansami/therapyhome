// Pure helpers for the Add Staff and Edit Staff forms, kept separate so the
// designation, intern and schedule rules can be tested without rendering.
// The server enforces the same rules; these only give early feedback.

export const isInternTitle = (title) => /^intern$/i.test(String(title || '').trim());

const idOf = (v) => (v && typeof v === 'object' ? v._id : v) || '';

/**
 * The designation to pre-select for a staff member. Older records only store
 * the designation title in `role`, so fall back to matching that title.
 */
export const designationIdFor = (teacher, designations = []) => {
    const id = idOf(teacher && teacher.designation);
    if (id) return id;
    const role = String((teacher && teacher.role) || '').trim().toLowerCase();
    const match = designations.find((d) => String(d.title || '').trim().toLowerCase() === role);
    return match ? match._id : '';
};

export const titleOf = (designationId, designations = []) =>
    (designations.find((d) => d._id === designationId) || {}).title || '';

const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "09:00AM" / "9:00 PM" / "09:00" -> "09:00" / "21:00"; '' when unreadable. */
export const to24h = (value) => {
    const m = String(value || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
    if (!m) return '';
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = m[3] ? m[3].toUpperCase() : '';
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    if (h > 23 || parseInt(min, 10) > 59) return '';
    return `${String(h).padStart(2, '0')}:${min}`;
};

/** "17:30" -> "5:30 PM" for display. */
export const formatTime = (value) => {
    if (!TIME_24H.test(String(value || ''))) return value || '';
    const [h, m] = value.split(':').map((n) => parseInt(n, 10));
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
};

/**
 * Validates the designation-dependent part of a staff form.
 * @returns {string} an error message, or '' when valid
 */
export const staffRuleError = ({ designationTitle, internType, salary, scheduledCheckIn, scheduledCheckOut, internDuration, internDurationUnit }, { requireSchedule = true } = {}) => {
    if (!designationTitle) return 'Please select a designation.';
    if (isInternTitle(designationTitle)) {
        if (!['paid', 'unpaid'].includes(internType)) return 'Choose Paid Intern or Unpaid Intern.';
        if (internType === 'paid' && !(Number(salary) > 0)) return 'Enter a salary above zero for a paid intern.';
        const hasDuration = internDuration !== '' && internDuration !== null && internDuration !== undefined;
        if (hasDuration && !(Number.isInteger(Number(internDuration)) && Number(internDuration) >= 1 && Number(internDuration) <= 12)) {
            return 'Internship duration must be 1 to 12.';
        }
        if (hasDuration !== Boolean(internDurationUnit)) return 'Enter the internship duration and choose Weeks or Months.';
    } else if (salary === '' || salary === null || salary === undefined || !(Number(salary) >= 0)) {
        return 'Enter a valid salary.';
    }
    if (requireSchedule && (!scheduledCheckIn || !scheduledCheckOut)) return 'Enter the scheduled check-in and check-out times.';
    if (scheduledCheckIn && !TIME_24H.test(scheduledCheckIn)) return 'Invalid scheduled check-in time.';
    if (scheduledCheckOut && !TIME_24H.test(scheduledCheckOut)) return 'Invalid scheduled check-out time.';
    return '';
};

/** Payroll is not paid to unpaid interns. */
export const isUnpaidIntern = (teacher) => !!teacher && isInternTitle(teacher.role) && teacher.internType === 'unpaid';

export const internLabel = (teacher) => {
    if (!teacher || !isInternTitle(teacher.role)) return '';
    return teacher.internType === 'unpaid' ? 'Unpaid Intern' : teacher.internType === 'paid' ? 'Paid Intern' : 'Intern';
};

export const INTERN_DURATIONS = Array.from({ length: 12 }, (_, i) => i + 1);

/** "3 Months" / "1 Week" for display; '' when not set. */
export const internDurationLabel = (teacher) => {
    const n = Number(teacher && teacher.internDuration);
    const unit = teacher && teacher.internDurationUnit;
    if (!n || !unit) return '';
    return `${n} ${unit === 'weeks' ? (n === 1 ? 'Week' : 'Weeks') : (n === 1 ? 'Month' : 'Months')}`;
};

/** YYYY-MM-DD for a date input from a stored joining date (older records: teacherDateTime / createdAt). */
export const joiningDateInput = (teacher) => {
    const raw = (teacher && (teacher.joiningDate || teacher.teacherDateTime || teacher.createdAt)) || '';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const IBAN_RE = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

/** Bank details form check. @returns {string} error or '' */
export const bankDetailsError = (b) => {
    if (!b) return '';
    const iban = String(b.iban || '').replace(/\s+/g, '').toUpperCase();
    const acct = String(b.accountNumber || '').replace(/\s+/g, '');
    if (acct && !/^[0-9A-Za-z-]{4,34}$/.test(acct)) return 'Account number must be 4 to 34 letters or digits.';
    if (iban && !IBAN_RE.test(iban)) return 'IBAN looks invalid (Pakistan: PK followed by 22 characters).';
    if (iban.startsWith('PK') && iban.length !== 24) return 'A Pakistani IBAN is 24 characters (PK + 22).';
    if ((acct || iban) && !String(b.bankName || '').trim()) return 'Enter the bank name.';
    return '';
};

export const emptyBankDetails = () => ({ bankName: '', accountTitle: '', accountNumber: '', iban: '' });
