// NEW: KpiRow component rendering the 6 key performance indicator cards
import { Grid } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';

import AnalyticsKpiCard from './AnalyticsKpiCard';
import { useTranslation } from '../../../i18n/useTranslation';
import { StaggerContainer, StaggerItem } from '../../../common/components/motion/Stagger';

const KpiRow = ({ totals = {}, comparison = null, timelinePoints = [] }) => {
  const { t } = useTranslation();

  // Extract sparklines for each metric from timeline points
  const postsSpark = timelinePoints.map((p) => p.targets || 0);
  const publishedSpark = timelinePoints.map((p) => p.published || 0);
  const failedSpark = timelinePoints.map((p) => p.failed || 0);
  const viewsSpark = timelinePoints.map((p) => p.views || 0);
  const likesSpark = timelinePoints.map((p) => p.likes || 0);

  const avgViewsText = totals.avgViews != null ? t('analytics_avgViewsPerPost').replace('{avgViews}', totals.avgViews) : null;
  const avgLikesText = totals.avgLikes != null ? t('analytics_avgLikesPerPost').replace('{avgLikes}', totals.avgLikes) : null;

  return (
    <StaggerContainer sx={{ mb: 4 }}>
      <Grid container spacing={2.5}>
        {/* 1. Total Posts */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_totalPosts')}
              value={totals.posts || 0}
              icon={<PostAddIcon sx={{ fontSize: 20 }} />}
              color="#2563EB"
              comparison={comparison?.posts}
              sparklineData={postsSpark}
            />
          </StaggerItem>
        </Grid>

        {/* 2. Published */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_published')}
              value={totals.published || 0}
              icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
              color="#10B981"
              comparison={comparison?.published}
              sparklineData={publishedSpark}
            />
          </StaggerItem>
        </Grid>

        {/* 3. Failed */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_failed')}
              value={totals.failed || 0}
              icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
              color="#EF4444"
              comparison={comparison?.failed}
              invertComparisonColor={true}
              sparklineData={failedSpark}
            />
          </StaggerItem>
        </Grid>

        {/* 4. Success Rate */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_successRate')}
              value={totals.successRate != null ? totals.successRate : (totals.published + totals.failed === 0 ? 100 : 0)}
              isPercentage={true}
              icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
              color="#0EA5E9"
              progressValue={totals.successRate != null ? totals.successRate : 0}
            />
          </StaggerItem>
        </Grid>

        {/* 5. Total Views */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_totalViews')}
              value={totals.views || 0}
              icon={<VisibilityIcon sx={{ fontSize: 20 }} />}
              color="#1D4ED8"
              comparison={comparison?.views}
              subtext={avgViewsText}
              sparklineData={viewsSpark}
            />
          </StaggerItem>
        </Grid>

        {/* 6. Total Likes */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StaggerItem>
            <AnalyticsKpiCard
              label={t('analytics_totalLikes')}
              value={totals.likes || 0}
              icon={<FavoriteIcon sx={{ fontSize: 20 }} />}
              color="#F59E0B"
              comparison={comparison?.likes}
              subtext={avgLikesText}
              sparklineData={likesSpark}
            />
          </StaggerItem>
        </Grid>
      </Grid>
    </StaggerContainer>
  );
};

export default KpiRow;
