import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Autocomplete, Avatar, Box, Button, Chip, CircularProgress, Stack, TextField,
    ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';

// Search the organisation's students by name or parent's number and show
// suggestions while typing. Picking one hands the full record to `onSelect`.

const MODES = {
    name: { label: "Student name", placeholder: 'Type at least 2 letters of the name…', min: 2, field: 'name' },
    contact: { label: "Parent's number", placeholder: 'Type at least 3 digits, e.g. 0300…', min: 3, field: 'parentContact' },
};

// The server matches with a regular expression, so typed symbols are made literal.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Wraps the typed text in bold wherever it appears, for quick scanning. */
const Highlight = ({ text, query }) => {
    const value = String(text || '');
    const q = String(query || '').trim();
    if (!q) return value;
    const i = value.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return value;
    return (
        <>
            {value.slice(0, i)}
            <Box component="mark" sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.2), color: 'inherit', borderRadius: '3px', px: 0.25 }}>
                {value.slice(i, i + q.length)}
            </Box>
            {value.slice(i + q.length)}
        </>
    );
};

const StudentLookup = ({ adminId, onSelect, onClear, selection }) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('name');
    const [input, setInput] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const requestId = useRef(0);

    // A record chosen elsewhere (e.g. Consultations > Admit) shows as selected.
    useEffect(() => {
        if (selection) {
            setSelected(selection);
            setInput(optionLabel(selection));
        }
    }, [selection]);

    const config = MODES[mode];
    const query = mode === 'contact' ? input.replace(/\D/g, '') : input.trim();

    useEffect(() => {
        if (query.length < config.min || (selected && input === optionLabel(selected))) {
            setOptions(selected ? [selected] : []);
            setLoading(false);
            return undefined;
        }
        const id = ++requestId.current;
        setLoading(true);
        setError('');
        const timer = setTimeout(async () => {
            try {
                // Pending consultations and students are searched together.
                const [students, consultations] = await Promise.allSettled([
                    axios.post(`${process.env.REACT_APP_BASE_URL}/students/search`, { [config.field]: escapeRegex(query), id: adminId }),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/consultations/${adminId}`, { params: { status: 'pending', q: query, limit: 10 } }),
                ]);
                if (id !== requestId.current) return; // a newer search has started
                const list = (r) => (r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []);
                const fromConsultations = list(consultations)
                    .filter((c) => (mode === 'contact' ? String(c.parentContact || '').includes(query) : String(c.name || '').toLowerCase().includes(query.toLowerCase())))
                    .map((c) => ({ ...c, kind: 'consultation' }));
                const fromStudents = list(students).map((s) => ({ ...s, kind: 'student' }));
                if (students.status === 'rejected' && consultations.status === 'rejected') throw new Error('search failed');
                setOptions([...fromConsultations, ...fromStudents].slice(0, 20));
            } catch (err) {
                if (id !== requestId.current) return;
                setOptions([]);
                setError('Could not search right now. Please try again.');
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, mode, adminId]);

    const handleModeChange = (_, value) => {
        if (!value) return;
        setMode(value);
        setInput('');
        setOptions([]);
        setError('');
    };

    const handleSelect = (_, student) => {
        setSelected(student);
        if (student) onSelect(student);
    };

    const handleClear = () => {
        setSelected(null);
        setInput('');
        setOptions([]);
        setError('');
        if (onClear) onClear();
    };

    const noOptionsText = query.length < config.min
        ? (mode === 'name' ? 'Keep typing the student’s name…' : 'Keep typing the parent’s number…')
        : `No student found for "${input.trim()}"`;

    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Search by</Typography>
                <ToggleButtonGroup exclusive size="small" color="primary" value={mode} onChange={handleModeChange} aria-label="Search by">
                    <ToggleButton value="name" sx={{ px: 2, gap: 0.75 }}><PersonSearchOutlinedIcon fontSize="small" />Student name</ToggleButton>
                    <ToggleButton value="contact" sx={{ px: 2, gap: 0.75 }}><PhoneIphoneOutlinedIcon fontSize="small" />Parent's number</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
                <Autocomplete
                    sx={{ flex: 1 }}
                    options={options}
                    value={selected}
                    inputValue={input}
                    onInputChange={(_, value, reason) => {
                        if (reason === 'input' && mode === 'contact') {
                            // Parent's number: digits only, at most 11 (03XXXXXXXXX).
                            setInput(value.replace(/\D/g, '').slice(0, 11));
                            return;
                        }
                        if (reason !== 'reset' || value) setInput(value);
                    }}
                    onChange={handleSelect}
                    filterOptions={(x) => x}
                    getOptionLabel={optionLabel}
                    isOptionEqualToValue={(a, b) => a._id === b._id && a.kind === b.kind}
                    loading={loading}
                    loadingText="Searching…"
                    noOptionsText={noOptionsText}
                    autoHighlight
                    clearOnBlur={false}
                    renderOption={(props, s) => (
                        <Box component="li" {...props} key={`${s.kind}-${s._id}`} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', py: 1 }}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: (t) => alpha(t.palette.primary.main, 0.15), color: 'primary.dark' }}>
                                {initials(s.name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={{ fontWeight: 600 }} noWrap>
                                    <Highlight text={s.name} query={mode === 'name' ? input : ''} /> <Typography component="span" variant="body2" color="text.secondary">· {s.rollNum || s.consultationNo}</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    Parent: {s.parentName || 'N/A'} · <Highlight text={s.parentContact || 'no number'} query={mode === 'contact' ? query : ''} />
                                </Typography>
                            </Box>
                            <Chip size="small" variant="outlined" color={isConsultation(s) ? 'warning' : 'success'} label={isConsultation(s) ? 'Consultation' : 'Admitted'} />
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={config.label}
                            placeholder={config.placeholder}
                            helperText={error || 'Suggestions appear as you type. Pick one to fill in the form.'}
                            error={!!error}
                            inputProps={{
                                ...params.inputProps,
                                inputMode: mode === 'contact' ? 'numeric' : 'text',
                                ...(mode === 'contact' && !selected ? { pattern: '[0-9]*', type: 'tel', autoComplete: 'off' } : {}),
                            }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: <SearchIcon color="action" sx={{ ml: 0.5, mr: 0.5 }} />,
                                endAdornment: (
                                    <>
                                        {loading && <CircularProgress color="inherit" size={18} />}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
                <Button variant="outlined" onClick={handleClear} sx={{ height: 52, minWidth: 96 }}>Clear</Button>
            </Stack>

            {selected && (
                <Alert
                    severity={isConsultation(selected) ? 'success' : 'info'}
                    sx={{ mt: 2 }}
                    action={!isConsultation(selected) && (
                        <Button color="inherit" size="small" onClick={() => navigate(`/Admin/students/student/${selected._id}`)}>Open profile</Button>
                    )}
                >
                    {isConsultation(selected)
                        ? <>Filled in from <strong>{selected.name}</strong>'s consultation ({selected.consultationNo || selected.rollNum}). A new roll number has been generated; choose classes, days and fees to admit them.</>
                        : <><strong>{selected.name}</strong> ({selected.rollNum}) is already admitted. Their details are filled in below; to change them, open their profile.</>}
                </Alert>
            )}
        </Box>
    );
};

function optionLabel(s) {
    return s ? `${s.name || ''} (${s.rollNum || s.consultationNo || ''})` : '';
}

// New consultations, and older records saved as consultant students before consultations were separated.
function isConsultation(s) {
    return !!s && (s.kind === 'consultation' || s.isConsultantStudent === true);
}

export default StudentLookup;
