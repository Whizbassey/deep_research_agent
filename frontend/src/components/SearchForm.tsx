import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string, numResults: number) => Promise<void>;
  isLoading: boolean;
  initialQuery?: string;
}

export const SearchForm = ({ onSearch, isLoading, initialQuery = "" }: SearchFormProps) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query, 2);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="What would you like to research?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="search-button"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};
