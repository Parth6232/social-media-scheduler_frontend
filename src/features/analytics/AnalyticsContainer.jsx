// NEW: AnalyticsContainer component orchestrating filters, API fetching, mock mode, and sub-components
import { useState, useMemo, useEffect } from 'react';
import { Box, LinearProgress, Alert, Button as MuiButton, Typography, useTheme, Grid } from '@mui/material';
import { useDispatch } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

import { analyticsApiAction } from './analyticsApiSlice';
import { getMockAnalytics } from './mockAnalytics';
import { downloadAnalyticsCsv } from './utils/exportCsv';
import { downloadAnalyticsPdf } from './utils/exportPdf';
import { downloadAnalyticsWord } from './utils/exportWord';
import { showToast } from '../../store/redux/slices/toastSlice';
import { useTranslation } from '../../i18n/useTranslation';
import AnimatedSection from '../../common/components/motion/AnimatedSection';

import AnalyticsHeader from './components/AnalyticsHeader';
import KpiRow from './components/KpiRow';
import InsightsStrip from './components/InsightsStrip';
import PerformanceTimeline from './components/PerformanceTimeline';
import PlatformComparison from './components/PlatformComparison';
import PostStatusDonut from './components/PostStatusDonut';
import PostTypeBreakdown from './components/PostTypeBreakdown';
import BestTimeSection from './components/BestTimeSection';
import TopPostsCard from './components/TopPostsCard';
import FailuresCard from './components/FailuresCard';
import HealthAndUpcoming from './components/HealthAndUpcoming';
import AnalyticsEmptyState from './components/AnalyticsEmptyState';
import AnalyticsSkeleton from './components/AnalyticsSkeleton';

const AnalyticsContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Filters State
  const [range, setRange] = useState('30d');
  const [platform, setPlatform] = useState('all');

  // Cooldown & Export states
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Check if DEV mock mode is enabled via URL query ?mock=1
  const isDevMock = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(import.meta.env.DEV && new URLSearchParams(window.location.search).get('mock') === '1');
  }, []);

  // RTK Query API calls (bypassed if isDevMock)
  const apiQueryArg = useMemo(() => ({
    range,
    platform: platform === 'all' ? undefined : platform,
  }), [range, platform]);

  const {
    data: apiData,
    isLoading: isApiLoading,
    isFetching,
    isError,
    refetch,
  } = analyticsApiAction.getAnalytics(apiQueryArg, {
    skip: isDevMock,
  });

  const [refreshStats, { isLoading: isRefreshing }] = analyticsApiAction.refreshAnalyticsStats();

  // Pick data from mock or API
  const data = useMemo(() => {
    if (isDevMock) {
      return getMockAnalytics(range, platform);
    }
    return apiData;
  }, [isDevMock, range, platform, apiData]);

  const isLoading = isDevMock ? false : isApiLoading;

  // Handle Refresh Stats
  const handleRefresh = async () => {
    if (isDevMock) {
      dispatch(showToast({ message: t('analytics_refreshedSuccess').replace('{refreshed}', '18').replace('{attempted}', '20'), variant: 'success' }));
      return;
    }
    try {
      const res = await refreshStats().unwrap();
      const msg = t('analytics_refreshedSuccess')
        .replace('{refreshed}', res.refreshed ?? res.attempted ?? 0)
        .replace('{attempted}', res.attempted ?? 0);
      dispatch(showToast({ message: msg, variant: 'success' }));
      refetch();
    } catch (err) {
      if (err?.status === 429) {
        const retrySec = err?.data?.retryAfterSec || 120;
        setCooldownSeconds(retrySec);
      }
    }
  };

  // Handle Report Export (PDF, Word, CSV)
  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await downloadAnalyticsPdf({
          data,
          range,
          platform,
        });
        dispatch(showToast({ message: t('analytics_exportSuccessPdf'), variant: 'success' }));
      } else if (format === 'word') {
        await downloadAnalyticsWord({
          data,
          range,
          platform,
        });
        dispatch(showToast({ message: t('analytics_exportSuccessWord'), variant: 'success' }));
      } else if (format === 'csv') {
        await downloadAnalyticsCsv({
          range,
          platform: platform === 'all' ? undefined : platform,
        });
        dispatch(showToast({ message: t('analytics_exportSuccess'), variant: 'success' }));
      }
    } catch (err) {
      dispatch(showToast({ message: err?.message || 'Failed to export report', variant: 'error' }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setRange('30d');
    setPlatform('all');
  };

  // 1. Initial Loading Skeleton
  if (isLoading && !data) {
    return (
      <AnimatedSection direction="none" sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 } }}>
        <AnalyticsSkeleton />
      </AnimatedSection>
    );
  }

  // 2. Error State (No data loaded and error occurred)
  if (isError && !data) {
    return (
      <AnimatedSection direction="none" sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 6, px: 2 }}>
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: '#EF4444', mb: 1.5 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
            {t('analytics_errorTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {t('analytics_errorSubtitle')}
          </Typography>
          <MuiButton
            variant="contained"
            onClick={() => refetch()}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)',
            }}
          >
            {t('analytics_retry')}
          </MuiButton>
        </Box>
      </AnimatedSection>
    );
  }

  const totals = data?.totals || {};
  const isZeroData = (totals.targets === 0 || totals.posts === 0) && (data?.upcoming?.count === 0 || !data?.upcoming?.count);
  const isFiltered = range !== '30d' || platform !== 'all';
  const showNoStatsAlert = totals.published > 0 && totals.targetsWithStats === 0;

  return (
    <AnimatedSection direction="none" sx={{ width: '100%', maxWidth: 1440, mx: 'auto', p: { xs: 0.5, sm: 2 } }}>
      {/* Dim/Loading Bar on Filter Refetch (keeps previous data visible without flashing skeletons) */}
      {isFetching && (
        <Box sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 100, mb: 1 }}>
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: 1.5,
              bgcolor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #7C3AED, #D946EF, #22D3EE)',
              },
            }}
          />
        </Box>
      )}

      {/* Header Controls */}
      <AnalyticsHeader
        range={range}
        setRange={setRange}
        platform={platform}
        setPlatform={setPlatform}
        statsLastUpdatedAt={data?.meta?.statsLastUpdatedAt}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExport={handleExport}
        isExporting={isExporting}
        cooldownSeconds={cooldownSeconds}
      />

      {/* No Stats Sync Alert Banner */}
      {showNoStatsAlert && (
        <Alert
          severity="info"
          action={
            <MuiButton
              color="inherit"
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing || cooldownSeconds > 0}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {t('analytics_noStatsAlertBtn')}
            </MuiButton>
          }
          sx={{
            mb: 3,
            borderRadius: 3,
            border: isDark ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid rgba(34, 211, 238, 0.5)',
            bgcolor: isDark ? 'rgba(34, 211, 238, 0.08)' : 'rgba(34, 211, 238, 0.12)',
            color: 'text.primary',
          }}
        >
          {t('analytics_noStatsAlert')}
        </Alert>
      )}

      {/* Zero Data Empty State vs Full Analytics Suite */}
      {isZeroData ? (
        <AnalyticsEmptyState isFiltered={isFiltered} onResetFilters={handleResetFilters} />
      ) : (
        <Box sx={{ opacity: isFetching ? 0.85 : 1, transition: 'opacity 0.2s' }}>
          {/* 1. 6 KPI Cards Row */}
          <KpiRow
            totals={data?.totals}
            comparison={data?.comparison}
            timelinePoints={data?.timeline?.points || []}
          />

          {/* 2. Automated AI Insights Strip */}
          <InsightsStrip insights={data?.insights || []} />

          {/* 3. Performance Timeline (Posts / Views / Likes) */}
          <PerformanceTimeline timeline={data?.timeline} />

          {/* 4. Platform Comparison & Post Status Donut */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={7}>
              <PlatformComparison platforms={data?.platforms || []} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <PostStatusDonut postStatus={data?.postStatus || {}} />
            </Grid>
          </Grid>

          {/* 5. Format & Post Type Breakdown */}
          <PostTypeBreakdown postTypes={data?.postTypes || []} />

          {/* 6. Best Time to Post & Engagement Heatmap */}
          <BestTimeSection bestTime={data?.bestTime} heatmap={data?.heatmap} />

          {/* 7. Top Posts & Failure Insights */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={7}>
              <TopPostsCard topPosts={data?.topPosts || []} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <FailuresCard failures={data?.failures} />
            </Grid>
          </Grid>

          {/* 8. Post Health & Next Scheduled Queue */}
          <HealthAndUpcoming health={data?.health} upcoming={data?.upcoming} />
        </Box>
      )}
    </AnimatedSection>
  );
};

export default AnalyticsContainer;
