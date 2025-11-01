"""
Lead agent for orchestrating multi-agent research.
Plans, delegates, and synthesizes research findings.
"""
from services.ai_service import AIService
from agents.sub_agent import SubAgent
from utils.prompts import Prompts

class LeadAgent:
    """Orchestrates research across multiple subagents"""
    
    def __init__(self, ai_service: AIService, sub_agent: SubAgent):
        """
        Initialize lead agent.
        
        Args:
            ai_service: AI service for generating plans and synthesis
            sub_agent: Subagent instance for delegating research tasks
        """
        self.ai_service = ai_service
        self.sub_agent = sub_agent
    
    def research(self, query: str) -> dict:
        """
        Conduct multi-agent research on a query.
        
        Args:
            query: Research question or topic
            
        Returns:
            Dictionary containing complete research results
        """
        print(f"🤖 Multi-Agent Research: {query}")
        print("-" * 50)
        
        # Step 1: Plan and delegate
        print("👨‍💼 LEAD AGENT: Planning and delegating...")
        plan = self.ai_service.ask(Prompts.delegation_prompt(query))
        print("  ✓ Subtasks defined and delegated")
        
        # Step 2: Execute parallel research (simulated)
        print("\n🔍 SUBAGENTS: Working in parallel...")
        
        subtask_searches = [
            f"{query} fundamentals principles",
            f"{query} latest developments",
            f"{query} applications real world"
        ]
        
        subagent_results = []
        for i, search_term in enumerate(subtask_searches, 1):
            result = self.sub_agent.research(i, search_term)
            subagent_results.append(result)
        
        total_sources = sum(len(r["sources"]) for r in subagent_results)
        print(f"  📊 Combined: {total_sources} sources from {len(subagent_results)} agents")
        
        # Step 3: Synthesize findings
        print("\n👨‍💼 LEAD AGENT: Synthesizing parallel findings...")
        synthesis_prompt = Prompts.synthesis_prompt(query, subagent_results, total_sources)
        final_synthesis = self.ai_service.ask(synthesis_prompt)
        
        print("\n" + "=" * 50)
        print("🎯 MULTI-AGENT RESEARCH COMPLETE")
        print("=" * 50)
        print(final_synthesis)
        
        return {
            "query": query,
            "subagents": len(subagent_results),
            "total_sources": total_sources,
            "synthesis": final_synthesis
        }