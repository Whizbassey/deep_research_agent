import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";

type Source = {
  title: string;
  content: string;
  url?: string;
};

type Tab = "activity" | "sources" | "settings";

interface SidebarProps {
  sources?: Source[];
  isLoading?: boolean;
  sessionId?: string;
}

export const Sidebar = ({ sources = [], isLoading = false, sessionId }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        
        <button
          onClick={() => setActiveTab("sources")}
          className={`sidebar-tab ${activeTab === "sources" ? "active" : ""}`}
        >
          Sources
        </button>
        
        <button
          onClick={() => setActiveTab("activity")}
          className={`sidebar-tab ${activeTab === "activity" ? "active" : ""}`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`sidebar-tab ${activeTab === "settings" ? "active" : ""}`}
        >
          Settings
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === "activity" && (
          <ActivityFeed isLoading={isLoading} sessionId={sessionId} />
        )}
        {activeTab === "sources" && (
          sources.length === 0 ? (
            <p className="sidebar-empty">No sources yet</p>
          ) : (
            <div className="p-2 space-y-2">
              <p className="text-sm text-muted-foreground">Total Sources: {sources.length}</p>
              <ul className="space-y-2">
                {sources.map((src, idx) => (
                  <li key={idx} className="rounded border p-2">
                    <p className="font-medium text-sm">
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {src.title}
                        </a>
                      ) : (
                        src.title
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{src.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        {activeTab === "settings" && (
          <p className="sidebar-empty">Settings</p>
        )}
      </div>
    </aside>
  );
};
