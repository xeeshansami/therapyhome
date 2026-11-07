import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

const Figure = ({ label, value, color }) => (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => alpha(t.palette[color] ? t.palette[color].main : t.palette.grey[500], 0.1) }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
);

/** Today's staff check-ins (from the staff app) and therapy sessions. */
const AttendanceToday = ({ refreshKey }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        let alive = true;
        axios.get(`${process.env.REACT_APP_BASE_URL}/attendance/overview`)
            .then(({ data: d }) => alive && setData(d))
            .catch(() => alive && setError(true));
        return () => { alive = false; };
    }, [refreshKey]);

    return (
        <Card variant="outlined" sx={{ borderRadius: '14px' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={1}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <EventAvailableOutlinedIcon color="primary" />
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Today's attendance</Typography>
                            <Typography variant="caption" color="text.secondary">Staff check-ins from the app and therapy sessions marked today</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button size="small" component={RouterLink} to="/Admin/attendance">Staff</Button>
                        <Button size="small" component={RouterLink} to="/Admin/sessions">Sessions</Button>
                    </Stack>
                </Stack>
                {error && <Typography color="text.secondary">Attendance is not available right now.</Typography>}
                {!error && !data && <Skeleton variant="rounded" height={80} />}
                {data && (
                    <Grid container spacing={1.5}>
                        {[
                            ['Staff present', `${data.staff.present}/${data.staff.total}`, 'success'],
                            ['On site now', data.staff.onSite, 'primary'],
                            ['Late', data.staff.late, 'warning'],
                            ['Absent / leave', data.staff.absent + data.staff.leave, 'error'],
                            ['Not marked', data.staff.notMarked, 'info'],
                            ['Sessions attended', `${data.sessions.attended}/${data.sessions.total}`, 'secondary'],
                        ].map(([label, value, color]) => (
                            <Grid item xs={6} sm={4} md={2} key={label}><Figure label={label} value={value} color={color} /></Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceToday;
