import { ArrowUpRight } from "lucide-react";

interface SuggestionCardsProps {
  onSelect: (query: string) => void;
}

const suggestions = [
  "What are the most promising approaches to fusion energy?",
  "What are the latest developments in quantum computing?",
  "How can AI help solve climate change challenges?",
];

export const SuggestionCards = ({ onSelect }: SuggestionCardsProps) => {
  return (
    <div className="suggestions-grid">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="suggestion-card group"
        >
          <div className="suggestion-card-content">
            <p className="suggestion-text">{suggestion}</p>
            <ArrowUpRight className="h-5 w-5 flex-shrink-0 suggestion-icon" />
          </div>
        </button>
      ))}
    </div>
  );
};
