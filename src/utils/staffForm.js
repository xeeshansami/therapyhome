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
export const staffRuleError = ({ designationTitle, internType, salary, scheduledCheckIn, scheduledCheckOut }, { requireSchedule = true } = {}) => {
    if (!designationTitle) return 'Please select a designation.';
    if (isInternTitle(designationTitle)) {
        if (!['paid', 'unpaid'].includes(internType)) return 'Choose Paid Intern or Unpaid Intern.';
        if (internType === 'paid' && !(Number(salary) > 0)) return 'Enter a salary above zero for a paid intern.';
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
