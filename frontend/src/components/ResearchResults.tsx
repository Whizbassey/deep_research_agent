import { Card } from "@/components/ui/card";
import { FileText, Users, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="results-container space-y-6">
      {/* Wide query container */}
      <Card className="w-full">
        <div className="flex items-start gap-4 p-4">
          <div className="stat-icon-wrapper bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="stat-label">Query</p>
            <p className="stat-value break-words">{data.query}</p>
          </div>
        </div>
      </Card>

      {/* Subagents and total sources below */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="stat-card-content p-4">
            <div className="stat-icon-wrapper bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="stat-label">Subagents</p>
              <p className="stat-value">{data.subagents}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-card-content p-4">
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

      {/* Synthesis section */}
      <Card className="synthesis-card">
        <h3 className="synthesis-title">Research Synthesis</h3>
        <div className="prose prose-slate max-w-none p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.synthesis}</ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};
