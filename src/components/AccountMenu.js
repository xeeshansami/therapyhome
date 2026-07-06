import React, { useState } from 'react';
import {
    Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip,
    Typography, Badge, Stack,
} from '@mui/material';
import { Settings, Logout } from '@mui/icons-material';
import { Bell, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Presentation-only enhancements. All original logic preserved: anchor state,
// handleClick/handleClose/handleLogout, role-based profile link, and the exact
// navigate('/admin/logout') target. Added: a notification bell (with its own
// empty-state menu) and a richer profile header inside the account menu.

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Notification menu (presentational — no backend wiring changed).
    const [notifAnchor, setNotifAnchor] = useState(null);
    const notifOpen = Boolean(notifAnchor);

    const { currentRole, currentUser } = useSelector(state => state.user);

    const navigate = useNavigate(); // ← Hook for programmatic navigation

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Optionally: clear auth state here
        // dispatch(logoutUser()); or localStorage.clear();
        navigate('/admin/logout'); // ← Navigating to logout page
    };

    const displayName = currentUser && currentUser.name ? String(currentUser.name) : 'User';
    const initial = displayName.charAt(0).toUpperCase();
    const email = (currentUser && (currentUser.email || currentUser.rollNum)) || '';

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: 0.5 }}>
                <Tooltip title="Notifications">
                    <IconButton
                        onClick={(e) => setNotifAnchor(e.currentTarget)}
                        size="small"
                        aria-label="notifications"
                        sx={{ color: 'text.secondary' }}
                    >
                        <Badge color="error" variant="dot" overlap="circular">
                            <Bell size={20} />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Account settings">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 0.5 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                fontSize: 15,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                            }}
                        >
                            {initial}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Notifications menu (empty state) */}
            <Menu
                anchorEl={notifAnchor}
                open={notifOpen}
                onClose={() => setNotifAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { width: 300, p: 1 } }}
            >
                <Typography variant="subtitle2" sx={{ px: 1.5, py: 1, fontWeight: 700 }}>
                    Notifications
                </Typography>
                <Divider />
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Bell size={26} style={{ opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        You're all caught up
                    </Typography>
                </Box>
            </Menu>

            {/* Account menu */}
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{ elevation: 0, sx: styles.styledPaper }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                            }}
                        >
                            {initial}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                                {displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                                {email || currentRole}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <Divider />
                <MenuItem component={Link} to={`/${currentRole}/profile`}>
                    <ListItemIcon>
                        <UserRound size={18} />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
};

export default AccountMenu;

const styles = {
    styledPaper: {
        overflow: 'visible',
        mt: 1.5,
        minWidth: 240,
        '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
        },
        '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
        },
    }
};
