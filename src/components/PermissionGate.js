import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { can } from '../utils/permissions';

/** Shows the page only when the signed-in admin holds module.action (the API checks again). */
const PermissionGate = ({ module, action = 'view', children }) => {
    const { currentUser } = useSelector((s) => s.user);
    if (can(currentUser, module, action)) return children;
    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
                <LockOutlinedIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>No access</Typography>
                <Typography color="text.secondary">Your admin account has not been given access to this area. Ask the super admin.</Typography>
            </Paper>
        </Box>
    );
};

export default PermissionGate;
