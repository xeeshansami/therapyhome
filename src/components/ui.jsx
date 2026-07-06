import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Button,
    Breadcrumbs,
    Link as MuiLink,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

// =============================================================================
// Reusable premium UI primitives (presentation only — no business logic).
// These are additive: existing pages are untouched. Adopt them incrementally,
// e.g.  import { PageHeader, SectionCard, StatCard, StatusBadge, EmptyState,
// TableSkeleton, GhostButton } from '../../components/ui';
// Everything reads from the MUI theme, so light/dark + palette come for free.
// =============================================================================

const MotionCard = motion(Card);
const MotionDiv = motion.div;

export const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
    }),
};

/** Page title + optional breadcrumbs + right-aligned actions. */
export function PageHeader({ title, subtitle, breadcrumbs, actions }) {
    return (
        <MotionDiv variants={fadeUp} initial="hidden" animate="show">
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
                        <Breadcrumbs sx={{ mb: 0.5, fontSize: 13 }} aria-label="breadcrumb">
                            {breadcrumbs.map((b, i) =>
                                b.href && i < breadcrumbs.length - 1 ? (
                                    <MuiLink key={i} underline="hover" color="inherit" href={b.href} sx={{ fontSize: 13 }}>
                                        {b.label}
                                    </MuiLink>
                                ) : (
                                    <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
                                        {b.label}
                                    </Typography>
                                )
                            )}
                        </Breadcrumbs>
                    )}
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {actions && <Box>{actions}</Box>}
            </Stack>
        </MotionDiv>
    );
}

/** Rounded card with an optional header (title/icon/action) and body. */
export function SectionCard({ title, subtitle, icon, action, children, sx, ...rest }) {
    const theme = useTheme();
    return (
        <MotionCard
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            sx={{ borderRadius: 4, ...sx }}
            {...rest}
        >
            {(title || action) && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {icon && (
                            <Box sx={{ color: 'primary.main', display: 'grid', placeItems: 'center' }}>{icon}</Box>
                        )}
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    {action}
                </Stack>
            )}
            <CardContent sx={{ p: 3 }}>{children}</CardContent>
        </MotionCard>
    );
}

/** Gradient statistic card with icon and optional delta chip. */
export function StatCard({ label, value, icon, gradient, delta, index = 0 }) {
    return (
        <MotionCard
            variants={fadeUp}
            custom={index}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -6 }}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                border: 'none',
                background: gradient || 'linear-gradient(135deg, #4F80FF 0%, #2563EB 100%)',
                minHeight: 140,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            {label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                            {value}
                        </Typography>
                        {delta != null && (
                            <Chip
                                size="small"
                                label={delta}
                                sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                            />
                        )}
                    </Box>
                    {icon && (
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.22)',
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                </Stack>
            </CardContent>
            <Box
                sx={{
                    position: 'absolute',
                    right: -28,
                    bottom: -28,
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.12)',
                }}
            />
        </MotionCard>
    );
}

const STATUS_MAP = {
    active: { color: 'success', label: 'Active' },
    paid: { color: 'success', label: 'Paid' },
    approved: { color: 'success', label: 'Approved' },
    success: { color: 'success', label: 'Success' },
    completed: { color: 'success', label: 'Completed' },
    pending: { color: 'warning', label: 'Pending' },
    processing: { color: 'warning', label: 'Processing' },
    overdue: { color: 'error', label: 'Overdue' },
    failed: { color: 'error', label: 'Failed' },
    rejected: { color: 'error', label: 'Rejected' },
    inactive: { color: 'default', label: 'Inactive' },
    draft: { color: 'default', label: 'Draft' },
};

/** Coloured status pill. Pass a known status key or {label,color}. */
export function StatusBadge({ status, label, color }) {
    const key = typeof status === 'string' ? status.toLowerCase() : '';
    const cfg = STATUS_MAP[key] || { color: color || 'default', label: label || status || '—' };
    return (
        <Chip
            size="small"
            label={label || cfg.label}
            color={color || cfg.color}
            variant={(color || cfg.color) === 'default' ? 'outlined' : 'filled'}
            sx={{ fontWeight: 700, borderRadius: 2 }}
        />
    );
}

/** Friendly empty state with optional action. */
export function EmptyState({ icon, title = 'Nothing here yet', description, action }) {
    const theme = useTheme();
    return (
        <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 7, px: 3, textAlign: 'center' }}>
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'primary.main',
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.05)',
                    }}
                >
                    {icon || <Inbox size={30} />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                {description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                        {description}
                    </Typography>
                )}
                {action && <Box sx={{ mt: 1 }}>{action}</Box>}
            </Stack>
        </MotionDiv>
    );
}

/** Skeleton placeholder shaped like a data table. */
export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <Table>
            <TableBody>
                {Array.from({ length: rows }).map((_, r) => (
                    <TableRow key={r}>
                        {Array.from({ length: cols }).map((__, c) => (
                            <TableCell key={c} sx={{ border: 'none' }}>
                                <Skeleton variant="rounded" height={22} width={c === 0 ? '60%' : '85%'} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

/** Subtle "ghost" button (transparent, fills on hover). */
export function GhostButton(props) {
    return <Button variant="text" {...props} />;
}

const ui = {
    PageHeader,
    SectionCard,
    StatCard,
    StatusBadge,
    EmptyState,
    TableSkeleton,
    GhostButton,
    fadeUp,
};

export default ui;
