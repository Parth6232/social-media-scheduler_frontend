import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  Button as MuiButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import BlockIcon from '@mui/icons-material/Block';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { format, formatDistanceToNow } from 'date-fns';

import { postApiAction } from '../createPost/postApiSlice';
import { appConstants } from '../../constant/appConstants';
import { POST_RULES } from '../../config/postRules';
import CommonTable from '../../common/CommonTable';
import StatusBadge from '../../common/StatusBadge';
import { useTranslation } from '../../i18n/useTranslation';
import PostsPlatformGrid from './PostsPlatformGrid';
import { showToast } from '../../store/redux/slices/toastSlice';

const PLATFORM_ICONS = {
  youtube: <YouTubeIcon sx={{ fontSize: 24 }} />,
  facebook: <FacebookIcon sx={{ fontSize: 24 }} />,
  instagram: <InstagramIcon sx={{ fontSize: 24 }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 24 }} />,
  twitter: <Box component="span" sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>𝕏</Box>,
  whatsapp: <WhatsAppIcon sx={{ fontSize: 24 }} />,
};

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  twitter: '#1D9BF0',
  whatsapp: '#25D366',
};

const PostsContainer = () => {
  const { platform } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [refreshPostStats] = postApiAction.refreshPostStats();
  const [deletePostTarget] = postApiAction.deletePostTarget();
  const [refreshingId, setRefreshingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, row: null });
  const [deleteError, setDeleteError] = useState(null);

  // If no platform param, render Screen 1 (Platform Summary Grid)
  if (!platform) {
    return <PostsPlatformGrid />;
  }

  return (
    <PlatformPostsView
      platform={platform}
      navigate={navigate}
      t={t}
      dispatch={dispatch}
      refreshPostStats={refreshPostStats}
      deletePostTarget={deletePostTarget}
      refreshingId={refreshingId}
      setRefreshingId={setRefreshingId}
      deletingId={deletingId}
      setDeletingId={setDeletingId}
      confirmDialog={confirmDialog}
      setConfirmDialog={setConfirmDialog}
      deleteError={deleteError}
      setDeleteError={setDeleteError}
    />
  );
};

const PlatformPostsView = ({
  platform,
  navigate,
  t,
  dispatch,
  refreshPostStats,
  deletePostTarget,
  refreshingId,
  setRefreshingId,
  deletingId,
  setDeletingId,
  confirmDialog,
  setConfirmDialog,
  deleteError,
  setDeleteError,
}) => {
  const { data: posts, isLoading } = postApiAction.getPosts(platform);
  const meta = appConstants.platforms[platform] || { name: platform };
  const platformColor = PLATFORM_COLORS[platform] || '#7C3AED';

  const handleRefreshStats = useCallback(async (postId) => {
    try {
      setRefreshingId(postId);
      await refreshPostStats(postId).unwrap();
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    } finally {
      setRefreshingId(null);
    }
  }, [refreshPostStats, setRefreshingId]);

  const handleDeleteClick = useCallback((row) => {
    setDeleteError(null);
    setConfirmDialog({ open: true, row });
  }, [setConfirmDialog, setDeleteError]);

  const handleDeleteConfirm = useCallback(async () => {
    const { row } = confirmDialog;
    if (!row) return;
    try {
      setDeletingId(row._id);
      setDeleteError(null);
      await deletePostTarget({ postId: row._id, platform }).unwrap();
      setConfirmDialog({ open: false, row: null });
      dispatch(showToast({ message: t('deleteSuccess'), variant: 'success' }));
    } catch (err) {
      console.error('Failed to delete target:', err);
      setDeleteError(err?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDialog, deletePostTarget, platform, dispatch, t, setConfirmDialog, setDeletingId, setDeleteError]);

  const handleDeleteCancel = useCallback(() => {
    if (deletingId) return; // Don't close while in-flight
    setConfirmDialog({ open: false, row: null });
    setDeleteError(null);
  }, [deletingId, setConfirmDialog, setDeleteError]);

  // Extract target for this specific platform
  const processedPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) return [];
    return posts
      .map((post) => {
        const target = post.targets?.find((tg) => tg.platform === platform);
        return {
          ...post,
          target: target || null,
        };
      })
      .filter((post) => post.target !== null);
  }, [posts, platform]);

  const columns = useMemo(
    () => [
      {
        key: 'content',
        label: t('colContent'),
        render: (val, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
            {row.mediaUrl && (
              <Box
                component="img"
                src={row.mediaUrl}
                alt=""
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                maxWidth: 240,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {val || (
                <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {t('mediaOnly')}
                </Box>
              )}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'postType',
        label: t('colPostType'),
        render: (val) => {
          const rule = POST_RULES[val];
          const label = t(`postType_${val}`) || rule?.label || val;
          return (
            <Box
              component="span"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 0.8,
                py: 0.3,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Box>
          );
        },
      },
      {
        key: 'status',
        label: t('colStatus'),
        render: (_val, row) => {
          const target = row.target;
          const targetStatus = target?.status || row.status;
          const errorMsg = target?.error;

          const badge = <StatusBadge status={targetStatus} />;

          // "Removed from platform" indicator — only for targets that were
          // successfully published (never for pending/failed).
          const isPublished = targetStatus === 'published' || targetStatus === 'completed';
          const showRemovedBadge = isPublished && target?.platformStatus === 'removed';

          let removedTooltipText = null;
          if (showRemovedBadge) {
            const checkedAt = target?.platformStatusCheckedAt
              ? formatDistanceToNow(new Date(target.platformStatusCheckedAt), { addSuffix: true })
              : null;
            removedTooltipText = t('removedFromPlatformTooltip')
              .replace('{platform}', meta.name)
              .replace('{time}', checkedAt || '—');
          }

          // Wrap status badge in tooltip if there's an error message
          const statusNode = (targetStatus === 'failed' && errorMsg)
            ? (
              <Tooltip title={errorMsg} arrow placement="top">
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                  {badge}
                </Box>
              </Tooltip>
            )
            : badge;

          if (!showRemovedBadge) {
            return statusNode;
          }

          // Render StatusBadge + Removed chip side-by-side
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
              {statusNode}
              <Tooltip title={removedTooltipText} arrow placement="top">
                <Chip
                  icon={<BlockIcon sx={{ fontSize: '12px !important' }} />}
                  label={t('removedFromPlatform')}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    cursor: 'help',
                    '& .MuiChip-icon': { color: 'text.disabled' },
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Tooltip>
            </Box>
          );
        },
      },
      {
        key: 'scheduledAt',
        label: t('colScheduled'),
        render: (val) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {val ? format(new Date(val), 'MMM d, yy h:mm a') : t('instant')}
          </Typography>
        ),
      },
      {
        key: 'stats',
        label: t('colViewsLikes'),
        render: (_val, row) => {
          const target = row.target;
          if (!target) return '—';

          const hasViews = typeof target.views === 'number' && target.views > 0;
          const hasLikes = typeof target.likes === 'number' && target.likes > 0;

          const timeTooltip = target.statsUpdatedAt
            ? t('statsUpdated').replace(
              '{time}',
              formatDistanceToNow(new Date(target.statsUpdatedAt), { addSuffix: true })
            )
            : null;

          if (!hasViews && !hasLikes) {
            const emptyContent = (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                —
              </Typography>
            );
            return timeTooltip ? (
              <Tooltip title={timeTooltip} arrow placement="top">
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'default' }}>
                  {emptyContent}
                </Box>
              </Tooltip>
            ) : emptyContent;
          }

          const statsContent = (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.25 }}>
              {hasViews && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {target.views.toLocaleString()}
                  </Typography>
                </Box>
              )}

              {hasLikes && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                  <ThumbUpOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {target.likes.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          );

          if (timeTooltip) {
            return (
              <Tooltip title={timeTooltip} arrow placement="top">
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'default' }}>
                  {statsContent}
                </Box>
              </Tooltip>
            );
          }

          return statsContent;
        },
      },
      {
        key: 'actions',
        label: t('colActions'),
        render: (_val, row) => {
          const target = row.target;
          const isRefreshing = refreshingId === row._id;
          const isDeleting = deletingId === row._id;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {/* Refresh Stats Button */}
              <Tooltip title={t('refreshStats')} arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleRefreshStats(row._id)}
                    disabled={isRefreshing || isDeleting}
                    sx={{
                      width: 32,
                      height: 32,
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      '&:hover': {
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {isRefreshing ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <RefreshIcon sx={{ fontSize: 17 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              {/* View live post link */}
              {target?.publishedUrl && (
                <Tooltip title={t('viewPost')} arrow placement="top">
                  <IconButton
                    size="small"
                    component="a"
                    href={target.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(16, 185, 129, 0.18)',
                        borderColor: '#10B981',
                      },
                    }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Delete from history */}
              <Tooltip title={t('deleteFromHistory')} arrow placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(row)}
                    disabled={isRefreshing || isDeleting}
                    sx={{
                      width: 32,
                      height: 32,
                      color: 'rgba(239, 68, 68, 0.7)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 1.5,
                      '&:hover': {
                        color: '#EF4444',
                        borderColor: 'rgba(239, 68, 68, 0.6)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.35,
                      },
                    }}
                  >
                    {isDeleting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [t, refreshingId, deletingId, handleRefreshStats, handleDeleteClick, meta.name]
  );

  return (
    <Box>
      {/* Top Bar with Back Button and Platform Header */}
      <Box sx={{ mb: 3.5 }}>
        <MuiButton
          onClick={() => navigate('/posts')}
          sx={{
            mb: 2,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          {t('backToPlatforms')}
        </MuiButton>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: `${platformColor}18`,
                border: `1px solid ${platformColor}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: platformColor,
              }}
            >
              {PLATFORM_ICONS[platform] || <Box sx={{ fontSize: 20 }}>●</Box>}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {meta.name} {t('posts')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('postsHistorySubtitle')}
              </Typography>
            </Box>
          </Box>

          {/* Post count badge */}
          {processedPosts.length > 0 && (
            <Chip
              label={`${processedPosts.length} ${t('postsCount')}`}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Table */}
      <CommonTable
        columns={columns}
        rows={processedPosts}
        isLoading={isLoading}
        searchKeys={['content', 'status']}
        emptyMessage={t('noPostsYetPlatform').replace('{platform}', meta.name)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(239, 68, 68, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
          {t('deleteFromHistoryTitle')}
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5, color: 'text.primary' }}>
            {t('deleteFromHistoryConfirm')}
          </Typography>

          {/* Critical clarification — platform-specific */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              display: 'flex',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: '#10B981', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.5 }}>
              ✓ {t('deleteFromHistoryNote').replace('{platform}', meta.name)}
            </Typography>
          </Box>

          {/* Error message from API */}
          {deleteError && (
            <Typography
              variant="body2"
              sx={{ mt: 1.5, color: '#EF4444', fontSize: '0.82rem', fontWeight: 500 }}
            >
              ⚠ {deleteError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <MuiButton
            onClick={handleDeleteCancel}
            disabled={!!deletingId}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.secondary' },
            }}
          >
            {t('cancel')}
          </MuiButton>

          <MuiButton
            onClick={handleDeleteConfirm}
            disabled={!!deletingId}
            variant="contained"
            startIcon={deletingId ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: '#EF4444',
              '&:hover': { backgroundColor: '#DC2626' },
              '&.Mui-disabled': { opacity: 0.55 },
            }}
          >
            {deletingId ? t('refreshingStats') : t('delete')}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostsContainer;