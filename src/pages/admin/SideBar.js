import * as React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import logo from '../../assets/logo.png';

// Each entry: label, route, icon, and how to decide it is the current page.
const MAIN_LINKS = [
    { label: 'Dashboard', to: '/Admin/dashboard', icon: SpaceDashboardOutlinedIcon, match: (p) => p === '/' || p === '/Admin' || p === '/Admin/' || p.startsWith('/Admin/dashboard') },
    { label: 'Classes', to: '/Admin/classes', icon: ClassOutlinedIcon },
    { label: 'Staff', to: '/Admin/teachers', icon: BadgeOutlinedIcon },
    { label: 'Students', to: '/Admin/students', icon: SchoolOutlinedIcon },
    { label: 'New Consultancy', to: '/Admin/AddConsultancy', icon: AssignmentIndOutlinedIcon },
    { label: 'Add Student', to: '/Admin/addstudents', icon: PersonAddAlt1OutlinedIcon },
    { label: 'Collect Fee', to: '/Admin/Fees', icon: PaymentsOutlinedIcon },
    { label: 'Fee Records', to: '/Admin/FeeRecords', icon: ReceiptLongOutlinedIcon },
    { label: 'Pay Salary', to: '/Admin/TeachersSalary', icon: AccountBalanceWalletOutlinedIcon },
    { label: 'Salary Records', to: '/Admin/Invoice', icon: RequestQuoteOutlinedIcon },
    { label: 'Complaints', to: '/Admin/complains', icon: ReportProblemOutlinedIcon },
    { label: 'Notices', to: '/Admin/notices', icon: CampaignOutlinedIcon },
];

const ACCOUNT_LINKS = [
    { label: 'Profile', to: '/Admin/profile', icon: AccountCircleOutlinedIcon },
    { label: 'Settings', to: '/Admin/settings', icon: SettingsOutlinedIcon },
];

const isActive = (link, path) => (link.match ? link.match(path) : path.toLowerCase().startsWith(link.to.toLowerCase()));

/** The deep green background, derived from the theme colour so presets still apply. */
export const sidebarBackground = (theme) => {
    const base = theme.palette.primary.main;
    return `radial-gradient(120% 60% at 0% 0%, ${alpha('#ffffff', 0.08)} 0%, transparent 60%),
        linear-gradient(180deg, ${darken(base, 0.5)} 0%, ${darken(base, 0.62)} 100%)`;
};

const NavItem = ({ link, active, onNavigate }) => {
    const Icon = link.icon;
    return (
        <ListItemButton
            component={Link}
            to={link.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            sx={(theme) => ({
                // Full-width bands like the reference, instead of the theme's rounded pills.
                m: 0,
                borderRadius: 0,
                px: 3,
                py: 1.25,
                color: alpha('#ffffff', 0.86),
                borderLeft: '4px solid transparent',
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
                '& .MuiListItemText-primary': { fontSize: '0.95rem', fontWeight: 500 },
                '&:hover': { backgroundColor: alpha('#ffffff', 0.08), color: '#ffffff' },
                ...(active && {
                    backgroundColor: `${theme.palette.primary.main} !important`,
                    borderLeftColor: '#ffffff',
                    color: '#ffffff',
                    '& .MuiListItemText-primary': { fontSize: '0.95rem', fontWeight: 700 },
                }),
            })}
        >
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={link.label} />
        </ListItemButton>
    );
};

/**
 * Full sidebar: brand block, navigation and a Logout pinned to the bottom.
 * `onNavigate` lets the mobile drawer close itself after a link is chosen.
 */
const SideBar = ({ onNavigate }) => {
    const { pathname } = useLocation();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#ffffff' }}>
            <Box sx={{ px: 3, pt: 3.5, pb: 2.5, textAlign: 'center' }}>
                <Box
                    component={Link}
                    to="/Admin/dashboard"
                    onClick={onNavigate}
                    aria-label="TherapyHome dashboard"
                    sx={{
                        mx: 'auto', width: 92, height: 92, borderRadius: '50%', display: 'grid', placeItems: 'center',
                        backgroundColor: '#ffffff', boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                    }}
                >
                    <Box component="img" src={logo} alt="TherapyHome" sx={{ width: 76, height: 76, objectFit: 'contain' }} />
                </Box>
                <Typography sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.01em', color: '#ffffff' }}>
                    Therapy Home
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: alpha('#ffffff', 0.7), letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Admin Panel
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pb: 1 }}>
                <List component="nav" aria-label="Main" disablePadding>
                    {MAIN_LINKS.map((link) => (
                        <NavItem key={link.to} link={link} active={isActive(link, pathname)} onNavigate={onNavigate} />
                    ))}
                </List>
                <Box sx={{ mx: 3, my: 1.5, borderTop: `1px solid ${alpha('#ffffff', 0.16)}` }} />
                <List component="nav" aria-label="Account" disablePadding>
                    {ACCOUNT_LINKS.map((link) => (
                        <NavItem key={link.to} link={link} active={isActive(link, pathname)} onNavigate={onNavigate} />
                    ))}
                </List>
            </Box>

            <Box sx={{ borderTop: `1px solid ${alpha('#ffffff', 0.16)}` }}>
                <NavItem link={{ label: 'Logout', to: '/Admin/logout', icon: LogoutOutlinedIcon }} active={false} onNavigate={onNavigate} />
            </Box>
        </Box>
    );
};

export default SideBar;
