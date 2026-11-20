// NAYA: ShortsContainer — AI Shorts feature ka main orchestrator
import { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../i18n/useTranslation';
import PageHeader from '../../common/components/motion/PageHeader';
import AnimatedSection from '../../common/components/motion/AnimatedSection';
import { showToast } from '../../store/redux/slices/toastSlice';
import { shortsApiAction } from './shortsApiSlice';

import SourceCard from './components/SourceCard';
import OptionsPanel from './components/OptionsPanel';
import ProgressCard from './components/ProgressCard';
import ClipsGrid from './components/ClipsGrid';
import RangeSelector from './components/RangeSelector';
import JobHistory from './components/JobHistory';

// NAYA: active status check — polling ke liye
const ACTIVE_STATUSES = new Set(['queued', 'downloading', 'transcribing', 'analyzing', 'rendering']);

// NAYA: default options
const DEFAULT_OPTIONS = {
  facecamCrop: false,
  captions: true,
  originalAudio: true,
  musicTrack: null,
  musicVolume: 25,
  voiceoverFile: null,
  voiceoverVolume: 100,
  minSec: 20,
  maxSec: 60,
};

const DEFAULT_RANGE = { enabled: false, startSec: null, endSec: null, valid: true, required: false };

const ShortsContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // NAYA: state management
  const [sourceData, setSourceData] = useState(null); // { mode, url, file, title, info }
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [activeJobId, setActiveJobId] = useState(() => searchParams.get('job') || null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [range, setRange] = useState(DEFAULT_RANGE); // timestamp range (lambi video ya user ka chuna hissa)
  const handleRangeChange = useCallback((r) => setRange(r), []);

  // NAYA: RTK Query hooks
  const [createJob] = shortsApiAction.useCreateJobMutation();
  const [createUploadJob] = shortsApiAction.useCreateUploadJobMutation();
  const [regenerate, { isLoading: isRegenerating }] = shortsApiAction.useRegenerateMutation();
  const { data: jobsList = [], refetch: refetchListJobs } = shortsApiAction.useListJobsQuery();

  // NAYA: active job polling — RTK Query split hook se pure render time polling interval
  const jobState = shortsApiAction.endpoints.getJob.useQueryState(activeJobId);
  const activeJob = jobState.data;
  const isJobActive = Boolean(activeJobId && (!activeJob || ACTIVE_STATUSES.has(activeJob.status)));
  shortsApiAction.endpoints.getJob.useQuerySubscription(activeJobId, {
    skip: !activeJobId,
    pollingInterval: isJobActive ? 4000 : 0,
  });

  // NAYA: job done/failed hone par listJobs refetch karo
  useEffect(() => {
    if (activeJob?.status === 'done' || activeJob?.status === 'failed') {
      refetchListJobs();
    }
  }, [activeJob?.status, refetchListJobs]);

  // NAYA: URL me job id sync karo
  useEffect(() => {
    if (activeJobId) {
      setSearchParams({ job: activeJobId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeJobId, setSearchParams]);

  // NAYA: source data ready hone par handle karo
  const handleSourceReady = useCallback((data) => {
    setSourceData(data);
  }, []);

  // Video ki lambai (YouTube: API se, upload: browser ke video metadata se)
  const sourceDurationSec = sourceData?.mode === 'upload' ? sourceData?.durationSec : sourceData?.info?.durationSec;
  const rangeShown = Boolean(sourceDurationSec);
  const rangeActive = rangeShown && range.enabled;
  const rangeBlocked = rangeActive && !range.valid;

  // NAYA: FormData build karo aur job create karo (YouTube link ya Direct Upload)
  const handleGenerate = async () => {
    if (!sourceData) {
      dispatch(showToast({ message: 'Please provide a video source first.', variant: 'warning' }));
      return;
    }

    if (rangeActive && !range.valid) {
      dispatch(showToast({ message: 'Please fix the timestamp range first.', variant: 'warning' }));
      return;
    }

    if (sourceData.mode === 'upload') {
      if (!sourceData.file) {
        dispatch(showToast({ message: 'Please select a video file first.', variant: 'warning' }));
        return;
      }

      setIsCreatingJob(true);
      try {
        const fd = new FormData();
        fd.append('video', sourceData.file);
        if (sourceData.title?.trim()) {
          fd.append('title', sourceData.title.trim());
        }
        fd.append('facecamCrop', String(options.facecamCrop));
        fd.append('captions', String(options.captions));
        fd.append('originalAudio', String(options.originalAudio));
        fd.append('musicVolume', String(options.musicVolume));
        fd.append('voiceoverVolume', String(options.voiceoverVolume));
        fd.append('minSec', String(options.minSec));
        fd.append('maxSec', String(options.maxSec));
        if (rangeActive) {
          fd.append('rangeStart', String(range.startSec));
          fd.append('rangeEnd', String(range.endSec));
        }
        if (options.musicTrack?._id) fd.append('musicTrackId', options.musicTrack._id);
        if (options.voiceoverFile) fd.append('voiceover', options.voiceoverFile);

        const result = await createUploadJob(fd).unwrap();
        const newId = result.id || result._id || result.jobId;
        setActiveJobId(newId);
      } catch (err) {
        // NAYA: 409 = already running — existing job resume karo
        if (err?.status === 409) {
          dispatch(showToast({ message: 'A job is already running. Resuming it.', variant: 'info' }));
          const running = jobsList.find((j) => ACTIVE_STATUSES.has(j.status));
          if (running) {
            setActiveJobId(running.id);
          }
        }
        // Error toast already shown by interceptor for other errors
      } finally {
        setIsCreatingJob(false);
      }
    } else {
      // YouTube mode (default)
      if (!sourceData.url) {
        dispatch(showToast({ message: 'Please fetch a video first.', variant: 'warning' }));
        return;
      }

      setIsCreatingJob(true);
      try {
        const fd = new FormData();
        fd.append('url', sourceData.url);
        fd.append('facecamCrop', String(options.facecamCrop));
        fd.append('captions', String(options.captions));
        fd.append('originalAudio', String(options.originalAudio));
        fd.append('musicVolume', String(options.musicVolume));
        fd.append('voiceoverVolume', String(options.voiceoverVolume));
        fd.append('minSec', String(options.minSec));
        fd.append('maxSec', String(options.maxSec));
        if (rangeActive) {
          fd.append('rangeStart', String(range.startSec));
          fd.append('rangeEnd', String(range.endSec));
        }
        if (options.musicTrack?._id) fd.append('musicTrackId', options.musicTrack._id);
        if (options.voiceoverFile) fd.append('voiceover', options.voiceoverFile);

        const result = await createJob(fd).unwrap();
        const newId = result.id || result._id || result.jobId;
        setActiveJobId(newId);
      } catch (err) {
        // NAYA: 409 = already running — existing job resume karo
        if (err?.status === 409) {
          dispatch(showToast({ message: 'A job is already running. Resuming it.', variant: 'info' }));
          const running = jobsList.find((j) => ACTIVE_STATUSES.has(j.status));
          if (running) {
            setActiveJobId(running.id);
          }
        }
        // Error toast already shown by interceptor for other errors
      } finally {
        setIsCreatingJob(false);
      }
    }
  };

  // NAYA: regenerate — same settings, naye timestamps
  const handleRegenerate = async () => {
    if (!activeJobId) return;
    try {
      const result = await regenerate(activeJobId).unwrap();
      const newId = result.id || result._id || result.jobId;
      setActiveJobId(newId);
    } catch {
      // Error toast shown by interceptor
    }
  };

  // NAYA: start over — form reset karo
  const handleStartOver = () => {
    setActiveJobId(null);
    setSourceData(null);
    setOptions(DEFAULT_OPTIONS);
    setRange(DEFAULT_RANGE);
    setResetKey((k) => k + 1);
  };

  // NAYA: Create Post — navigate to /create with shorts preset
  const handleCreatePost = useCallback((presetData) => {
    navigate('/create', { state: { shortsPreset: presetData } });
  }, [navigate]);

  // NAYA: job history se koi job select karo
  const handleSelectJob = (jobId) => {
    setActiveJobId(jobId);
  };

  const isJobRunning = activeJob && ACTIVE_STATUSES.has(activeJob.status);
  const showProgress = activeJob && !['done'].includes(activeJob.status) && activeJob.status !== undefined;
  const showClips = activeJob && (activeJob.clips?.length > 0 || activeJob.status === 'done' || activeJob.status === 'rendering');

  const authorized = sourceData?.mode === 'upload' ? true : sourceData?.info?.authorized;

  return (
    <AnimatedSection direction="none" sx={{ width: '100%' }}>
      <PageHeader
        icon={<MovieFilterIcon />}
        title={t('shorts_title')}
        subtitle={t('shorts_subtitle')}
      />

      <Grid container spacing={3}>
        {/* Left column — setup */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {/* Source URL / Upload card */}
          <SourceCard
            onSourceReady={handleSourceReady}
            disabled={isJobRunning || isCreatingJob}
            resetKey={resetKey}
          />

          {/* Timestamp range: lambi video (>60 min) me zaroori, baaki me optional */}
          {rangeShown && (
            <RangeSelector
              key={`${resetKey}-${sourceData?.mode}-${sourceData?.url || sourceData?.file?.name}-${sourceData?.file?.size || 0}`}
              durationSec={sourceDurationSec}
              limits={sourceData?.info?.limits}
              disabled={isJobRunning || isCreatingJob}
              onChange={handleRangeChange}
            />
          )}

          {/* Options + Generate */}
          <OptionsPanel
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isCreatingJob}
            isDisabled={isJobRunning || isCreatingJob}
            authorized={authorized}
            generateBlocked={rangeBlocked}
            blockedReason="Fix the timestamp range above to continue."
          />
        </Grid>

        {/* Right column — results */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {/* Progress card — job active or failed hone par dikhao */}
          {showProgress && activeJob?.status !== 'done' && (
            <ProgressCard
              job={activeJob}
              onRegenerate={handleRegenerate}
              onStartOver={handleStartOver}
              isRegenerating={isRegenerating}
            />
          )}

          {/* Clips grid — clips available hone par dikhao */}
          {showClips && (
            <ClipsGrid
              job={activeJob}
              onRegenerate={handleRegenerate}
              onStartOver={handleStartOver}
              onCreatePost={handleCreatePost}
              isRegenerating={isRegenerating}
            />
          )}

          {/* Empty state — no job */}
          {!activeJob && !isCreatingJob && (
            <Box
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 300, opacity: 0.5, gap: 1.5,
              }}
            >
              <MovieFilterIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Paste a YouTube URL or upload a video file and click Generate to create AI-powered Shorts.
              </Typography>
            </Box>
          )}

          {/* Job History */}
          <Box sx={{ mt: 4 }}>
            <JobHistory onSelectJob={handleSelectJob} activeJobId={activeJobId} />
          </Box>
        </Grid>
      </Grid>
    </AnimatedSection>
  );
};

export default ShortsContainer;
