// NEW: Analytics CSV export utility with Authorization header
import { appConstants } from '../../../constant/appConstants';
import { localStore } from '../../../store/localStore';

export const downloadAnalyticsCsv = async ({ range = '30d', platform = null } = {}) => {
  const token = localStore.getToken();
  const params = new URLSearchParams();
  if (range) params.append('range', range);
  if (platform && platform !== 'all') params.append('platform', platform);
  const qs = params.toString();

  const url = `${appConstants.apiBaseURL}/analytics/export${qs ? `?${qs}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let errorMsg = 'Failed to export CSV';
    try {
      const errData = await response.json();
      if (errData?.message) errorMsg = errData.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  // Parse filename from Content-Disposition header if present
  let filename = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);

  return filename;
};
