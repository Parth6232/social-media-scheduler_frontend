import { useMemo } from 'react';
import { Box, Typography, Tooltip, Link, Chip } from '@mui/material';
import { postApiAction } from '../createPost/postApiSlice';
import CommonTable from '../../common/CommonTable';
import StatusBadge from '../../common/StatusBadge';
import HistoryIcon from '@mui/icons-material/History';
import { format } from 'date-fns';
import { useTranslation } from '../../i18n/useTranslation';

const PostsContainer = () => {
  const { t } = useTranslation();
  const { data: posts, isLoading } = postApiAction.getPosts();

  const columns = useMemo(() => [
    {
      key: 'content',
      label: t('colContent'),
      render: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {row.mediaUrl && (
            <Box
              component="img"
              src={row.mediaUrl}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
            />
          )}
          <Typography variant="body2" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {val || <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{t('mediaOnly')}</Box>}
          </Typography>
        </Box>
      )
    },
    {
      key: 'targets',
      label: t('colPlatforms'),
      render: (val) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(val || []).map((targ, i) => (
            <Tooltip key={i} title={targ.error || (targ.publishedUrl ? t('viewPost') : targ.status)} arrow>
              <Box>
                {targ.publishedUrl ? (
                  <Link href={targ.publishedUrl} target="_blank" rel="noopener" underline="none">
                    <Chip
                      label={targ.platform}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 20, color: '#10B981', border: '1px solid #10B98130', backgroundColor: '#10B98112', cursor: 'pointer' }}
                    />
                  </Link>
                ) : (
                  <Chip
                    label={targ.platform}
                    size="small"
                    sx={{
                      fontSize: '0.65rem', height: 20,
                      color: targ.status === 'failed' ? '#EF4444' : 'text.secondary',
                      border: '1px solid',
                      borderColor: targ.status === 'failed' ? '#EF444430' : 'divider',
                      backgroundColor: targ.status === 'failed' ? '#EF444412' : ((theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )
    },
    {
      key: 'privacy',
      label: t('colPrivacy'),
      render: (val) => <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{val || t('public')}</Typography>
    },
    {
      key: 'scheduledAt',
      label: t('colScheduled'),
      render: (val) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {val ? format(new Date(val), 'MMM d, yy h:mm a') : t('instant')}
        </Typography>
      )
    },
    {
      key: 'status',
      label: t('colStatus'),
      render: (val) => <StatusBadge status={val} />
    },
  ], [t]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HistoryIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>{t('postsHistory')}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 7 }}>
          {t('postsHistorySubtitle')}
        </Typography>
      </Box>

      <CommonTable
        columns={columns}
        rows={posts}
        isLoading={isLoading}
        searchKeys={['content', 'status', 'privacy']}
        emptyMessage={t('noPostsYetHistory')}
      />
    </Box>
  );
};

export default PostsContainer;