// NEW: voice command mic button — Feature 4
import { Box, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../store/redux/slices/toastSlice';
import { POST_RULES } from '../../../config/postRules';
import { aiApiAction } from '../../ai/aiApiSlice';
import { useTranslation } from '../../../i18n/useTranslation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { usePrefersReducedMotion } from '../../landing/hooks/usePrefersReducedMotion';
import VoiceCommandDialog from './VoiceCommandDialog';

/**
 * The floating gradient mic button placed in the CreatePost header.
 * Works on both 'chooseType' and 'compose' steps.
 *
 * Props:
 *  - step: 'chooseType' | 'compose'
 *  - connectedPlatforms: string[]
 *  - handleSelectType: fn(type)
 *  - setAiTopic: fn
 *  - setSelectedPlatforms: fn
 *  - setScheduleEnabled: fn
 *  - setScheduledAt: fn
 *  - handleGenerateAI: fn  (called if autoFillAI is checked, after topic is set)
 *  - setContent: fn  (from compose state)
 */
const VoiceCommandButton = ({
  step,
  connectedPlatforms,
  handleSelectType,
  setAiTopic,
  setSelectedPlatforms,
  setScheduleEnabled,
  setScheduledAt,
  handleGenerateAI,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const speechHook = useSpeechRecognition();

  // Pending values to apply after step transitions to compose
  const pendingValuesRef = useRef(null);
  const [waitingForCompose, setWaitingForCompose] = useState(false);

  // Once step becomes 'compose', apply pending values
  useEffect(() => {
    if (step === 'compose' && waitingForCompose && pendingValuesRef.current) {
      const vals = pendingValuesRef.current;
      pendingValuesRef.current = null;
      setWaitingForCompose(false);

      // Apply after a tick so the form is reset by handleSelectType first
      setTimeout(() => {
        if (vals.topic) setAiTopic(vals.topic);
        if (vals.platforms?.length) setSelectedPlatforms(vals.platforms);
        if (vals.scheduledAt) {
          setScheduleEnabled(true);
          setScheduledAt(new Date(vals.scheduledAt));
        } else {
          setScheduleEnabled(false);
        }
        if (vals.autoFillAI && vals.topic) {
          handleGenerateAI && handleGenerateAI(vals.topic);
        }
      }, 50);
    }
  }, [step, waitingForCompose, setAiTopic, setSelectedPlatforms, setScheduleEnabled, setScheduledAt, handleGenerateAI]);

  const handleConfirm = ({ topic, platforms, postType, scheduledAt, autoFillAI }) => {
    const validPlatforms = platforms.filter((p) => connectedPlatforms.includes(p));

    if (step === 'chooseType') {
      // handleSelectType resets the form — schedule pending values
      pendingValuesRef.current = { topic, platforms: validPlatforms, scheduledAt, autoFillAI };
      setWaitingForCompose(true);
      handleSelectType(postType);
    } else {
      // Already in compose: check if postType differs
      setAiTopic(topic);
      setSelectedPlatforms(validPlatforms);
      if (scheduledAt) {
        setScheduleEnabled(true);
        setScheduledAt(new Date(scheduledAt));
      } else {
        setScheduleEnabled(false);
      }
      if (autoFillAI && topic) {
        handleGenerateAI && handleGenerateAI(topic);
      }
    }
  };

  const pulseSx =
    speechHook.listening && !reduced
      ? {
          boxShadow: '0 0 0 0px rgba(139,92,246,0.5)',
          animation: 'voicePulse 1.2s infinite',
        }
      : {};

  return (
    <>
      <style>{`
        @keyframes voicePulse {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
      `}</style>

      <Tooltip
        title={
          !speechHook.supported
            ? t('voice_notSupported')
            : t('voice_openDialog')
        }
        arrow
      >
        <Box
          component={motion.button}
          onClick={() => setOpen(true)}
          aria-label={t('voice_openDialog')}
          whileHover={reduced ? {} : { scale: 1.08, y: -2 }}
          whileTap={reduced ? {} : { scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 20 }}
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #D946EF 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'box-shadow 0.2s',
            ...pulseSx,
          }}
        >
          <MicIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
      </Tooltip>

      <VoiceCommandDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        connectedPlatforms={connectedPlatforms}
        useSpeechRecognitionHook={speechHook}
      />
    </>
  );
};

export default VoiceCommandButton;
