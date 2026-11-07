import React from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

/**
 * Picks the classes (therapy sessions and programs) a staff member teaches.
 * They decide which students the staff member sees and marks in the app.
 * value: array of class ids; classes: [{ _id, sclassName, timingType }]
 */
const ClassMultiSelect = ({ classes, value, onChange, required = false, error, helperText, label = 'Classes taught (sessions & programs)' }) => {
    const selected = value.map((id) => classes.find((c) => c._id === id)).filter(Boolean);
    return (
        <Autocomplete
            multiple
            options={classes}
            value={selected}
            disableCloseOnSelect
            getOptionLabel={(c) => c.sclassName}
            isOptionEqualToValue={(a, b) => a._id === b._id}
            onChange={(e, next) => onChange(next.map((c) => c._id))}
            renderOption={(props, c) => (
                <li {...props} key={c._id}>
                    <Box>
                        <Typography>{c.sclassName}</Typography>
                        {c.timingType && <Typography variant="caption" color="text.secondary">{c.timingType}</Typography>}
                    </Box>
                </li>
            )}
            renderTags={(items, getTagProps) => items.map((c, i) => <Chip {...getTagProps({ index: i })} key={c._id} size="small" color="primary" variant="outlined" label={c.sclassName} />)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    required={required && selected.length === 0}
                    error={!!error}
                    helperText={error || helperText || 'The staff member sees and marks attendance for the students of these classes in the app.'}
                />
            )}
        />
    );
};

export default ClassMultiSelect;
