// NAYA: ProgressCard — job status stepper + progress bar
import {
  Box, Typography, LinearProgress, Stepper, Step, StepLabel, Alert, Chip
} from '@mui/material';
import DownloadingIcon from '@mui/icons-material/Downloading';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SearchIcon from '@mui/icons-material/Search';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import { useTranslation } from '../../../i18n/useTranslation';
import Button from '../../../common/Button';
import GlassCard from '../../../common/components/motion/GlassCard';

// NAYA: status se step index nikalo
const STATUS_TO_STEP = {
  queued: 0,
  downloading: 0,
  transcribing: 1,
  analyzing: 2,
  rendering: 3,
  done: 4,
  failed: -1,
};

const STEP_ICONS = [DownloadingIcon, RecordVoiceOverIcon, SearchIcon, MovieFilterIcon];

const ProgressCard = ({ job, onRegenerate, onStartOver, isRegenerating }) => {
  const { t } = useTranslation();

  const steps = [
    t('shorts_stepDownload'),
    t('shorts_stepTranscribe'),
    t('shorts_stepMoments'),
    t('shorts_stepRender'),
  ];

  const activeStep = STATUS_TO_STEP[job?.status] ?? 0;
  const isFailed = job?.status === 'failed';
  const isDone = job?.status === 'done';

  const progress = job?.progress ?? 0;

  return (
    <GlassCard sx={{ mb: 3, borderRadius: 3 }}>
      <Box sx={{ p: 3 }}>
        {/* Title + status chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>Processing</Typography>
          <Chip
            size="small"
            label={job?.status ?? 'queued'}
            sx={{
              fontWeight: 600, fontSize: '0.72rem', textTransform: 'capitalize',
              bgcolor: isFailed
                ? 'rgba(239,68,68,0.12)'
                : isDone
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(37,99,235,0.1)',
              color: isFailed ? '#EF4444' : isDone ? '#10B981' : '#2563EB',
              border: '1px solid',
              borderColor: isFailed
                ? 'rgba(239,68,68,0.3)'
                : isDone
                  ? 'rgba(16,185,129,0.3)'
                  : 'rgba(37,99,235,0.25)',
            }}
          />
        </Box>

        {/* Stepper — horizontal */}
        <Stepper
          activeStep={isFailed ? 0 : activeStep}
          alternativeLabel
          sx={{
            mb: 2,
            '& .MuiStepLabel-label': { fontSize: '0.72rem' },
            '& .MuiStepIcon-root.Mui-active': { color: '#2563EB' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#10B981' },
          }}
        >
          {steps.map((label, i) => (
            <Step key={label} completed={!isFailed && activeStep > i}>
              <StepLabel
                error={isFailed && i === 0}
                icon={(() => {
                  const Icon = STEP_ICONS[i];
                  return <Icon sx={{ fontSize: 18 }} />;
                })()}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Stage text + progress bar */}
        {!isFailed && (
          <>
            {job?.stage && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                {job.stage}
              </Typography>
            )}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                borderRadius: 2, height: 6,
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.1)',
                '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 2 },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', textAlign: 'right', mt: 0.5 }}>
              {progress}%
            </Typography>
          </>
        )}

        {/* Warning */}
        {job?.warning && !isFailed && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
            {job.warning}
          </Alert>
        )}

        {/* Failed state */}
        {isFailed && (
          <>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
              {job?.error || t('shorts_failed')}
            </Alert>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={onRegenerate}
                loading={isRegenerating}
                sx={{ borderRadius: 2, flex: 1 }}
              >
                {t('shorts_tryAgain')}
              </Button>
              <Button
                variant="outlined"
                onClick={onStartOver}
                disabled={isRegenerating}
                sx={{ borderRadius: 2, flex: 1, borderColor: 'divider' }}
              >
                {t('shorts_newVideo')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </GlassCard>
  );
};

export default ProgressCard;
