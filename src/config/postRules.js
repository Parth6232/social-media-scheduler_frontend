export const POST_RULES = {
  feed: {
    label: 'Post',
    allowedPlatforms: ['youtube', 'instagram', 'facebook'],
    mediaType: 'both',
    requiresMedia: false,
    maxDurationSeconds: null,
  },
  text: {
    label: 'Text Post',
    allowedPlatforms: ['facebook'],
    mediaType: 'none',
    requiresMedia: false,
    maxDurationSeconds: null,
  },
  reel: {
    label: 'Reel',
    allowedPlatforms: ['youtube', 'instagram', 'facebook'],
    mediaType: 'video',
    requiresMedia: true,
    maxDurationSeconds: 90,
  },
  photo: {
    label: 'Photo Post',
    allowedPlatforms: ['instagram', 'facebook'],
    mediaType: 'image',
    requiresMedia: true,
    maxDurationSeconds: null,
  },
  video: {
    label: 'Long Video',
    allowedPlatforms: ['youtube'],
    mediaType: 'video',
    requiresMedia: true,
    maxDurationSeconds: null,
  },
  facebookVideo: {
    label: 'Facebook Video',
    allowedPlatforms: ['facebook'],
    mediaType: 'video',
    requiresMedia: true,
    maxDurationSeconds: null,
  },
  story: {
    label: 'Story',
    allowedPlatforms: ['instagram', 'facebook'],
    mediaType: 'both',
    requiresMedia: true,
    maxDurationSeconds: 60,
  },
};

// Platform-level media compatibility -- kis platform par kaunsa media
// (none/image/video) chalta hai.
export const PLATFORM_MEDIA_SUPPORT = {
  youtube: { none: false, image: false, video: true },
  facebook: { none: true, image: true, video: true },
  instagram: { none: false, image: true, video: true },
};

// Helper: diya gaya platform is media kind (none/image/video) ko accept karta hai ya nahi
export function isPlatformMediaCompatible(platform, mediaKind) {
  const support = PLATFORM_MEDIA_SUPPORT[platform];
  if (!support) return true;
  return !!support[mediaKind];
}