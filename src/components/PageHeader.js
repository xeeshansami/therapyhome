import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

/** Page title block shared by every admin page, matching the dashboard. */
const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
    <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
    >
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0 }}>
            {Icon && (
                <Box
                    sx={{
                        width: 48, height: 48, flex: '0 0 48px', borderRadius: '12px', display: 'grid', placeItems: 'center',
                        color: 'primary.dark', bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    }}
                >
                    <Icon />
                </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.9rem' }, lineHeight: 1.15 }}>
                    {title}
                </Typography>
                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </Box>
        </Stack>
        {actions && (
            <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {actions}
            </Stack>
        )}
    </Stack>
);

/** Outer padding and width used by every admin page. */
export const PageShell = ({ children }) => (
    <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3.5 }, maxWidth: 1600, mx: 'auto' }}>{children}</Box>
);

export default PageHeader;
