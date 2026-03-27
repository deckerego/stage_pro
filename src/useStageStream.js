import { useState, useEffect } from 'react';
import { streamStatusUpdates } from './api';

const ENDPOINTS = [
  'status/slide',
  'timers/current',
  'timer/video_countdown',
  'timer/system_time',
];

export function useStageStream() {
  const [slide, setSlide] = useState(null);
  const [timers, setTimers] = useState([]);
  const [videoCountdown, setVideoCountdown] = useState(null);
  const [systemTime, setSystemTime] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        for await (const event of streamStatusUpdates(ENDPOINTS, controller.signal)) {
          switch (event.url) {
            case 'status/slide':
              setSlide(event.data);
              setConnected(true);
              break;
            case 'timers/current':
              setTimers(event.data ?? []);
              break;
            case 'timer/video_countdown':
              setVideoCountdown(event.data);
              break;
            case 'timer/system_time':
              setSystemTime(event.data);
              break;
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') setConnected(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return { slide, timers, videoCountdown, systemTime, connected };
}
