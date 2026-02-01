import { Card } from "@/components/ui/card";
import { FileText, Users, Database, Brain, Target, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface ComplexityAnalysis {
  complexity_score: number;
  num_subagents: number;
  explanation: string;
  estimated_sources: number;
}

interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  complexity_analysis?: ComplexityAnalysis;
  model?: string;
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

      {/* Stats and Complexity Analysis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.model && (
          <Card>
            <div className="stat-card-content p-4">
              <div className="stat-icon-wrapper bg-green-500/10">
                <Cpu className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="stat-label">AI Model</p>
                <p className="stat-value text-sm">{data.model}</p>
              </div>
            </div>
          </Card>
        )}

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

        {data.complexity_analysis && (
          <>
            <Card>
              <div className="stat-card-content p-4">
                <div className="stat-icon-wrapper bg-purple-500/10">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="stat-label">Complexity</p>
                  <p className="stat-value">{data.complexity_analysis.complexity_score}/5</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stat-card-content p-4">
                <div className="stat-icon-wrapper bg-orange-500/10">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="stat-label">Est. Sources</p>
                  <p className="stat-value">{data.complexity_analysis.estimated_sources}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Complexity Explanation */}
      {data.complexity_analysis && (
        <Card className="bg-muted/50">
          <div className="p-4">
            <p className="text-sm font-medium mb-1">Query Analysis</p>
            <p className="text-sm text-muted-foreground">{data.complexity_analysis.explanation}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Allocated {data.complexity_analysis.num_subagents} subagents for optimal coverage
            </p>
          </div>
        </Card>
      )}

      {/* Synthesis section */}
      <Card className="synthesis-card">
        <h3 className="synthesis-title">Research Synthesis</h3>
        <div className="prose prose-slate max-w-none p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {data.synthesis}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};
