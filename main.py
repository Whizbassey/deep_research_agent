"""
Main entry point for the AI agent research system.
Initializes services and runs multi-agent research.
"""
from services.search_service import SearchService
from services.ai_service import AIService
from agents.sub_agent import SubAgent
from agents.lead_agent import LeadAgent

def main():
    """Initialize and run the multi-agent research system"""
    
    print("🚀 Initializing AI Agent Research System...")
    print("=" * 50)
    
    # Initialize services
    search_service = SearchService()
    ai_service = AIService()
    
    # Initialize agents
    sub_agent = SubAgent(search_service)
    lead_agent = LeadAgent(ai_service, sub_agent)
    
    print("✅ All systems ready!\n")
    
    # Run research
    result = lead_agent.research("Best Agentic AI Framework")
    
    # Display results
    print("\n" + "🤖" * 30)
    print("RESEARCH SUMMARY")
    print("🤖" * 30)
    print(f"Query: {result['query']}")
    print(f"Subagents deployed: {result['subagents']}")
    print(f"Total sources: {result['total_sources']}")
    
    print("\n💡 Try other queries:")
    print("lead_agent.research('quantum computing commercial applications')")
    print("lead_agent.research('artificial intelligence safety frameworks')")

if __name__ == "__main__":
    main()