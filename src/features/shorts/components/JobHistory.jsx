// NAYA: JobHistory — previous jobs ki list with thumbnail, status, delete confirm
import { useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import GlassCard from '../../../common/components/motion/GlassCard';
import { shortsApiAction } from '../shortsApiSlice';
import { showToast } from '../../../store/redux/slices/toastSlice';

// NAYA: status ke hisab se chip color
const STATUS_COLOR = {
  done: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
  failed: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  rendering: { bg: 'rgba(37,99,235,0.1)', text: '#2563EB', border: 'rgba(37,99,235,0.25)' },
  default: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', border: 'rgba(107,114,128,0.25)' },
};

const getStatusStyle = (status) => STATUS_COLOR[status] || STATUS_COLOR.default;

const JobHistory = ({ onSelectJob, activeJobId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: jobs = [], isLoading } = shortsApiAction.useListJobsQuery(undefined, {
    pollingInterval: 15000,
  });
  const [deleteJob, { isLoading: isDeleting }] = shortsApiAction.useDeleteJobMutation();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJob(deleteTarget.id).unwrap();
      dispatch(showToast({ message: 'Job deleted.', variant: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to delete job.', variant: 'error' }));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <GlassCard sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Skeleton variant="rounded" width={56} height={36} sx={{ borderRadius: 1, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="text" width="40%" height={14} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </GlassCard>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <>
      <GlassCard sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={700}>{t('shorts_history')}</Typography>
          </Box>

          <List disablePadding>
            {jobs.map((job) => {
              const style = getStatusStyle(job.status);
              const isActive = job.id === activeJobId;
              return (
                <ListItem
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    mb: 0.5,
                    border: '1px solid',
                    borderColor: isActive ? '#2563EB' : 'transparent',
                    bgcolor: isActive ? 'rgba(37,99,235,0.07)' : 'transparent',
                    px: 1.5, py: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: isActive ? 'rgba(37,99,235,0.1)' : (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                  }}
                  secondaryAction={
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(job); }}
                      aria-label="Delete job"
                      sx={{ color: 'text.disabled', '&:hover': { color: '#EF4444' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  }
                >
                  {/* Thumbnail */}
                  <ListItemAvatar sx={{ minWidth: 68 }}>
                    <Avatar
                      src={job.thumbnail}
                      alt={job.videoTitle}
                      variant="rounded"
                      sx={{ width: 56, height: 36, borderRadius: 1 }}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        noWrap
                        sx={{ display: 'block', maxWidth: 160 }}
                      >
                        {job.videoTitle || job.channelTitle || 'Untitled'}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={job.status}
                          sx={{
                            height: 18, fontSize: '0.65rem', fontWeight: 600,
                            bgcolor: style.bg, color: style.text,
                            border: `1px solid ${style.border}`,
                            textTransform: 'capitalize',
                          }}
                        />
                        {job.clips?.length > 0 && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            {job.clips.length} clips
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ''}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </GlassCard>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{t('shorts_confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Delete job for &quot;{deleteTarget?.videoTitle || 'this video'}&quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            sx={{ borderRadius: 2 }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            loading={isDeleting}
            sx={{ borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JobHistory;
