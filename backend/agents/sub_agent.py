"""
Subagent for specialized research tasks.
Each subagent focuses on one aspect of the research.
"""
from services.search_service import SearchService
from utils.activity import activity_manager

class SubAgent:
    """Specialized research agent"""
    
    def __init__(self, search_service: SearchService):
        """
        Initialize subagent.
        
        Args:
            search_service: Search service instance for web searches
        """
        self.search_service = search_service
    
    def research(self, subtask_id: int, search_query: str, num_results: int = 2, silent: bool = False, session_id: str | None = None) -> dict:
        """
        Conduct research for a specific subtask.
        
        Args:
            subtask_id: ID number of this subtask
            search_query: What to search for
            num_results: Number of search results to gather
            silent: If True, suppress print statements
            
        Returns:
            Dictionary containing subtask results
        """
        logger = activity_manager.get(session_id)
        logger.log(f"Subagent {subtask_id}: Researching {search_query}", data={"subtask": subtask_id, "query": search_query})
        if not silent:
            print(f"  🤖 Subagent {subtask_id}: Researching {search_query}")
        
        # Search the web
        results = self.search_service.search(search_query, num_results)
        logger.update_subagent(subtask_id, status="searching", requested=num_results)
        
        # Process and filter results
        sources = []
        for idx, result in enumerate(results, start=1):
            # Extract URL if available in Exa result objects
            url = getattr(result, "url", None)
            # Include sources with any non-trivial text to improve visibility
            if result.text and len(result.text.strip()) > 30:
                snippet = result.text.strip()[:300]
                sources.append({
                    "title": result.title,
                    "content": snippet,
                    "url": url
                })
                # Per-result increment event
                logger.log(
                    "Source collected",
                    data={
                        "subtask": subtask_id,
                        "index": idx,
                        "title": result.title,
                        "has_url": bool(url),
                    },
                )
        logger.log("Subagent sources processed", data={"subtask": subtask_id, "sources": len(sources)})
        
        return {
            "subtask": subtask_id,
            "search_focus": search_query,
            "sources": sources
        }