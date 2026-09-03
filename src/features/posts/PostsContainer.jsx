import { Box, Typography, Tooltip, Link, Chip } from '@mui/material';
import { postApiAction } from '../createPost/postApiSlice';
import CommonTable from '../../common/CommonTable';
import StatusBadge from '../../common/StatusBadge';
import HistoryIcon from '@mui/icons-material/History';
import { format } from 'date-fns';

const PostsContainer = () => {
  const { data: posts, isLoading } = postApiAction.getPosts();

  const columns = [
    {
      key: 'content',
      label: 'Content',
      render: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {row.mediaUrl && (
            <Box
              component="img"
              src={row.mediaUrl}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}
            />
          )}
          <Typography variant="body2" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {val || <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Media only</Box>}
          </Typography>
        </Box>
      )
    },
    {
      key: 'targets',
      label: 'Platforms',
      render: (val) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(val || []).map((t, i) => (
            <Tooltip key={i} title={t.error || (t.publishedUrl ? 'View post' : t.status)} arrow>
              <Box>
                {t.publishedUrl ? (
                  <Link href={t.publishedUrl} target="_blank" rel="noopener" underline="none">
                    <Chip
                      label={t.platform}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 20, color: '#10B981', border: '1px solid #10B98130', backgroundColor: '#10B98112', cursor: 'pointer' }}
                    />
                  </Link>
                ) : (
                  <Chip
                    label={t.platform}
                    size="small"
                    sx={{
                      fontSize: '0.65rem', height: 20,
                      color: t.status === 'failed' ? '#EF4444' : 'text.secondary',
                      border: `1px solid ${t.status === 'failed' ? '#EF444430' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: t.status === 'failed' ? '#EF444412' : 'rgba(255,255,255,0.05)',
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
      label: 'Privacy',
      render: (val) => <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{val || 'public'}</Typography>
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      render: (val) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {val ? format(new Date(val), 'MMM d, yy h:mm a') : 'Instant'}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
  ];

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
          <Typography variant="h5" fontWeight={700}>Posts History</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 7 }}>
          All your scheduled and published posts across all platforms
        </Typography>
      </Box>

      <CommonTable
        columns={columns}
        rows={posts}
        isLoading={isLoading}
        searchKeys={['content', 'status', 'privacy']}
        emptyMessage="No posts yet — create your first post to get started!"
      />
    </Box>
  );
};

export default PostsContainer;
