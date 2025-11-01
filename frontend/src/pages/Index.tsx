import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SuggestionCards } from "@/components/SuggestionCards";
import { Sidebar } from "@/components/Sidebar";
import { ResearchResults } from "@/components/ResearchResults";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
}

const Index = () => {
  const [results, setResults] = useState<ResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = async (query: string, numResults: number) => {
    setIsLoading(true);
    setResults(null);
    setCurrentQuery(query);

    try {
      const response = await fetch("http://localhost:8000/api/v1/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          num_results_per_agent: numResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      
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
        <h2 className="text-xl font-semibold text-foreground">Cerebras Deep Research</h2>
        <Button variant="outline" size="sm" className="text-sm">
          <span className="mr-2">●</span>
          Configure API Keys
        </Button>
      </nav>

      <div className="main-layout">
        <div className="content-area">
          {!isLoading && !results && (
            <div className="content-wrapper">
              <header className="page-header">
                <h1 className="page-title">Cerebras Deep Research</h1>
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
                <div className="loading-percentage">0%</div>
                <p className="loading-query">Current query: "{currentQuery}"</p>
                <p className="loading-status">Agents Researching (4 active)</p>
              </div>
              <div className="mt-12 w-full max-w-4xl">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} initialQuery={currentQuery} />
              </div>
            </div>
          )}

          {results && (
            <div className="content-wrapper">
              <ResearchResults data={results} />
              <div className="mt-8 w-full max-w-4xl">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
};

export default Index;
