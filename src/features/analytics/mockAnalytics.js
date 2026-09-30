// NEW: DEV-ONLY realistic mock fixture for testing Analytics UI without backend data
// Activated ONLY when import.meta.env.DEV && new URLSearchParams(window.location.search).get('mock') === '1'

export const getMockAnalytics = (range = '30d', platform = 'all') => {
  const now = new Date();
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;

  // Generate continuous timeline points
  const points = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 1 : 2;
    const targets = (i % 3 === 0 ? base + 1 : base);
    const failed = i % 7 === 0 ? 1 : 0;
    const published = Math.max(0, targets - failed);
    const views = published * (120 + ((i * 37) % 350));
    const likes = published * (10 + ((i * 13) % 45));

    points.push({
      date: dateStr,
      targets,
      published,
      failed,
      views,
      likes,
    });
  }

  const totalPublished = points.reduce((acc, p) => acc + p.published, 0);
  const totalFailed = points.reduce((acc, p) => acc + p.failed, 0);
  const totalTargets = points.reduce((acc, p) => acc + p.targets, 0);
  const totalViews = points.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = points.reduce((acc, p) => acc + p.likes, 0);
  const postsCount = Math.round(totalTargets * 0.75);

  return {
    meta: {
      range,
      platform: platform || 'all',
      timezone: 'Asia/Kolkata',
      from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
      generatedAt: now.toISOString(),
      statsLastUpdatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      note: 'Views/likes platform ke total (abhi tak ke) hain; timeline mein wo post ki scheduled date par count hote hain.',
    },
    totals: {
      posts: postsCount,
      targets: totalTargets,
      published: totalPublished,
      failed: totalFailed,
      pending: 2,
      successRate: Math.round((totalPublished / (totalPublished + totalFailed)) * 1000) / 10,
      views: totalViews,
      likes: totalLikes,
      targetsWithStats: totalPublished,
      avgViews: totalPublished ? Math.round(totalViews / totalPublished) : 0,
      avgLikes: totalPublished ? Math.round(totalLikes / totalPublished) : 0,
    },
    comparison: range === 'all' ? null : {
      posts: { current: postsCount, previous: Math.round(postsCount * 0.7), changePct: 43 },
      published: { current: totalPublished, previous: Math.round(totalPublished * 0.72), changePct: 39 },
      failed: { current: totalFailed, previous: Math.round(totalFailed * 1.5) || 1, changePct: -33 },
      views: { current: totalViews, previous: Math.round(totalViews * 0.65), changePct: 54 },
      likes: { current: totalLikes, previous: Math.round(totalLikes * 0.68), changePct: 47 },
    },
    postStatus: {
      pending: 2,
      processing: 0,
      completed: Math.max(1, postsCount - totalFailed - 2),
      partial: 1,
      failed: totalFailed,
    },
    timeline: {
      granularity: range === 'all' ? 'month' : 'day',
      points,
    },
    platforms: [
      {
        platform: 'instagram',
        posts: Math.round(postsCount * 0.45),
        targets: Math.round(totalTargets * 0.45),
        published: Math.round(totalPublished * 0.48),
        failed: 1,
        pending: 1,
        successRate: 94.7,
        views: Math.round(totalViews * 0.52),
        likes: Math.round(totalLikes * 0.58),
        targetsWithStats: Math.round(totalPublished * 0.48),
        avgViews: 420,
        avgLikes: 48,
        removed: 1,
      },
      {
        platform: 'youtube',
        posts: Math.round(postsCount * 0.35),
        targets: Math.round(totalTargets * 0.35),
        published: Math.round(totalPublished * 0.33),
        failed: 1,
        pending: 1,
        successRate: 92.3,
        views: Math.round(totalViews * 0.35),
        likes: Math.round(totalLikes * 0.28),
        targetsWithStats: Math.round(totalPublished * 0.33),
        avgViews: 380,
        avgLikes: 25,
        removed: 0,
      },
      {
        platform: 'facebook',
        posts: Math.round(postsCount * 0.2),
        targets: Math.round(totalTargets * 0.2),
        published: Math.round(totalPublished * 0.19),
        failed: 1,
        pending: 0,
        successRate: 88.9,
        views: Math.round(totalViews * 0.13),
        likes: Math.round(totalLikes * 0.14),
        targetsWithStats: Math.round(totalPublished * 0.19),
        avgViews: 210,
        avgLikes: 18,
        removed: 0,
      },
    ],
    postTypes: [
      { postType: 'reel', posts: 14, targets: 18, published: 17, failed: 1, views: 4800, likes: 450, avgViews: 282, avgLikes: 26, targetsWithStats: 17, successRate: 94.4, removed: 0 },
      { postType: 'feed', posts: 10, targets: 14, published: 13, failed: 1, views: 2400, likes: 190, avgViews: 184, avgLikes: 15, targetsWithStats: 13, successRate: 92.8, removed: 1 },
      { postType: 'photo', posts: 8, targets: 10, published: 10, failed: 0, views: 1800, likes: 160, avgViews: 180, avgLikes: 16, targetsWithStats: 10, successRate: 100, removed: 0 },
      { postType: 'video', posts: 5, targets: 6, published: 5, failed: 1, views: 2900, likes: 210, avgViews: 580, avgLikes: 42, targetsWithStats: 5, successRate: 83.3, removed: 0 },
      { postType: 'story', posts: 6, targets: 6, published: 6, failed: 0, views: 1200, likes: 95, avgViews: 200, avgLikes: 16, targetsWithStats: 6, successRate: 100, removed: 0 },
      { postType: 'text', posts: 4, targets: 4, published: 4, failed: 0, views: 600, likes: 40, avgViews: 150, avgLikes: 10, targetsWithStats: 4, successRate: 100, removed: 0 },
    ],
    heatmap: {
      totalPosts: totalPublished,
      maxScore: 9200,
      cells: [
        { dayOfWeek: 2, dayName: 'Tuesday', hour: 19, posts: 4, avgViews: 540, avgLikes: 52, avgScore: 1060 },
        { dayOfWeek: 4, dayName: 'Thursday', hour: 20, posts: 3, avgViews: 490, avgLikes: 45, avgScore: 940 },
        { dayOfWeek: 6, dayName: 'Saturday', hour: 18, posts: 3, avgViews: 460, avgLikes: 40, avgScore: 860 },
        { dayOfWeek: 0, dayName: 'Sunday', hour: 11, posts: 2, avgViews: 380, avgLikes: 35, avgScore: 730 },
        { dayOfWeek: 1, dayName: 'Monday', hour: 14, posts: 3, avgViews: 320, avgLikes: 25, avgScore: 570 },
        { dayOfWeek: 3, dayName: 'Wednesday', hour: 17, posts: 3, avgViews: 410, avgLikes: 30, avgScore: 710 },
        { dayOfWeek: 5, dayName: 'Friday', hour: 21, posts: 4, avgViews: 510, avgLikes: 48, avgScore: 990 },
        { dayOfWeek: 2, dayName: 'Tuesday', hour: 10, posts: 2, avgViews: 250, avgLikes: 20, avgScore: 450 },
        { dayOfWeek: 4, dayName: 'Thursday', hour: 12, posts: 2, avgViews: 280, avgLikes: 22, avgScore: 500 },
        { dayOfWeek: 6, dayName: 'Saturday', hour: 21, posts: 2, avgViews: 430, avgLikes: 36, avgScore: 790 },
      ],
      byHour: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        posts: [10, 11, 12, 14, 17, 18, 19, 20, 21].includes(h) ? Math.floor(Math.random() * 4 + 2) : (h > 8 && h < 23 ? 1 : 0),
        avgViews: [18, 19, 20, 21].includes(h) ? 480 : [10, 11, 12, 14, 17].includes(h) ? 310 : 90,
        avgLikes: [18, 19, 20, 21].includes(h) ? 45 : [10, 11, 12, 14, 17].includes(h) ? 24 : 8,
        avgScore: [18, 19, 20, 21].includes(h) ? 930 : [10, 11, 12, 14, 17].includes(h) ? 550 : 170,
      })),
      byDay: [
        { dayOfWeek: 0, dayName: 'Sunday', posts: 4, avgViews: 380, avgLikes: 35, avgScore: 730 },
        { dayOfWeek: 1, dayName: 'Monday', posts: 5, avgViews: 320, avgLikes: 25, avgScore: 570 },
        { dayOfWeek: 2, dayName: 'Tuesday', posts: 8, avgViews: 510, avgLikes: 48, avgScore: 990 },
        { dayOfWeek: 3, dayName: 'Wednesday', posts: 6, avgViews: 410, avgLikes: 30, avgScore: 710 },
        { dayOfWeek: 4, dayName: 'Thursday', posts: 7, avgViews: 490, avgLikes: 45, avgScore: 940 },
        { dayOfWeek: 5, dayName: 'Friday', posts: 7, avgViews: 510, avgLikes: 48, avgScore: 990 },
        { dayOfWeek: 6, dayName: 'Saturday', posts: 6, avgViews: 460, avgLikes: 40, avgScore: 860 },
      ],
    },
    topPosts: [
      {
        postId: 'mock-1',
        platform: 'instagram',
        postType: 'reel',
        content: '🚀 5 AI Tools that will 10x your productivity in 2026! Save this reel for later #productivity #ai',
        publishedUrl: 'https://instagram.com/p/mock1',
        scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        views: 2450,
        likes: 210,
        score: 4550,
      },
      {
        postId: 'mock-2',
        platform: 'youtube',
        postType: 'video',
        content: 'Complete Guide: Mastering Full-Stack React & Node.js in 30 Days (Free Roadmap)',
        publishedUrl: 'https://youtube.com/watch?v=mock2',
        scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        views: 1890,
        likes: 165,
        score: 3540,
      },
      {
        postId: 'mock-3',
        platform: 'instagram',
        postType: 'photo',
        content: 'Behind the scenes at our creator studio 📸 What does your desk setup look like?',
        publishedUrl: 'https://instagram.com/p/mock3',
        scheduledAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        views: 1120,
        likes: 142,
        score: 2540,
      },
      {
        postId: 'mock-4',
        platform: 'facebook',
        postType: 'feed',
        content: 'Excited to announce our new update! Faster scheduling, AI captions, and multi-account support.',
        publishedUrl: 'https://facebook.com/post/mock4',
        scheduledAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        views: 890,
        likes: 74,
        score: 1630,
      },
      {
        postId: 'mock-5',
        platform: 'instagram',
        postType: 'story',
        content: 'Quick poll: Which feature should we build next? Vote in our story stickers 🗳️',
        publishedUrl: 'https://instagram.com/stories/mock5',
        scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        views: 650,
        likes: 52,
        score: 1170,
      },
    ],
    failures: {
      total: 3,
      byPlatform: [
        { platform: 'facebook', count: 1 },
        { platform: 'instagram', count: 1 },
        { platform: 'youtube', count: 1 },
      ],
      reasons: [
        { reason: 'OAuth access token expired for account #', count: 2, platforms: ['facebook', 'instagram'] },
        { reason: 'Video duration exceeds maximum allowed limit for platform', count: 1, platforms: ['youtube'] },
      ],
    },
    health: {
      live: totalPublished - 1,
      removed: 1,
      unknown: 0,
    },
    insights: [
      { key: 'best_platform', type: 'success', params: { platform: 'instagram', avgViews: 420, avgLikes: 48 } },
      { key: 'best_post_type', type: 'success', params: { postType: 'reel', avgViews: 282, avgLikes: 26 } },
      { key: 'best_slot', type: 'success', params: { dayName: 'Tuesday', hour: 19, avgViews: 540, avgLikes: 52 } },
      { key: 'top_failure_reason', type: 'warning', params: { reason: 'OAuth access token expired', count: 2 } },
      { key: 'removed_posts', type: 'warning', params: { count: 1 } },
    ],
    upcoming: {
      count: 3,
      next: [
        {
          postId: 'up-1',
          content: '🔥 Launching our weekend special discount! Use code BLITZ20 at checkout.',
          postType: 'reel',
          scheduledAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          platforms: ['instagram', 'facebook'],
        },
        {
          postId: 'up-2',
          content: 'Weekly Tech News Roundup #42: New developments in AI and Cloud Computing.',
          postType: 'feed',
          scheduledAt: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
          platforms: ['youtube', 'facebook'],
        },
        {
          postId: 'up-3',
          content: 'Sunday motivation for creators 💡 Keep pushing your boundaries!',
          postType: 'photo',
          scheduledAt: new Date(now.getTime() + 52 * 60 * 60 * 1000).toISOString(),
          platforms: ['instagram'],
        },
      ],
    },
    bestTime: {
      source: 'your_data',
      basedOnPosts: totalPublished,
      message: 'Based on engagement patterns across your published posts.',
      timezone: 'Asia/Kolkata',
      slots: [
        { dayOfWeek: 2, dayName: 'Tuesday', hour: 19, label: 'Tuesday, 7 PM', nextAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), posts: 4, avgViews: 540, avgLikes: 52 },
        { dayOfWeek: 5, dayName: 'Friday', hour: 21, label: 'Friday, 9 PM', nextAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), posts: 4, avgViews: 510, avgLikes: 48 },
        { dayOfWeek: 4, dayName: 'Thursday', hour: 20, label: 'Thursday, 8 PM', nextAt: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(), posts: 3, avgViews: 490, avgLikes: 45 },
      ],
    },
  };
};
