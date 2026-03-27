import { useState, useEffect } from 'react';
import { streamStatusUpdates } from './api';

export function useSlideStream(enabled) {
  const [slide, setSlide] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    setConnected(false);

    (async () => {
      try {
        for await (const event of streamStatusUpdates(['status/slide'], controller.signal)) {
          if (event.url === 'status/slide') {
            setSlide(event.data);
            setConnected(true);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setConnected(false);
        }
      }
    })();

    return () => {
      controller.abort();
      setSlide(null);
      setConnected(false);
    };
  }, [enabled]);

  return { slide, connected };
}
