import { useEffect } from "react";

export function useSSE(onRefresh) {
  useEffect(() => {
    const es = new EventSource("/api/stream");

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "refresh") onRefresh(msg);
      } catch (_) {}
    };

    es.onerror = () => {
      // SSE auto-reconnects — no manual handling needed
    };

    return () => es.close();
  // onRefresh reference is stable per component render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
