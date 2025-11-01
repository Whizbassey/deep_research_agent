import { Card } from "@/components/ui/card";
import { FileText, Users, Database } from "lucide-react";

interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
}

interface ResearchResultsProps {
  data: ResearchData | null;
}

export const ResearchResults = ({ data }: ResearchResultsProps) => {
  if (!data) return null;

  return (
    <div className="results-container">
      <div className="results-grid">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="stat-label">Query</p>
              <p className="stat-value truncate">{data.query}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="stat-label">Subagents</p>
              <p className="stat-value">{data.subagents}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="stat-label">Total Sources</p>
              <p className="stat-value">{data.total_sources}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="synthesis-card">
        <h3 className="synthesis-title">
          Research Synthesis
        </h3>
        <div className="prose prose-slate max-w-none">
          <p className="synthesis-content">
            {data.synthesis}
          </p>
        </div>
      </Card>
    </div>
  );
};
