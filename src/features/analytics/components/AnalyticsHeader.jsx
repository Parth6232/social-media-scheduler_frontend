// NEW: AnalyticsHeader component
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useTranslation } from '../../../i18n/useTranslation';
import { formatRelativeTime } from '../utils/analyticsFormatters';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

const PLATFORM_OPTIONS = [
  { value: 'all', labelKey: 'analytics_allPlatforms', icon: <PublicIcon sx={{ fontSize: 18, color: '#2563EB' }} /> },
  { value: 'youtube', label: 'YouTube', icon: <YouTubeIcon sx={{ fontSize: 18, color: '#FF0000' }} /> },
  { value: 'instagram', label: 'Instagram', icon: <InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} /> },
  { value: 'facebook', label: 'Facebook', icon: <FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} /> },
];

const RANGE_OPTIONS = [
  { value: '7d', labelKey: 'analytics_range7d' },
  { value: '30d', labelKey: 'analytics_range30d' },
  { value: '90d', labelKey: 'analytics_range90d' },
  { value: 'all', labelKey: 'analytics_rangeAll' },
];

const AnalyticsHeader = ({
  range,
  setRange,
  platform,
  setPlatform,
  statsLastUpdatedAt,
  onRefresh,
  isRefreshing,
  onExport,
  isExporting,
  cooldownSeconds = 0,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduced = usePrefersReducedMotion();

  // Cooldown countdown
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const isExportMenuOpen = Boolean(exportAnchorEl);

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const handleSelectExport = (format) => {
    handleCloseExportMenu();
    if (onExport) {
      onExport(format);
    }
  };

  useEffect(() => {
    setSecondsLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const relativeUpdated = formatRelativeTime(statsLastUpdatedAt);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Top Title & Primary Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: isDark
                  ? '#FFFFFF'
                  : '#2563EB',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              {t('analytics_title')}
            </Typography>
            <Tooltip title={t('analytics_lifetimeTooltip')} arrow placement="right">
              <IconButton size="small" aria-label="Info about analytics stats" sx={{ color: 'text.secondary', p: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 620 }}>
            {t('analytics_subtitle')}
          </Typography>
        </Box>

        {/* Action Buttons: Refresh & Export */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}>
          {/* Refresh Stats Button */}
          <Box
            component={motion.button}
            whileHover={secondsLeft > 0 || isRefreshing ? {} : { scale: 1.02 }}
            whileTap={secondsLeft > 0 || isRefreshing ? {} : { scale: 0.98 }}
            onClick={secondsLeft > 0 || isRefreshing ? undefined : onRefresh}
            disabled={secondsLeft > 0 || isRefreshing}
            aria-label={t('analytics_refreshStats')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2.5,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: secondsLeft > 0 || isRefreshing ? 'not-allowed' : 'pointer',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
              color: secondsLeft > 0 ? 'text.disabled' : 'text.primary',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: secondsLeft > 0 ? undefined : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: secondsLeft > 0 ? undefined : '#2563EB',
              },
            }}
          >
            {isRefreshing ? (
              <CircularProgress size={16} sx={{ color: '#2563EB' }} />
            ) : (
              <RefreshIcon sx={{ fontSize: 18, color: secondsLeft > 0 ? 'inherit' : '#2563EB' }} />
            )}
            <span>
              {isRefreshing
                ? t('analytics_refreshing')
                : secondsLeft > 0
                ? `${t('analytics_tryAgainIn').replace('{time}', formatCountdown(secondsLeft))}`
                : t('analytics_refreshStats')}
            </span>
          </Box>

          {/* Export Report Dropdown Menu */}
          <Box
            component={motion.button}
            whileHover={isExporting ? {} : { scale: 1.02 }}
            whileTap={isExporting ? {} : { scale: 0.98 }}
            onClick={isExporting ? undefined : handleOpenExportMenu}
            disabled={isExporting}
            aria-label={t('analytics_exportReport')}
            id="analytics-export-button"
            aria-controls={isExportMenuOpen ? 'analytics-export-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isExportMenuOpen ? 'true' : undefined}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2.2,
              py: 1,
              borderRadius: 2.5,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              border: 'none',
              background: '#2563EB',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37,99,235, 0.35)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(37,99,235, 0.5)',
              },
            }}
          >
            {isExporting ? (
              <CircularProgress size={16} sx={{ color: '#ffffff' }} />
            ) : (
              <FileDownloadIcon sx={{ fontSize: 18 }} />
            )}
            <span>{isExporting ? t('analytics_exporting') : t('analytics_exportReport')}</span>
            <KeyboardArrowDownIcon sx={{ fontSize: 18, ml: -0.3 }} />
          </Box>

          <Menu
            id="analytics-export-menu"
            anchorEl={exportAnchorEl}
            open={isExportMenuOpen}
            onClose={handleCloseExportMenu}
            MenuListProps={{
              'aria-labelledby': 'analytics-export-button',
            }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: 3,
                  minWidth: 220,
                  p: 0.5,
                  backdropFilter: 'blur(16px)',
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                    : '0 10px 30px rgba(37,99,235, 0.15)',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* PDF Option */}
            <MenuItem
              onClick={() => handleSelectExport('pdf')}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', color: '#EF4444' }}>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('analytics_exportPdf')}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
              />
            </MenuItem>

            {/* Word (.docx) Option */}
            <MenuItem
              onClick={() => handleSelectExport('word')}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', color: '#3B82F6' }}>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('analytics_exportWord')}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
              />
            </MenuItem>

            {/* CSV Option */}
            <MenuItem
              onClick={() => handleSelectExport('csv')}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', color: '#10B981' }}>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('analytics_exportCsv')}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filter Row: Range Segmented Pills & Platform Selector & Meta info */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(12, 17, 34, 0.5)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Range Segmented Controls */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
            overflowX: 'auto',
          }}
        >
          {RANGE_OPTIONS.map((opt) => {
            const isSelected = range === opt.value;
            return (
              <Box
                key={opt.value}
                component="button"
                onClick={() => setRange(opt.value)}
                sx={{
                  position: 'relative',
                  px: { xs: 1.5, sm: 2 },
                  py: 0.7,
                  borderRadius: 2,
                  border: 'none',
                  background: 'transparent',
                  color: isSelected ? '#ffffff' : 'text.secondary',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  zIndex: 1,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: isSelected ? '#ffffff' : 'text.primary',
                  },
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-range-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      background: '#2563EB',
                      boxShadow: '0 2px 10px rgba(37,99,235, 0.4)',
                      zIndex: -1,
                    }}
                  />
                )}
                {t(opt.labelKey)}
              </Box>
            );
          })}
        </Box>

        {/* Right side: Platform Selector + IST note */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Platform Select */}
          <Select
            value={platform || 'all'}
            onChange={(e) => setPlatform(e.target.value)}
            size="small"
            displayEmpty
            inputProps={{ 'aria-label': 'Select platform' }}
            sx={{
              minWidth: 160,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              fontSize: '0.85rem',
              fontWeight: 600,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563EB',
              },
            }}
          >
            {PLATFORM_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                {opt.icon}
                <Typography variant="body2" fontWeight={500}>
                  {opt.label || t(opt.labelKey)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          {/* Last Updated Timestamp & IST notice */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 13 }} />
              {relativeUpdated ? t('analytics_statsLastUpdated').replace('{time}', relativeUpdated) : t('analytics_notUpdatedYet')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
              {t('analytics_timesIST')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsHeader;
