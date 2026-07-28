import { useEffect, useRef } from 'react';

export function useRealtime(onMessage) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;
  const wsRef = useRef(null);

  useEffect(() => {
    let pollTimer = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try { cbRef.current(JSON.parse(event.data)); } catch {}
      };
      ws.onerror = () => {
        if (!pollTimer) pollTimer = setInterval(() => cbRef.current({ type: 'poll' }), 5000);
      };
      ws.onclose = () => {
        if (!pollTimer) pollTimer = setInterval(() => cbRef.current({ type: 'poll' }), 5000);
      };
    } catch {
      pollTimer = setInterval(() => cbRef.current({ type: 'poll' }), 5000);
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);
}
