import React from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { INTERN_DURATIONS, bankDetailsError } from '../utils/staffForm';

/**
 * Joining date, internship duration (interns only) and salary bank account,
 * shared by Add Staff and Edit Staff.
 * value: { joiningDate, internDuration, internDurationUnit, bankDetails: { bankName, accountTitle, accountNumber, iban } }
 */
const StaffExtraFields = ({ value, onChange, isIntern }) => {
    const set = (patch) => onChange({ ...value, ...patch });
    const bank = value.bankDetails || {};
    const setBank = (k) => (e) => set({ bankDetails: { ...bank, [k]: k === 'iban' ? e.target.value.toUpperCase() : e.target.value } });
    const bankError = bankDetailsError(bank);
    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
                <TextField
                    label="Joining Date" type="date" fullWidth required InputLabelProps={{ shrink: true }}
                    value={value.joiningDate || ''} onChange={(e) => set({ joiningDate: e.target.value })}
                />
            </Grid>
            {isIntern && (
                <>
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Duration</InputLabel>
                            <Select label="Duration" value={value.internDuration || ''} onChange={(e) => set({ internDuration: e.target.value })}>
                                <MenuItem value=""><em>Not set</em></MenuItem>
                                {INTERN_DURATIONS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select label="Unit" value={value.internDurationUnit || ''} onChange={(e) => set({ internDurationUnit: e.target.value })}>
                                <MenuItem value=""><em>Not set</em></MenuItem>
                                <MenuItem value="weeks">Week(s)</MenuItem>
                                <MenuItem value="months">Month(s)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </>
            )}
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Salary bank account</Typography>
                <Typography variant="caption" color="text.secondary">Optional. Only admins and the staff member themself can see these details.</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Bank Name" fullWidth value={bank.bankName || ''} onChange={setBank('bankName')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Account Title" fullWidth value={bank.accountTitle || ''} onChange={setBank('accountTitle')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Account Number" fullWidth value={bank.accountNumber || ''} onChange={setBank('accountNumber')} inputProps={{ maxLength: 34 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="IBAN" fullWidth value={bank.iban || ''} onChange={setBank('iban')} inputProps={{ maxLength: 34 }} placeholder="PK36SCBL0000001123456702" />
            </Grid>
            {bankError && <Grid item xs={12}><Typography color="error" variant="body2">{bankError}</Typography></Grid>}
        </Grid>
    );
};

export default StaffExtraFields;
