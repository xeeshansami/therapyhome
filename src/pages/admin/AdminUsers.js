import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography,
} from '@mui/material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import DataTable, { RowButton } from '../../components/DataTable';
import PageHeader, { PageShell } from '../../components/PageHeader';
import VerifyAdminDialog from '../../components/VerifyAdminDialog';

const API = process.env.REACT_APP_BASE_URL;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const passwordProblem = (p) => (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p) ? 'At least 8 characters, with letters and numbers.' : '');

/** Super admin only: add admins who manage the same school, disable them, or reset their sign-in. */
const AdminUsers = () => {
    const [data, setData] = useState({ superAdmin: null, admins: [] });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState(null);
    const [reset, setReset] = useState(null);
    const [verify, setVerify] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admins`);
            setData(res.data);
        } catch (e) {
            setMessage({ severity: 'error', text: e.response?.data?.message || 'Could not load admins.' });
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const formErrors = form ? {
        name: !form.name.trim() ? 'Required' : '',
        email: !EMAIL_RE.test(form.email.trim()) ? 'Enter a valid email' : '',
        temporaryPassword: passwordProblem(form.temporaryPassword),
        newAdminKey: form.newAdminKey.length < 6 ? 'At least 6 characters' : '',
    } : {};
    const formValid = form && Object.values(formErrors).every((e) => !e);

    const submitNew = () => setVerify({
        title: 'Add admin',
        description: 'Confirm with your super admin password and admin key.',
        run: async (secrets) => {
            await axios.post(`${API}/admins`, {
                name: form.name.trim(), email: form.email.trim(), temporaryPassword: form.temporaryPassword, newAdminKey: form.newAdminKey,
                ...secrets,
            });
            setMessage({ severity: 'success', text: `${form.name.trim()} was added. Give them the temporary password and their admin key in person; they must choose a new password at first sign-in.` });
            setForm(null);
            load();
        },
    });

    const toggle = (row) => setVerify({
        title: row.active ? `Disable ${row.name}` : `Enable ${row.name}`,
        description: row.active ? 'They are signed out at once and cannot sign in until enabled again.' : 'They can sign in again with their current password.',
        run: async (secrets) => {
            await axios.put(`${API}/admins/${row._id}`, { active: !row.active, ...secrets });
            setMessage({ severity: 'success', text: `${row.name} is now ${row.active ? 'disabled' : 'enabled'}.` });
            load();
        },
    });

    const submitReset = () => setVerify({
        title: `Reset sign-in for ${reset.row.name}`,
        description: 'They are signed out and must choose a new password at their next sign-in.',
        run: async (secrets) => {
            const body = { ...secrets, temporaryPassword: reset.temporaryPassword };
            if (reset.newAdminKey) body.newAdminKey = reset.newAdminKey;
            await axios.put(`${API}/admins/${reset.row._id}`, body);
            setMessage({ severity: 'success', text: `${reset.row.name}'s sign-in was reset.` });
            setReset(null);
            load();
        },
    });

    return (
        <PageShell>
            <PageHeader
                icon={AdminPanelSettingsOutlinedIcon}
                title="Admins"
                subtitle="People who manage TherapyHome with you. Admins can do everything except manage other admins."
                actions={<Button variant="contained" onClick={() => setForm({ name: '', email: '', temporaryPassword: '', newAdminKey: '' })}>Add admin</Button>}
            />
            {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
            {data.superAdmin && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Super admin: <b>{data.superAdmin.name}</b> ({data.superAdmin.email})
                </Typography>
            )}
            <DataTable
                loading={loading}
                rows={data.admins}
                searchKeys={['name', 'email']}
                searchPlaceholder="Search admins"
                emptyText="No other admins yet."
                columns={[
                    { id: 'name', label: 'Name', render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography> },
                    { id: 'email', label: 'Email' },
                    { id: 'active', label: 'Status', highlight: true, render: (r) => (
                        <Stack direction="row" spacing={0.5}>
                            <Chip size="small" color={r.active ? 'success' : 'default'} label={r.active ? 'Active' : 'Disabled'} />
                            {r.mustChangePassword && <Chip size="small" variant="outlined" color="warning" label="Temporary password" />}
                        </Stack>
                    ) },
                    { id: 'lastLoginAt', label: 'Last sign-in', render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString('en-PK') : 'Never') },
                    { id: 'createdAt', label: 'Added', render: (r) => new Date(r.createdAt).toLocaleDateString('en-PK') },
                ]}
                actions={(r) => (
                    <>
                        <RowButton onClick={() => setReset({ row: r, temporaryPassword: '', newAdminKey: '' })}>Reset sign-in</RowButton>
                        <RowButton color={r.active ? 'error' : 'primary'} onClick={() => toggle(r)}>{r.active ? 'Disable' : 'Enable'}</RowButton>
                    </>
                )}
            />

            <Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth="sm">
                <DialogTitle>Add admin</DialogTitle>
                <DialogContent>
                    {form && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!form.name && !!formErrors.name} inputProps={{ maxLength: 80 }} />
                            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={!!form.email && !!formErrors.email} helperText={form.email && formErrors.email} />
                            <TextField label="Temporary password" type="password" autoComplete="new-password" value={form.temporaryPassword} onChange={(e) => setForm((f) => ({ ...f, temporaryPassword: e.target.value }))} error={!!form.temporaryPassword && !!formErrors.temporaryPassword} helperText={formErrors.temporaryPassword || 'They must replace it at first sign-in.'} />
                            <TextField label="Their admin key" type="password" autoComplete="new-password" value={form.newAdminKey} onChange={(e) => setForm((f) => ({ ...f, newAdminKey: e.target.value }))} error={!!form.newAdminKey && !!formErrors.newAdminKey} helperText={formErrors.newAdminKey || 'Used with their password to confirm sensitive changes. Stored encrypted; keep a note of it.'} />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setForm(null)}>Cancel</Button>
                    <Button variant="contained" disabled={!formValid} onClick={submitNew}>Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!reset} onClose={() => setReset(null)} fullWidth maxWidth="sm">
                <DialogTitle>Reset sign-in{reset ? ` for ${reset.row.name}` : ''}</DialogTitle>
                <DialogContent>
                    {reset && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="New temporary password" type="password" autoComplete="new-password" value={reset.temporaryPassword} onChange={(e) => setReset((r) => ({ ...r, temporaryPassword: e.target.value }))} error={!!reset.temporaryPassword && !!passwordProblem(reset.temporaryPassword)} helperText={passwordProblem(reset.temporaryPassword) || ' '} />
                            <TextField label="New admin key (optional)" type="password" autoComplete="new-password" value={reset.newAdminKey} onChange={(e) => setReset((r) => ({ ...r, newAdminKey: e.target.value }))} helperText="Leave blank to keep their current key." />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReset(null)}>Cancel</Button>
                    <Button variant="contained" disabled={!reset || !!passwordProblem(reset.temporaryPassword) || (reset.newAdminKey && reset.newAdminKey.length < 6)} onClick={submitReset}>Reset</Button>
                </DialogActions>
            </Dialog>

            <VerifyAdminDialog
                open={!!verify}
                title={verify?.title}
                description={verify?.description}
                confirmLabel="Confirm"
                onClose={() => setVerify(null)}
                onConfirm={async (secrets) => { await verify.run(secrets); setVerify(null); }}
            />
        </PageShell>
    );
};

export default AdminUsers;
