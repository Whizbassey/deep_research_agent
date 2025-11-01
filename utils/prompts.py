"""
Prompt templates for AI agents.
Centralized location for all prompt engineering.
"""

class Prompts:
    """Collection of prompt templates"""
    
    @staticmethod
    def delegation_prompt(query: str) -> str:
        """Prompt for lead agent to delegate tasks"""
        return f"""You are a Lead Research Agent. Break down this complex query into 3 specialized subtasks for parallel execution: "{query}"

For each subtask, provide:
- Clear objective
- Specific search focus
- Expected output

SUBTASK 1: [Core/foundational aspects]
SUBTASK 2: [Recent developments/trends]
SUBTASK 3: [Applications/implications]

Make each subtask distinct to avoid overlap."""
    
    @staticmethod
    def synthesis_prompt(query: str, subagent_results: list, total_sources: int) -> str:
        """Prompt for lead agent to synthesize findings"""
        
        # Build context from subagent results
        context = f"ORIGINAL QUERY: {query}\n\nSUBAGENT FINDINGS:\n"
        
        for result in subagent_results:
            context += f"\nSubagent {result['subtask']} ({result['search_focus']}):\n"
            for source in result['sources'][:2]:
                context += f"- {source['title']}: {source['content']}...\n"
        
        context += f"""

As the Lead Agent, synthesize these parallel findings into a comprehensive report:

EXECUTIVE SUMMARY:
[2-3 sentences covering the most important insights across all subagents]

INTEGRATED FINDINGS:
- [Key finding from foundational research]
- [Key finding from recent developments]
- [Key finding from applications research]
- [Cross-cutting insight that emerged]

RESEARCH QUALITY:
- Sources analyzed: {total_sources} across {len(subagent_results)} specialized agents
- Coverage: [How well the subtasks covered the topic]"""
        
        return context