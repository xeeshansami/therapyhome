import React from 'react';
import {
    Box, Button, Checkbox, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { ACTION_LABELS, presetPermissions } from '../utils/permissions';

const ALL_ACTIONS = ['view', 'add', 'edit', 'delete'];

/**
 * Module x action grid the super admin uses to grant a Limited Admin access.
 * Turning on Add/Edit/Delete also turns on View; turning off View turns the module off.
 * School settings and admin management are never in this list: only the super admin has them.
 */
const PermissionMatrix = ({ modules, value, onChange, disabled = false }) => {
    const toggle = (mod, action, on) => {
        const row = { ...(value[mod.key] || {}) };
        row[action] = on;
        if (action !== 'view' && on) row.view = true;
        if (action === 'view' && !on) mod.actions.forEach((a) => { row[a] = false; });
        onChange({ ...value, [mod.key]: row });
    };
    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 'auto', alignSelf: 'center' }}>Permissions</Typography>
                <Button size="small" disabled={disabled} onClick={() => onChange(presetPermissions(modules, 'view'))}>View only</Button>
                <Button size="small" disabled={disabled} onClick={() => onChange(presetPermissions(modules, 'full'))}>All operations</Button>
                <Button size="small" color="inherit" disabled={disabled} onClick={() => onChange(presetPermissions(modules, 'none'))}>None</Button>
            </Stack>
            <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Module</TableCell>
                            {ALL_ACTIONS.map((a) => <TableCell key={a} align="center">{ACTION_LABELS[a]}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {modules.map((m) => (
                            <TableRow key={m.key} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{m.label}</TableCell>
                                {ALL_ACTIONS.map((a) => (
                                    <TableCell key={a} align="center" padding="checkbox">
                                        {m.actions.includes(a) ? (
                                            <Checkbox
                                                size="small" disabled={disabled}
                                                checked={!!(value[m.key] && value[m.key][a])}
                                                onChange={(e) => toggle(m, a, e.target.checked)}
                                                inputProps={{ 'aria-label': `${m.label}: ${ACTION_LABELS[a]}` }}
                                            />
                                        ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                System settings, fees and late-fee rules, attendance rules and admin management stay with the super admin and cannot be granted.
            </Typography>
        </Box>
    );
};

export default PermissionMatrix;
