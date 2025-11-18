import { useEffect, useRef, useState } from "react";
import { getActivity, getActivityStreamUrl, ActivityEvent, ActivityState } from "@/lib/api";

interface ActivityFeedProps {
  isLoading?: boolean;
  sessionId?: string;
}

export const ActivityFeed = ({ isLoading = false, sessionId }: ActivityFeedProps) => {
  const [activity, setActivity] = useState<ActivityState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOnce = async () => {
      try {
        const data = await getActivity(sessionId);
        if (!mounted) return;
        setActivity(data);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to fetch activity");
      }
    };

    // Always fetch once on mount or when loading state toggles
    fetchOnce();

    // Start SSE if we have a session
    if (sessionId) {
      const url = getActivityStreamUrl(sessionId);
      const es = new EventSource(url);
      sseRef.current = es;
      es.onmessage = async (evt) => {
        // On each event, refresh snapshot to keep UI in sync
        await fetchOnce();
      };
      es.onerror = () => {
        // Fallback to polling if SSE fails
        if (!timerRef.current) {
          timerRef.current = window.setInterval(fetchOnce, 1000);
        }
      };
    }

    // Poll while research is in progress (lighter 1000ms)
    if (isLoading && !timerRef.current) {
      timerRef.current = window.setInterval(fetchOnce, 1000);
    }

    return () => {
      mounted = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [isLoading, sessionId]);

  if (error) {
    return <p className="sidebar-empty">{error}</p>;
  }

  if (!activity) {
    return <p className="sidebar-empty">No research activity yet</p>;
  }

  const statusLabel = activity.status === "complete" ? "Complete" : activity.status.charAt(0).toUpperCase() + activity.status.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{activity.query || "No query"}</p>
          <p className="text-xs text-muted-foreground">Status: {statusLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Total sources</p>
          <p className="text-xs text-muted-foreground">{activity.total_sources}</p>
        </div>
      </div>

      {/* Subagent status */}
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(activity.subagents || {}).map(([id, info]) => (
          <div key={id} className="rounded-xl p-3 bg-card neu-surface neu-raised">
            <p className="text-sm font-medium">Subagent {id}</p>
            <p className="text-xs text-muted-foreground">{info.search_focus || ""}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{info.status || ""}</span>
              <span>
                {info.sources ?? 0}/{info.requested ?? ""} sources
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div>
        <p className="text-sm font-medium mb-2">Activity</p>
        <ul className="space-y-2">
          {(activity.events || []).slice(-30).reverse().map((evt: ActivityEvent, idx: number) => (
            <li key={`${evt.timestamp}-${idx}`} className="rounded-xl p-2 bg-card neu-surface neu-raised">
              <p className="text-xs">
                <span className="text-muted-foreground">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                <span className="mx-2">•</span>
                <span>{evt.message}</span>
              </p>
              {evt.data?.title && (
                <p className="text-[11px] text-muted-foreground mt-1">{evt.data.title}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};