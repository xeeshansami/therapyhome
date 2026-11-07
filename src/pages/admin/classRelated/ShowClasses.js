import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AddCardIcon from '@mui/icons-material/AddCard';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import DataTable, { RowButton } from '../../../components/DataTable';
import PageHeader, { PageShell } from '../../../components/PageHeader';
import Popup from '../../../components/Popup';
import OtpActionDialog from '../../../components/OtpActionDialog';

const money = (v) => `Rs. ${(Number(v) || 0).toLocaleString()}`;

const ShowClasses = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassesList, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser._id;
    const [toDelete, setToDelete] = useState(null); // { id, name }
    const [message, setMessage] = useState('');

    useEffect(() => { dispatch(getAllSclasses(adminID, 'Sclass')); }, [adminID, dispatch]);

    const rows = useMemo(() => (Array.isArray(sclassesList) ? sclassesList : []), [sclassesList]);

    // The server refuses while any student, staff member or fee slip still uses the class.
    const handleDeleted = (result) => {
        setToDelete(null);
        setMessage(result?.message || 'Class Deleted Successfully.');
        dispatch(getAllSclasses(adminID, 'Sclass'));
    };

    const columns = [
        { id: 'sclassName', label: 'Class / Programme', minWidth: 180 },
        { id: 'timingType', label: 'Timing Type', render: (r) => r.timingType || '—' },
        { id: 'timingSlot', label: 'Time Slot', minWidth: 200, render: (r) => r.timingSlot || '—' },
        { id: 'sclassFee', label: 'Fee per Session', align: 'center', highlight: true, render: (r) => money(r.sclassFee) },
        { id: 'createdAt', label: 'Added', render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—') },
    ];

    return (
        <PageShell>
            <PageHeader
                icon={ClassOutlinedIcon}
                title="Classes"
                subtitle="Therapy programmes, their timings and fee per session"
                actions={<Button variant="contained" startIcon={<AddCardIcon />} onClick={() => navigate('/Admin/addclass')}>Add Class</Button>}
            />
            <DataTable
                columns={columns}
                rows={rows}
                loading={loading && rows.length === 0}
                searchKeys={['sclassName', 'timingType', 'timingSlot']}
                searchPlaceholder="Search classes"
                emptyText="No classes yet. Add one with Add Class."
                actions={(r) => (
                    <>
                        <RowButton onClick={() => navigate(`/Admin/classes/class/${r._id}`)}>View</RowButton>
                        <RowButton color="error" onClick={() => setToDelete({ id: r._id, name: r.sclassName })}>Delete</RowButton>
                    </>
                )}
            />
            <Popup open={!!message} message={message} success onClose={() => setMessage('')} />
            <OtpActionDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onSuccess={handleDeleted}
                adminId={adminID}
                actionType="delete"
                targetType="sclass"
                targetId={toDelete?.id}
                targetName={toDelete?.name}
            />
        </PageShell>
    );
};

export default ShowClasses;
