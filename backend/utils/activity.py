"""
Activity logging for agent operations.
Supports per-session activity stores and snapshots for polling/SSE.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from threading import Lock
import uuid


@dataclass
class ActivityEvent:
    timestamp: str
    type: str
    message: str
    data: Dict[str, Any] = field(default_factory=dict)


class ActivityLogger:
    def __init__(self) -> None:
        self._lock = Lock()
        self.reset()

    def reset(self, query: Optional[str] = None) -> None:
        with self._lock:
            self.active: bool = True
            self.query: Optional[str] = query
            self.status: str = "starting"
            self.events: List[ActivityEvent] = []
            self.total_sources: int = 0
            self.subagents: Dict[int, Dict[str, Any]] = {}

    def complete(self) -> None:
        with self._lock:
            self.active = False
            self.status = "complete"

    def set_status(self, status: str) -> None:
        with self._lock:
            self.status = status

    def log(self, message: str, type: str = "info", data: Optional[Dict[str, Any]] = None) -> None:
        evt = ActivityEvent(
            timestamp=datetime.utcnow().isoformat() + "Z",
            type=type,
            message=message,
            data=data or {},
        )
        with self._lock:
            self.events.append(evt)

    def update_subagent(self, subtask_id: int, **kwargs: Any) -> None:
        with self._lock:
            entry = self.subagents.get(subtask_id, {})
            entry.update(kwargs)
            self.subagents[subtask_id] = entry

    def add_sources(self, count: int) -> None:
        with self._lock:
            self.total_sources += max(0, int(count))

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "active": self.active,
                "query": self.query,
                "status": self.status,
                "total_sources": self.total_sources,
                "subagents": self.subagents,
                "events": [
                    {
                        "timestamp": e.timestamp,
                        "type": e.type,
                        "message": e.message,
                        "data": e.data,
                    }
                    for e in self.events[-200:]  # cap to recent events
                ],
            }

class ActivityManager:
    """Manages multiple activity sessions keyed by a session_id."""
    def __init__(self) -> None:
        self._sessions: Dict[str, ActivityLogger] = {}
        self._lock = Lock()

    def create_session(self, query: Optional[str] = None) -> str:
        session_id = uuid.uuid4().hex
        logger = ActivityLogger()
        logger.reset(query)
        with self._lock:
            self._sessions[session_id] = logger
        return session_id

    def get(self, session_id: Optional[str]) -> ActivityLogger:
        if not session_id:
            # Fallback default session for backward compatibility
            with self._lock:
                if "default" not in self._sessions:
                    self._sessions["default"] = ActivityLogger()
            return self._sessions["default"]
        with self._lock:
            return self._sessions.setdefault(session_id, ActivityLogger())

    def snapshot(self, session_id: Optional[str]) -> Dict[str, Any]:
        return self.get(session_id).snapshot()

    def reset(self, session_id: Optional[str], query: Optional[str] = None) -> None:
        self.get(session_id).reset(query)


# Global activity manager
activity_manager = ActivityManager()