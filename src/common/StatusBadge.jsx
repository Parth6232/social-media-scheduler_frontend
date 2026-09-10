import { Chip } from '@mui/material';
import { useTranslation } from '../i18n/useTranslation';

const STATUS_CONFIG = {
  pending: { labelKey: 'statusPending', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  processing: { labelKey: 'statusProcessing', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  completed: { labelKey: 'statusCompleted', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  published: { labelKey: 'statusPublished', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  failed: { labelKey: 'statusFailed', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  scheduled: { labelKey: 'statusScheduled', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
};

const StatusBadge = ({ status, size = 'small' }) => {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Chip
      label={t(config.labelKey)}
      size={size}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}40`,
        fontWeight: 600,
        fontSize: '0.72rem',
      }}
    />
  );
};

export default StatusBadge;
