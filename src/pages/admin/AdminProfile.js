import React from 'react';
import { useSelector } from 'react-redux';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';

// Read-only profile. The admin model holds name, email, schoolName and role,
// and the backend's update route for admins is not enabled, so nothing here is
// editable and no extra fields are invented.
const DetailRow = ({ icon: Icon, label, value }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1.75 }}>
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                color: 'primary.main',
                flexShrink: 0,
            }}
        >
            <Icon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                {value || '—'}
            </Typography>
        </Box>
    </Stack>
);

const initialsOf = (name) =>
    String(name || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || '?';

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Profile</Typography>
                <Typography variant="body2" color="text.secondary">
                    Your account details.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent
                            sx={{
                                p: { xs: 3, md: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 88,
                                    height: 88,
                                    mb: 2,
                                    fontSize: 30,
                                    fontWeight: 700,
                                    bgcolor: 'primary.main',
                                }}
                            >
                                {initialsOf(currentUser?.name)}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {currentUser?.name || '—'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                {currentUser?.email || '—'}
                            </Typography>
                            {currentUser?.role && (
                                <Chip label={currentUser.role} size="small" color="primary" variant="outlined" sx={{ mt: 1.5 }} />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Account details
                            </Typography>
                            <Divider />
                            <DetailRow icon={BadgeOutlinedIcon} label="Name" value={currentUser?.name} />
                            <Divider />
                            <DetailRow icon={MailOutlineIcon} label="Email" value={currentUser?.email} />
                            <Divider />
                            <DetailRow icon={ApartmentOutlinedIcon} label="Organisation" value={currentUser?.schoolName} />
                            <Divider />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                These details are read-only — the app has no account update endpoint.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminProfile;
