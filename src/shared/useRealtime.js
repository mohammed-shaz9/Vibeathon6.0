import { useEffect, useRef } from 'react';

export function useRealtime(onMessage) {
  const wsRef = useRef(null);

  useEffect(() => {
    let pollTimer = null;
    try {
      const ws = new WebSocket(`ws://${window.location.host}`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch {}
      };
      ws.onerror = () => {
        if (!pollTimer) pollTimer = setInterval(() => onMessage({ type: 'poll' }), 5000);
      };
      ws.onclose = () => {
        if (!pollTimer) pollTimer = setInterval(() => onMessage({ type: 'poll' }), 5000);
      };
    } catch {
      pollTimer = setInterval(() => onMessage({ type: 'poll' }), 5000);
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [onMessage]);
}
