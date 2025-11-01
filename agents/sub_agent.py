"""
Subagent for specialized research tasks.
Each subagent focuses on one aspect of the research.
"""
from services.search_service import SearchService

class SubAgent:
    """Specialized research agent"""
    
    def __init__(self, search_service: SearchService):
        """
        Initialize subagent.
        
        Args:
            search_service: Search service instance for web searches
        """
        self.search_service = search_service
    
    def research(self, subtask_id: int, search_query: str, num_results: int = 2) -> dict:
        """
        Conduct research for a specific subtask.
        
        Args:
            subtask_id: ID number of this subtask
            search_query: What to search for
            num_results: Number of search results to gather
            
        Returns:
            Dictionary containing subtask results
        """
        print(f"  🤖 Subagent {subtask_id}: Researching {search_query}")
        
        # Search the web
        results = self.search_service.search(search_query, num_results)
        
        # Process and filter results
        sources = []
        for result in results:
            if result.text and len(result.text) > 200:
                sources.append({
                    "title": result.title,
                    "content": result.text[:300]
                })
        
        return {
            "subtask": subtask_id,
            "search_focus": search_query,
            "sources": sources
        }