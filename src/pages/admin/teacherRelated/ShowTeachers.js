import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Chip, Stack, Typography } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';
import { internLabel, formatTime } from '../../../utils/staffForm';

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);
    const [toDelete, setToDelete] = useState(null); // { id, name }
    const [message, setMessage] = useState('');

    useEffect(() => { dispatch(getAllTeachers(currentUser._id)); }, [currentUser._id, dispatch]);

    const rows = useMemo(() => (Array.isArray(teachersList) ? teachersList : []).map((t) => ({
        ...t,
        designationText: t.role || '',
        // Non-teaching staff are filed under a placeholder class; it is not their designation.
        classText: String(t.role || '').toLowerCase() === 'teacher' ? (t.teachSclass?.sclassName || '') : '',
    })), [teachersList]);

    const handleDeleted = (result) => {
        setToDelete(null);
        setMessage(result?.message || 'Record Deleted Successfully.');
        dispatch(getAllTeachers(currentUser._id));
    };

    const columns = [
        {
            id: 'name', label: 'Staff Member', minWidth: 200,
            render: (r) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={r.photo} sx={{ width: 36, height: 36 }}>{(r.name || '?')[0]}</Avatar>
                    <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
                </Stack>
            ),
        },
        {
            id: 'designationText', label: 'Designation', highlight: true, minWidth: 150,
            render: (r) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>{r.role || '—'}</span>
                    {internLabel(r) && <Chip size="small" variant="outlined" color={r.internType === 'unpaid' ? 'default' : 'primary'} label={internLabel(r)} />}
                </Stack>
            ),
        },
        { id: 'phone', label: 'Phone' },
        { id: 'email', label: 'Email', minWidth: 180 },
        {
            id: 'schedule', label: 'Scheduled Hours',
            render: (r) => (r.scheduledCheckIn ? `${formatTime(r.scheduledCheckIn)} – ${formatTime(r.scheduledCheckOut)}` : '—'),
        },
        { id: 'classText', label: 'Class', render: (r) => r.classText || '—' },
    ];

    return (
        <PageShell>
            <PageHeader
                icon={BadgeOutlinedIcon}
                title="Staff"
                subtitle={`${rows.length} staff member${rows.length === 1 ? '' : 's'}`}
                actions={<Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => navigate('/Admin/teachers/chooseclass')}>Add Staff</Button>}
            />
            <DataTable
                columns={columns}
                rows={rows}
                loading={loading && rows.length === 0}
                searchKeys={['name', 'designationText', 'phone', 'email', 'classText']}
                searchPlaceholder="Search by name, designation, phone or email"
                emptyText="No staff yet. Add someone with Add Staff."
                actions={(r) => (
                    <>
                        <RowButton onClick={() => navigate(`/Admin/teachers/teacher/${r._id}`)}>View</RowButton>
                        <RowButton color="error" onClick={() => setToDelete({ id: r._id, name: r.name })}>Delete</RowButton>
                    </>
                )}
            />
            <Popup open={!!message} message={message} success onClose={() => setMessage('')} />
            <OtpActionDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onSuccess={handleDeleted}
                adminId={currentUser?._id}
                actionType="delete"
                targetType="teacher"
                targetId={toDelete?.id}
                targetName={toDelete?.name}
            />
        </PageShell>
    );
};

export default ShowTeachers;
