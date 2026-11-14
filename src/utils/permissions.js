// What the signed-in admin may do in the portal. The server enforces every
// permission on its own; this only hides what would be refused anyway.
// The super admin may do everything; a Limited Admin only what was granted.

export const isSuperAdmin = (user) => !!user && user.role === 'Admin' && user.adminRole !== 'admin';

export const can = (user, module, action = 'view') => {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    const p = user.permissions;
    // Sessions saved before permissions existed: the server still decides.
    if (!p) return true;
    return Boolean(p[module] && p[module][action]);
};

export const ACTION_LABELS = { view: 'View', add: 'Add', edit: 'Edit', delete: 'Delete' };

// Same modules as the server (lib/permissions.js); the Admins page reads the
// authoritative list from GET /admins and falls back to this one.
export const DEFAULT_MODULES = [
    { key: 'students', label: 'Students', actions: ['view', 'add', 'edit', 'delete'] },
    { key: 'consultations', label: 'Consultations', actions: ['view', 'add', 'delete'] },
    { key: 'staff', label: 'Staff', actions: ['view', 'add', 'edit', 'delete'] },
    { key: 'classes', label: 'Classes & subjects', actions: ['view', 'add', 'edit', 'delete'] },
    { key: 'attendance', label: 'Attendance & sessions', actions: ['view', 'edit'] },
    { key: 'leaves', label: 'Leave requests', actions: ['view', 'edit'] },
    { key: 'fees', label: 'Student fees & invoices', actions: ['view', 'add', 'edit', 'delete'] },
    { key: 'salary', label: 'Staff salary', actions: ['view', 'add'] },
    { key: 'notices', label: 'Notices & complaints', actions: ['view', 'add', 'edit', 'delete'] },
];

export const presetPermissions = (modules, preset) => Object.fromEntries(modules.map((m) => [
    m.key, Object.fromEntries(m.actions.map((a) => [a, preset === 'full' ? true : preset === 'view' ? a === 'view' : false])),
]));
