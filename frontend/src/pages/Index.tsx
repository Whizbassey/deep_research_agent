import { useState, useEffect, useRef } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SuggestionCards } from "@/components/SuggestionCards";
import { Sidebar } from "@/components/Sidebar";
import { ResearchResults } from "@/components/ResearchResults";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { downloadResearchDocx } from "@/lib/pdf";
import { downloadResearchPDF } from "@/components/ResearchPDF";
import { getActivity, checkHealth, getActivityStreamUrl, performResearch } from "@/lib/api";
import { ChevronDown, Download, FileText, File } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Source {
  title: string;
  content: string;
  url?: string;
}

interface SubagentResult {
  subtask: number;
  search_focus: string;
  sources: Source[];
}

interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  subagent_results?: SubagentResult[];
  complexity_analysis?: {
    complexity_score: number;
    num_subagents: number;
    explanation: string;
    estimated_sources: number;
  };
  model?: string;
}

const Index = () => {
  const [results, setResults] = useState<ResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [activeAgents, setActiveAgents] = useState(0);
  const [rateLimit, setRateLimit] = useState({ remaining: 10, limit: 10 });
  const [selectedModel, setSelectedModel] = useState<string>("gpt-oss-120b");
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await checkHealth();
        setBackendConnected(true);
      } catch (error) {
        setBackendConnected(false);
        console.error("Backend not connected:", error);
      }
    };

    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stream activity updates during loading
  useEffect(() => {
    if (!isLoading || !sessionId) return;

    const eventSource = new EventSource(getActivityStreamUrl(sessionId));

    eventSource.onmessage = (event) => {
      try {
        const activity = JSON.parse(event.data);
        setProgress(activity.progress || 0);
        setActiveAgents(activity.total_subagents - activity.completed_subagents);
      } catch (e) {
        console.error('Failed to parse activity:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isLoading, sessionId]);

  const handleDownloadDocx = async () => {
    if (!results) {
      toast({
        title: "No Results",
        description: "Run a research query first to generate a document.",
        variant: "destructive",
      });
      return;
    }
    try {
      await downloadResearchDocx(results);
      toast({ title: "Document Downloaded", description: "Your research report has been saved as DOCX." });
    } catch (e) {
      toast({
        title: "Download Failed",
        description: e instanceof Error ? e.message : "Unable to generate document.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) {
      toast({
        title: "No Results",
        description: "Run a research query first to generate a document.",
        variant: "destructive",
      });
      return;
    }
    try {
      await downloadResearchPDF(results);
      toast({ title: "Document Downloaded", description: "Your research report has been saved as PDF." });
    } catch (e) {
      toast({
        title: "Download Failed",
        description: e instanceof Error ? e.message : "Unable to generate document.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (query: string, numResults: number) => {
    // Check if backend is connected
    if (backendConnected === false) {
      toast({
        title: "Backend Not Connected",
        description: "Please start the backend server first. Run 'python app.py' in the backend directory.",
        variant: "destructive",
      });
      return;
    }

    // RATE LIMITING - DISABLED IN DEVELOPMENT
    // Uncomment the block below when deploying to production
    /*
    if (rateLimit.remaining <= 0) {
      toast({
        title: "Rate Limit Exceeded",
        description: "You've reached the limit of 10 requests per hour. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    */

    setIsLoading(true);
    setResults(null);
    setCurrentQuery(query);
    setProgress(0);

    try {
      const data = await performResearch({
        query,
        num_results_per_agent: numResults,
        model: selectedModel,
      });

      setResults(data);
      setSessionId(data.session_id);
      setProgress(100);

      toast({
        title: "Research Complete",
        description: `Found ${data.total_sources} sources across ${data.subagents} agents`,
      });
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Failed to connect to the research API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (query: string) => {
    handleSearch(query, 2);
  };

  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Cognitia Deep Research</h2>
          {backendConnected === false && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded hidden sm:inline">
              ⚠️ Backend Offline
            </span>
          )}
          {backendConnected === true && (
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded hidden sm:inline">
              ● Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Rate limit display - disabled in development */}
          {/* <div className="text-xs text-muted-foreground hidden sm:block">
            {rateLimit.remaining}/{rateLimit.limit} requests left
          </div> */}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm" disabled={!results}>
                <Download className="mr-2 h-4 w-4" />
                Download
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadDocx}>
                <FileText className="mr-2 h-4 w-4" />
                Download as DOCX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <File className="mr-2 h-4 w-4" />
                Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="main-layout">
        <div className="content-area">
          {!isLoading && !results && (
            <div className="content-wrapper">
              <header className="page-header">
                <h1 className="page-title">Cognitia Deep Research</h1>
                <p className="page-subtitle">
                  AI-powered research that goes deeper than search
                </p>
              </header>

              <SuggestionCards onSelect={handleSuggestionSelect} />
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="content-wrapper">
              <div className="loading-container">
                <div className="loading-percentage">{progress}%</div>
                <div className="w-full max-w-md mx-auto mt-4">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="loading-query mt-4">Current query: "{currentQuery}"</p>
                <p className="loading-status">
                  {progress < 15 && "Analyzing query complexity..."}
                  {progress >= 15 && progress < 20 && "Planning research strategy..."}
                  {progress >= 20 && progress < 85 && `Agents Researching (${activeAgents} active)`}
                  {progress >= 85 && progress < 100 && "Synthesizing findings..."}
                  {progress >= 100 && "Finalizing results..."}
                </p>
              </div>
              <div className="mt-12 w-full max-w-4xl">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} initialQuery={currentQuery} />
              </div>
            </div>
          )}

          {results && (
            <div className="content-wrapper-results">
              <ResearchResults data={results} />
              <div className="mt-8 w-full max-w-4xl">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
        {(() => {
          const sources = (results?.subagent_results || []).flatMap((sr) => sr.sources) as Source[];
          return (
            <Sidebar
              sources={sources}
              isLoading={isLoading}
              sessionId={sessionId}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default Index;
