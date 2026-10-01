import { Box } from '@mui/material';
import { useTranslation } from '../i18n/useTranslation';

const STATUS_CONFIG = {
  pending: { labelKey: 'statusPending', color: '#F59E0B', kind: 'ping' },
  processing: { labelKey: 'statusProcessing', color: '#3B82F6', kind: 'spin' },
  completed: { labelKey: 'statusCompleted', color: '#10B981', kind: 'check' },
  published: { labelKey: 'statusPublished', color: '#10B981', kind: 'check' },
  partial: { labelKey: 'statusPartial', color: '#F59E0B', kind: 'half' },
  failed: { labelKey: 'statusFailed', color: '#EF4444', kind: 'shake' },
  scheduled: { labelKey: 'statusScheduled', color: '#2563EB', kind: 'ping' },
};

/** Tiny animated glyph per status: check draws itself, pending pings, processing spins, failed shakes once. */
const Glyph = ({ kind, color }) => {
  const box = { width: 12, height: 12, flexShrink: 0, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  if (kind === 'check') {
    return (
      <Box sx={box}><svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.2 6.4 L4.9 9 L9.8 3.2" strokeDasharray="14" style={{ animation: 'pp-draw .5s .15s cubic-bezier(.2,.8,.2,1) both' }} />
      </svg></Box>
    );
  }
  if (kind === 'spin') return <Box sx={{ ...box, borderRadius: '50%', border: `1.8px solid ${color}40`, borderTopColor: color, animation: 'pp-spin 0.8s linear infinite' }} />;
  if (kind === 'half') return <Box sx={{ ...box, borderRadius: '50%', border: `1.8px solid ${color}`, background: `linear-gradient(90deg, ${color} 50%, transparent 50%)` }} />;
  if (kind === 'shake') return <Box sx={{ ...box, animation: 'pp-shake .5s .1s ease both', fontWeight: 800, fontSize: 11, lineHeight: 1, color }}>!</Box>;
  return (
    <Box sx={box}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${color}`, animation: 'pp-ping 2s ease-out infinite' }} />
    </Box>
  );
};

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, pl: 0.9, pr: 1.2, height: 24, borderRadius: '8px', fontWeight: 600, fontSize: '0.74rem',
      color: config.color, bgcolor: `${config.color}1F`, border: `1px solid ${config.color}40`, whiteSpace: 'nowrap' }}>
      <Glyph kind={config.kind} color={config.color} />
      {t(config.labelKey)}
    </Box>
  );
};

export default StatusBadge;
