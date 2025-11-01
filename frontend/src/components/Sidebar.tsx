import { useState } from "react";

type Tab = "activity" | "sources" | "settings";

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          onClick={() => setActiveTab("activity")}
          className={`sidebar-tab ${activeTab === "activity" ? "active" : ""}`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`sidebar-tab ${activeTab === "sources" ? "active" : ""}`}
        >
          Sources
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
          <p className="sidebar-empty">No research activity yet</p>
        )}
        {activeTab === "sources" && (
          <p className="sidebar-empty">No sources yet</p>
        )}
        {activeTab === "settings" && (
          <p className="sidebar-empty">Settings</p>
        )}
      </div>
    </aside>
  );
};
