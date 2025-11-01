"""
Search service using Exa API.
Handles web searching and content retrieval.
"""
from exa_py import Exa
from config.settings import Settings

class SearchService:
    """Manages web search operations using Exa"""
    
    def __init__(self):
        """Initialize Exa client with API key"""
        self.client = Exa(api_key=Settings.EXA_API_KEY)
        print("✅ Search service initialized")
    
    def search(self, query: str, num_results: int = None) -> list:
        """
        Search the web using Exa.
        
        Args:
            query: Search query string
            num_results: Number of results to return (default from settings)
            
        Returns:
            List of search results with title and text content
        """
        if num_results is None:
            num_results = Settings.DEFAULT_SEARCH_RESULTS
        
        try:
            result = self.client.search_and_contents(
                query,
                type="auto",
                num_results=num_results,
                text={"max_characters": Settings.MAX_CHARACTERS_PER_RESULT}
            )
            return result.results
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []