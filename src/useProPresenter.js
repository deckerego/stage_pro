import { useState, useEffect, useCallback } from 'react';
import { fetchScreens, fetchLayoutMap, fetchStageScreensStatus } from './api';

export function useProPresenter() {
  const [screens, setScreens] = useState([]);
  const [layoutMap, setLayoutMap] = useState([]);
  const [stageEnabled, setStageEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [screensData, layoutMapData, statusData] = await Promise.all([
        fetchScreens(),
        fetchLayoutMap(),
        fetchStageScreensStatus(),
      ]);
      setScreens(screensData);
      setLayoutMap(layoutMapData);
      setStageEnabled(statusData);
    } catch (err) {
      setError(err.message || 'Failed to connect to ProPresenter');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Build a map from screen UUID -> layout info
  const screenLayouts = layoutMap.reduce((acc, entry) => {
    if (entry.screen?.uuid) {
      acc[entry.screen.uuid] = entry.layout;
    }
    return acc;
  }, {});

  return { screens, screenLayouts, stageEnabled, loading, error, reload: load };
}
