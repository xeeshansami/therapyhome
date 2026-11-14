import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Current year down to `fromYear` (records started in 2024). */
export const yearOptions = (fromYear = 2024) => {
    const now = new Date().getFullYear();
    const list = [];
    for (let y = now; y >= Math.min(fromYear, now); y -= 1) list.push(y);
    return list;
};

/**
 * Year + month filter for historical records. value: { year: '' | number, month: '' | 1-12 }
 * Empty year = all years; empty month = the whole year.
 */
const PeriodFilter = ({ value, onChange, allowAllYears = true, size, fromYear }) => (
    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
        <FormControl sx={{ minWidth: 120 }} size={size}>
            <InputLabel id="period-year">Year</InputLabel>
            <Select labelId="period-year" label="Year" value={value.year} onChange={(e) => onChange({ year: e.target.value, month: e.target.value === '' ? '' : value.month })}>
                {allowAllYears && <MenuItem value="">All years</MenuItem>}
                {yearOptions(fromYear).map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }} size={size} disabled={value.year === ''}>
            <InputLabel id="period-month">Month</InputLabel>
            <Select labelId="period-month" label="Month" value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value })}>
                <MenuItem value="">Whole year</MenuItem>
                {MONTH_NAMES.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
            </Select>
        </FormControl>
    </Stack>
);

export default PeriodFilter;
