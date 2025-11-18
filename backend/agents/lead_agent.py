"""
Lead agent for orchestrating multi-agent research.
Plans, delegates, and synthesizes research findings.
"""
from services.ai_service import AIService
from agents.sub_agent import SubAgent
from utils.prompts import Prompts
from utils.activity import activity_manager

class LeadAgent:
    """Orchestrates research across multiple subagents"""
    
    def __init__(self, ai_service: AIService, sub_agent: SubAgent):
        self.ai_service = ai_service
        self.sub_agent = sub_agent
    
    def research(self, query: str, num_results_per_agent: int = 2, silent: bool = False, session_id: str | None = None) -> dict:
        """
        Conduct multi-agent research on a query.
        
        Args:
            query: Research question or topic
            num_results_per_agent: Number of search results to gather per subagent
            silent: If True, suppress console output (for API usage)
        """
        # Initialize activity for session
        logger = activity_manager.get(session_id)
        logger.reset(query)
        logger.log(f"Multi-Agent Research: {query}", type="start")
        if not silent:
            print(f"🤖 Multi-Agent Research: {query}")
            print("-" * 50)
        
        # Step 1: Plan and delegate
        logger.set_status("planning")
        logger.log("LEAD AGENT: Planning and delegating...")
        if not silent:
            print("👨‍💼 LEAD AGENT: Planning and delegating...")
        
        plan = self.ai_service.ask(Prompts.delegation_prompt(query))
        
        logger.log("Subtasks defined and delegated", data={"plan_length": len(plan)})
        if not silent:
            print("  ✓ Subtasks defined and delegated")
        
        # Step 2: Execute parallel research
        logger.set_status("executing")
        logger.log("SUBAGENTS: Working in parallel...")
        if not silent:
            print("\n🔍 SUBAGENTS: Working in parallel...")
        
        subtask_searches = [
            f"{query} fundamentals principles",
            f"{query} latest developments",
            f"{query} applications real world"
        ]
        
        subagent_results = []
        for i, search_term in enumerate(subtask_searches, 1):
            logger.update_subagent(i, status="started", search_focus=search_term)
            result = self.sub_agent.research(i, search_term, num_results=num_results_per_agent, silent=silent, session_id=session_id)
            subagent_results.append(result)
            logger.update_subagent(i, status="completed", sources=len(result.get("sources", [])))
            logger.add_sources(len(result.get("sources", [])))
        
        total_sources = sum(len(r["sources"]) for r in subagent_results)
        
        logger.log("Combined sources across agents", data={"total_sources": total_sources, "agents": len(subagent_results)})
        if not silent:
            print(f"  📊 Combined: {total_sources} sources from {len(subagent_results)} agents")
        
        # Step 3: Synthesize findings
        logger.set_status("synthesizing")
        logger.log("LEAD AGENT: Synthesizing parallel findings...")
        if not silent:
            print("\n👨‍💼 LEAD AGENT: Synthesizing parallel findings...")
        
        synthesis_prompt = Prompts.synthesis_prompt(query, subagent_results, total_sources)
        final_synthesis = self.ai_service.ask(synthesis_prompt)
        
        logger.set_status("complete")
        logger.log("MULTI-AGENT RESEARCH COMPLETE", type="complete")
        logger.complete()
        if not silent:
            print("\n" + "=" * 50)
            print("🎯 MULTI-AGENT RESEARCH COMPLETE")
            print("=" * 50)
            print(final_synthesis)
        
        return {
            "query": query,
            "subagents": len(subagent_results),
            "total_sources": total_sources,
            "synthesis": final_synthesis,
            "subagent_results": subagent_results  # Include for frontend
        }