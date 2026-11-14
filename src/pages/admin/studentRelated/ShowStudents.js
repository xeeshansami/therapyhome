import React, { useEffect, useMemo, useState } from 'react';
import { can } from '../../../utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Chip, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading } = useSelector((state) => state.student);
    const { currentUser } = useSelector((state) => state.user);

    const [classes, setClasses] = useState([]);
    const [toDelete, setToDelete] = useState(null); // { id, name }
    const [message, setMessage] = useState('');
    const [view, setView] = useState('active'); // active | withdrawn | all

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
        axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${currentUser._id}`)
            .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
            .catch(() => setClasses([]));
    }, [currentUser._id, dispatch]);

    const classNameById = useMemo(() => Object.fromEntries(classes.map((c) => [c._id, c.sclassName])), [classes]);

    const allStudents = useMemo(() => (Array.isArray(studentsList) ? studentsList : []), [studentsList]);
    const withdrawnCount = allStudents.filter((s) => s.status === 'withdrawn').length;
    const rows = useMemo(() => allStudents.filter((s) => (view === 'all' ? true : view === 'withdrawn' ? s.status === 'withdrawn' : s.status !== 'withdrawn')).map((s) => ({
        ...s,
        classNames: (s.className || []).map((c) => classNameById[idOf(c)]).filter(Boolean).join(', ')
            || (s.sclassName && (s.sclassName.sclassName || classNameById[idOf(s.sclassName)])) || '',
    })), [allStudents, classNameById, view]);

    // Deleting archives the student and keeps all fee slips (see the server's verified flow).
    const handleDeleted = (result) => {
        setToDelete(null);
        setMessage(result?.message || 'Record Deleted Successfully.');
        dispatch(getAllStudents(currentUser._id));
    };

    const columns = [
        { id: 'rollNum', label: 'Roll No.', highlight: true },
        { id: 'name', label: 'Student', minWidth: 160, render: (r) => (r.status === 'withdrawn' ? <Stack direction="row" spacing={1} alignItems="center"><span>{r.name}</span><Chip size="small" color="warning" label="Withdrawn" /></Stack> : r.name) },
        { id: 'parentName', label: 'Parent / Guardian', minWidth: 150, render: (r) => r.parentName || '—' },
        { id: 'parentContact', label: 'Contact', render: (r) => r.parentContact || '—' },
        { id: 'classNames', label: 'Classes', minWidth: 160, render: (r) => r.classNames || '—' },
        { id: 'admissionDate', label: 'Admitted', render: (r) => r.admissionDate || '—' },
    ];

    return (
        <PageShell>
            <PageHeader
                icon={SchoolOutlinedIcon}
                title="Students"
                subtitle={`${rows.length} ${view === 'withdrawn' ? 'withdrawn' : 'admitted'} student${rows.length === 1 ? '' : 's'}${view === 'active' && withdrawnCount ? ` · ${withdrawnCount} withdrawn hidden` : ''}`}
                actions={(
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ToggleButtonGroup size="small" exclusive value={view} onChange={(e, v) => v && setView(v)}>
                            <ToggleButton value="active">Active</ToggleButton>
                            <ToggleButton value="withdrawn">Withdrawn</ToggleButton>
                            <ToggleButton value="all">All</ToggleButton>
                        </ToggleButtonGroup>
                        {can(currentUser, 'students', 'add') && <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => navigate('/Admin/addstudents')}>Add Student</Button>}
                    </Stack>
                )}
            />
            <DataTable
                columns={columns}
                rows={rows}
                loading={loading && rows.length === 0}
                searchKeys={['name', 'rollNum', 'parentName', 'parentContact', 'classNames']}
                searchPlaceholder="Search by name, roll no., parent or contact"
                emptyText="No students yet. Add one from Add Student."
                actions={(r) => (
                    <>
                        <RowButton onClick={() => navigate(`/Admin/students/student/${r._id}`)}>View</RowButton>
                        {can(currentUser, 'students', 'delete') && <RowButton color="error" onClick={() => setToDelete({ id: r._id, name: `${r.name} (${r.rollNum})` })}>Delete</RowButton>}
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
                targetType="student"
                targetId={toDelete?.id}
                targetName={toDelete?.name}
            />
        </PageShell>
    );
};

export default ShowStudents;
