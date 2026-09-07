import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Skeleton, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import { useState, useMemo } from 'react';

const CommonTable = ({ columns, rows, isLoading, searchKeys = [], emptyMessage = 'No data found' }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!rows || !search) return rows || [];
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] || '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [rows, search, searchKeys]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 280 }}
        />
      </Box>

      <TableContainer sx={{
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(16, 24, 46, 0.4)',
        overflowX: 'auto',
      }}>
        <Table sx={{ minWidth: { xs: 600, md: '100%' } }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ borderColor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, py: 1.5 }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} sx={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ borderColor: 'transparent', py: 6, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyMessage}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )
              : paginated.map((row, i) => (
                <TableRow
                  key={row._id || i}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }, transition: 'background 0.15s' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ borderColor: 'rgba(255,255,255,0.04)', py: 1.5 }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ color: 'text.secondary', '.MuiTablePagination-select': { color: '#fff' } }}
      />
    </Box>
  );
};

export default CommonTable;
