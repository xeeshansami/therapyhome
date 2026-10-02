import React, { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './styles';
import { Box, Button, Stack, Table, TableBody, TableContainer, TableHead, TablePagination } from '@mui/material';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows, actions }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const safeRows = rows || [];

    // Keep the page in range when the row set shrinks (search, delete, filter),
    // otherwise the table renders empty on a page that no longer exists.
    const lastPage = Math.max(0, Math.ceil(safeRows.length / rowsPerPage) - 1);
    const currentPage = Math.min(page, lastPage);

    return (
        <>
            {actions && actions.length > 0 && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}
                >
                    {actions.map((action, index) => (
                        <Button
                            key={action.name || index}
                            onClick={action.action}
                            startIcon={action.icon}
                            variant={index === 0 ? 'contained' : 'outlined'}
                            size="small"
                        >
                            {action.name}
                        </Button>
                    ))}
                </Stack>
            )}

            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {safeRows
                            .slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <StyledTableCell key={column.id} align={column.align}>
                                                    {
                                                        column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value
                                                    }
                                                </StyledTableCell>
                                            );
                                        })}
                                        <StyledTableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <ButtonHaver row={row} />
                                            </Box>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={safeRows.length}
                rowsPerPage={rowsPerPage}
                page={currentPage}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    // Radix 10. This was parseInt(value, 5), which read the choice in
                    // base 5: "5" became NaN and "100" became 25.
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
            />
        </>
    )
}

export default TableTemplate
