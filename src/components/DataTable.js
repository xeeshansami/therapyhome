import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, CircularProgress, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Admin list table: coloured header bar, roomy rows, an optional shaded
 * highlight column, outlined action buttons, search and pagination.
 *
 * columns: [{ id, label, align, minWidth, highlight, render(row) }]
 * actions(row): buttons rendered in the last column
 * searchKeys: row fields matched by the search box
 */
const DataTable = ({
    columns, rows, rowKey = (r) => r._id, actions, loading, emptyText = 'Nothing to show yet.',
    searchKeys = [], searchPlaceholder = 'Search…', initialRowsPerPage = 10, toolbar,
}) => {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || searchKeys.length === 0) return rows;
        return rows.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }, [rows, query, searchKeys]);

    // Stay on a valid page when the list shrinks (e.g. after a delete or a search).
    const lastPage = Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1);
    useEffect(() => { if (page > lastPage) setPage(lastPage); }, [page, lastPage]);
    const visible = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
            {(searchKeys.length > 0 || toolbar) && (
                <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                    {searchKeys.length > 0 && (
                        <TextField
                            size="small"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                            placeholder={searchPlaceholder}
                            sx={{ flex: '1 1 260px', maxWidth: 420 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                            inputProps={{ 'aria-label': searchPlaceholder }}
                        />
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    {toolbar}
                </Box>
            )}
            <TableContainer sx={{ borderRadius: 0 }}>
                <Table sx={{ minWidth: 720 }}>
                    <TableHead>
                        <TableRow
                            sx={(t) => ({
                                background: darken(t.palette.primary.main, 0.35),
                                '& th': {
                                    color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 0, py: 2,
                                    backgroundColor: 'transparent', whiteSpace: 'nowrap',
                                },
                            })}
                        >
                            {columns.map((c) => (
                                <TableCell key={c.id} align={c.align || 'left'} sx={{ minWidth: c.minWidth }}>{c.label}</TableCell>
                            ))}
                            {actions && <TableCell align="right" sx={{ width: 1, whiteSpace: 'nowrap' }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : visible.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">{query ? `No results for "${query}".` : emptyText}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : visible.map((row) => (
                            <TableRow key={rowKey(row)} hover sx={{ '& td': { py: 1.75, fontWeight: 500 } }}>
                                {columns.map((c) => (
                                    <TableCell
                                        key={c.id}
                                        align={c.align || 'left'}
                                        sx={c.highlight ? { bgcolor: (t) => alpha(t.palette.text.primary, t.palette.mode === 'light' ? 0.06 : 0.12), fontWeight: 700 } : undefined}
                                    >
                                        {c.render ? c.render(row) : (row[c.id] ?? '—')}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                        <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>{actions(row)}</Box>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={filtered.length}
                page={Math.min(page, lastPage)}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Paper>
    );
};

/** Outlined, uppercase action button like the reference's "BOOK NOW". */
export const RowButton = ({ children, color = 'inherit', ...props }) => (
    <Button
        variant="outlined"
        size="small"
        color={color}
        sx={{
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, fontSize: '0.75rem',
            borderRadius: '6px', px: 1.75, py: 0.5, minWidth: 0,
            ...(color === 'inherit' && { borderColor: 'divider', color: 'text.primary' }),
        }}
        {...props}
    >
        {children}
    </Button>
);

export default DataTable;
