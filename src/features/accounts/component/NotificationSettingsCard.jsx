// NEW: email notification toggle — Feature 3
import { Box, CardContent, Typography, Switch, Skeleton, Chip, Collapse } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { authApiAction } from '../../auth/authApiSlice';
import { useTranslation } from '../../../i18n/useTranslation';
import GlassCard from '../../../common/components/motion/GlassCard';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';

// Bell icon that wiggles once when turned on
const BellIcon = ({ ringing }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      animate={
        ringing && !reduced
          ? {
              rotate: [0, -18, 18, -12, 12, -6, 6, 0],
              transition: { duration: 0.65, ease: 'easeInOut' },
            }
          : {}
      }
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <NotificationsIcon
        sx={{
          color: ringing ? '#93C5FD' : 'text.secondary',
          fontSize: 22,
          transition: 'color 0.3s',
        }}
      />
    </motion.div>
  );
};

const NOTIF_CHIPS = [
  { key: 'notif_chipScheduled', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> },
  { key: 'notif_chipPublished', icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
  { key: 'notif_chipFailed', icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> },
];

const NotificationSettingsCard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reduced = usePrefersReducedMotion();

  const { data, isLoading } = authApiAction.getNotificationSettings();
  const [updateSettings, { isLoading: isUpdating }] = authApiAction.updateNotificationSettings();

  // Optimistic state
  const [optimisticValue, setOptimisticValue] = useState(null);
  const [ringing, setRinging] = useState(false);
  const prevValueRef = useRef(null);

  const currentValue = optimisticValue !== null ? optimisticValue : (data?.emailNotifications ?? false);

  const handleToggle = async (e) => {
    const newVal = e.target.checked;
    prevValueRef.current = currentValue;
    setOptimisticValue(newVal); // optimistic
    if (newVal) setRinging(true);

    try {
      await updateSettings({ emailNotifications: newVal }).unwrap();
      dispatch(
        showToast({
          message: newVal ? t('notif_turnedOn') : t('notif_turnedOff'),
          variant: 'success',
        })
      );
    } catch {
      // Revert on error
      setOptimisticValue(prevValueRef.current);
    } finally {
      setTimeout(() => setRinging(false), 800);
    }
  };

  return (
    <GlassCard sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BellIcon ringing={ringing} />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('notif_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('notif_description')}
              </Typography>
            </Box>
          </Box>

          {isLoading ? (
            <Skeleton variant="rounded" width={48} height={28} sx={{ borderRadius: 14 }} />
          ) : (
            <Switch
              checked={currentValue}
              onChange={handleToggle}
              disabled={isLoading || isUpdating}
              inputProps={{ 'aria-label': t('notif_title') }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2563EB' },
              }}
            />
          )}
        </Box>

        {/* Animated chips when ON */}
        <Collapse in={currentValue && !isLoading} unmountOnExit>
          <Box
            component={motion.div}
            initial={reduced ? {} : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}
          >
            {NOTIF_CHIPS.map(({ key, icon }) => (
              <Chip
                key={key}
                icon={
                  <Box sx={{ color: '#34D399 !important', display: 'flex', ml: '4px !important' }}>
                    {icon}
                  </Box>
                }
                label={
                  <Typography variant="caption" fontWeight={600}>
                    {t(key)}
                  </Typography>
                }
                size="small"
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(52,211,153,0.1)'
                      : 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  color: '#34D399',
                  height: 26,
                  '& .MuiChip-icon': { fontSize: 13 },
                }}
              />
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </GlassCard>
  );
};

export default NotificationSettingsCard;
