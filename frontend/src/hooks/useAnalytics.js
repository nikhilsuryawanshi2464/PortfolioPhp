// hooks/useAnalytics.js
// Drop this in frontend/src/hooks/useAnalytics.js
// Call usePageTracking() in each public page to auto-track visits

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsAPI } from '@services/api';

/**
 * Call once in each public page component to auto-track page views.
 * Usage: just put  usePageTracking();  at the top of your page component.
 */
export function usePageTracking() {
  const location  = useLocation();
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    // Small delay so client-side nav settles
    const t = setTimeout(() => {
      analyticsAPI.trackPageView({
        path:     location.pathname,
        referrer: document.referrer || '',
      }).catch(() => {}); // silently ignore errors
    }, 500);

    return () => {
      clearTimeout(t);
      // Track time-on-page when navigating away
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      if (duration > 2) {
        analyticsAPI.trackPageView({
          path:     location.pathname,
          referrer: document.referrer || '',
          duration,
        }).catch(() => {});
      }
    };
  }, [location.pathname]);
}

/**
 * Track a project view (call when project detail page loads).
 * Usage: useProjectTracking(project._id)
 */
export function useProjectTracking(projectId) {
  useEffect(() => {
    if (!projectId) return;
    const t = setTimeout(() => {
      analyticsAPI.trackProjectView(projectId).catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, [projectId]);
}

/**
 * One-time event tracker.
 * Usage: trackEvent('button', 'click', 'download-resume')
 */
export function useEventTracker() {
  return (category, action, label, value) => {
    analyticsAPI.trackEvent({ category, action, label, value }).catch(() => {});
  };
}