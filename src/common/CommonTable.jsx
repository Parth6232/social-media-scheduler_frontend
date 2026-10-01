import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Skeleton, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';

const MotionTableRow = motion.create(TableRow);

const CommonTable = ({ columns, rows, isLoading, searchKeys = [], emptyMessage }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const effectiveEmptyMessage = emptyMessage || t('noDataFound');

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
          placeholder={t('searchPlaceholder')}
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
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) => theme.custom.panel,
                boxShadow: (theme) => theme.custom.lift(1),
        overflowX: 'auto',
      }}>
        <Table sx={{ minWidth: { xs: 600, md: '100%' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB'), '& th': { borderBottom: '1px solid', borderBottomColor: 'divider' } }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ color: 'text.secondary', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em', py: 1.5 }}
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
                      <TableCell key={col.key} sx={{ borderColor: 'divider' }}>
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
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{effectiveEmptyMessage}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )
              : paginated.map((row, i) => (
                <MotionTableRow
                  key={row._id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
                  sx={{ transition: 'background-color .15s', '&:hover': { backgroundColor: 'action.hover' }, '&:hover td:first-of-type': { boxShadow: 'inset 3px 0 0 #2563EB' }, '& td:first-of-type': { transition: 'box-shadow .2s' } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ borderColor: 'divider', py: 1.5, color: 'text.primary' }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </MotionTableRow>
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
        sx={{
          color: 'text.secondary',
          '.MuiTablePagination-select': { color: 'text.primary' },
          '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
          '.MuiTablePagination-actions button': { color: 'text.secondary' },
        }}
      />
    </Box>
  );
};

export default CommonTable;