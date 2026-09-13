import { Box, Typography, Button as MuiButton, Divider, Grid, Chip, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';
import { useMemo, useState } from 'react';
import { postApiAction } from '../createPost/postApiSlice';
import { accountsApiAction } from '../accounts/accountsApiSlice';
import CommonKpiCard from '../../common/CommonKpiCard';
import CommonTable from '../../common/CommonTable';
import StatusBadge from '../../common/StatusBadge';
import { format } from 'date-fns';
import { useTranslation } from '../../i18n/useTranslation';
import { POST_RULES } from '../../config/postRules';

/** Capitalize every word in a name */
const capitalizeName = (name = '') =>
  name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const getGreetingKey = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
};

const DashboardContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data: posts, isLoading: postsLoading } = postApiAction.getPosts();
  const { data: accounts, isLoading: accountsLoading } = accountsApiAction.getMyAccounts();
  const [activeFilter, setActiveFilter] = useState(null); // null | 'pending' | 'completed' | 'failed'

  const stats = useMemo(() => {
    if (!posts) return { total: 0, pending: 0, completed: 0, failed: 0 };
    return {
      total: posts.length,
      pending: posts.filter((p) => p.status === 'pending' || p.status === 'processing').length,
      completed: posts.filter((p) => p.status === 'completed').length,
      failed: posts.filter((p) => p.status === 'failed').length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!activeFilter) return posts;
    if (activeFilter === 'pending') return posts.filter((p) => p.status === 'pending' || p.status === 'processing');
    return posts.filter((p) => p.status === activeFilter);
  }, [posts, activeFilter]);

  const recentPosts = useMemo(() => filteredPosts.slice(0, 8), [filteredPosts]);

  const handleFilterClick = (filterKey) => {
    setActiveFilter((prev) => (prev === filterKey ? null : filterKey));
  };

  const columns = useMemo(() => [
    {
      key: 'content',
      label: t('colContent'),
      render: (val) => (
        <Typography variant="body2" sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {val || `(${t('mediaOnly')})`}
        </Typography>
      )
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
      key: 'targets',
      label: t('colPlatforms'),
      render: (val) => {
        const TARGET_STATUS_COLORS = {
          published: '#10B981',
          completed: '#10B981',
          failed: '#EF4444',
          pending: '#F59E0B',
          processing: '#F59E0B',
        };
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(val || []).map((targ, i) => {
              const color = TARGET_STATUS_COLORS[targ.status] || '#9CA3AF';
              const chip = (
                <Box
                  key={i}
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color,
                    border: `1px solid ${color}50`,
                    backgroundColor: `${color}15`,
                    borderRadius: 1,
                    px: 0.8,
                    py: 0.2,
                  }}
                >
                  {targ.platform}
                </Box>
              );
              return targ.status === 'failed' && targ.error ? (
                <Tooltip key={i} title={targ.error} arrow placement="top">
                  <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                    {chip}
                  </Box>
                </Tooltip>
              ) : chip;
            })}
          </Box>
        );
      }
    },
    {
      key: 'scheduledAt',
      label: t('colScheduledAt'),
      render: (val) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {val ? format(new Date(val), 'MMM d, yyyy h:mm a') : t('instant')}
        </Typography>
      )
    },
    {
      key: 'status',
      label: t('colStatus'),
      render: (val) => <StatusBadge status={val} />
    },
  ], [t]);

  const isLoading = postsLoading || accountsLoading;

  return (
    <Box>
      {/* Greeting */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          {t(getGreetingKey())},{' '}
          <Box component="span" sx={{ background: 'linear-gradient(90deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {capitalizeName(user?.name) || t('there')} 👋
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {t('dashboardSubtitle')}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CommonKpiCard
            label={t('totalPosts')} value={stats.total} icon={<PostAddIcon />} color="#7C3AED"
            isLoading={isLoading}
            isActive={activeFilter === null}
            onClick={() => setActiveFilter(null)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CommonKpiCard
            label={t('pending')} value={stats.pending} icon={<HourglassEmptyIcon />} color="#F59E0B"
            isLoading={isLoading}
            isActive={activeFilter === 'pending'}
            onClick={() => handleFilterClick('pending')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CommonKpiCard
            label={t('completed')} value={stats.completed} icon={<CheckCircleIcon />} color="#10B981"
            isLoading={isLoading}
            isActive={activeFilter === 'completed'}
            onClick={() => handleFilterClick('completed')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CommonKpiCard
            label={t('failed')} value={stats.failed} icon={<ErrorIcon />} color="#EF4444"
            isLoading={isLoading}
            isActive={activeFilter === 'failed'}
            onClick={() => handleFilterClick('failed')}
          />
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <MuiButton
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/create')}
          sx={{ background: 'linear-gradient(90deg, #7C3AED, #2563EB)', '&:hover': { boxShadow: '0 0 20px rgba(124,58,237,0.5)' } }}
        >
          {t('createPost')}
        </MuiButton>
        <MuiButton
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={() => navigate('/accounts')}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main', color: 'primary.main', backgroundColor: 'action.hover' }
          }}
        >
          {t('manageAccounts')}
        </MuiButton>
      </Box>

      {/* Recent Posts */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>{t('recentPosts')}</Typography>
            {activeFilter && (
              <Chip
                label={`${t(activeFilter === 'pending' ? 'pending' : activeFilter === 'completed' ? 'completed' : 'failed')} ×`}
                size="small"
                onClick={() => setActiveFilter(null)}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              />
            )}
          </Box>
          <MuiButton size="small" onClick={() => navigate('/posts')} sx={{ color: 'primary.main', fontWeight: 600 }}>
            {t('viewAll')}
          </MuiButton>
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'divider' }} />
        <CommonTable
          columns={columns}
          rows={recentPosts}
          isLoading={isLoading}
          searchKeys={['content', 'status']}
          emptyMessage={t('noPostsYetDashboard')}
        />
      </Box>
    </Box>
  );
};

export default DashboardContainer;