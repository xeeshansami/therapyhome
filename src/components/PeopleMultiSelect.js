import React from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

/**
 * Picks several people (staff for a student, or students for a staff member).
 * value: array of ids; options: [{ _id, name, ... }]. `subtitle(o)` adds a
 * second line (roll number, designation). Withdrawn people are marked.
 */
const PeopleMultiSelect = ({ options, value, onChange, label, helperText, subtitle = () => '', disabled = false }) => {
    const selected = value.map((id) => options.find((o) => String(o._id) === String(id))).filter(Boolean);
    return (
        <Autocomplete
            multiple
            disabled={disabled}
            options={options}
            value={selected}
            disableCloseOnSelect
            filterSelectedOptions
            getOptionLabel={(o) => o.name || ''}
            isOptionEqualToValue={(a, b) => String(a._id) === String(b._id)}
            onChange={(e, next) => onChange(next.map((o) => String(o._id)))}
            renderOption={(props, o) => (
                <li {...props} key={o._id}>
                    <Box>
                        <Typography>{o.name}{o.status === 'withdrawn' ? ' (withdrawn)' : ''}</Typography>
                        {subtitle(o) && <Typography variant="caption" color="text.secondary">{subtitle(o)}</Typography>}
                    </Box>
                </li>
            )}
            renderTags={(items, getTagProps) => items.map((o, i) => (
                <Chip {...getTagProps({ index: i })} key={o._id} size="small" color={o.status === 'withdrawn' ? 'default' : 'primary'} variant="outlined" label={o.name} />
            ))}
            renderInput={(params) => <TextField {...params} label={label} helperText={helperText} />}
        />
    );
};

export default PeopleMultiSelect;
