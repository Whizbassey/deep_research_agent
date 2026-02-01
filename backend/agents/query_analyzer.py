"""
Query Analyzer for dynamic subagent allocation.
Analyzes query complexity and determines optimal research strategy.
"""

from typing import List, Dict, Any, Optional
from services.ai_service import AIService
import json


class QueryAnalyzer:
    """Analyzes research queries to determine complexity and optimal strategy"""

    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    def analyze(self, query: str, model: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze query complexity and determine research strategy.

        Returns:
            Dictionary with:
            - complexity_score: 1-5 (1=simple, 5=very complex)
            - num_subagents: 2-6 based on complexity
            - subtasks: List of specific research angles
            - explanation: Why this allocation was chosen
            - estimated_sources: Estimated total sources needed
        """
        analysis_prompt = f"""Analyze this research query and determine the optimal multi-agent research strategy.

Query: "{query}"

Provide a JSON response with the following structure:
{{
    "complexity_score": <1-5>,
    "num_subagents": <2-6>,
    "subtasks": [
        {{"id": 1, "focus": "specific research angle 1", "rationale": "why this angle matters"}},
        {{"id": 2, "focus": "specific research angle 2", "rationale": "why this angle matters"}},
        ...
    ],
    "explanation": "Brief explanation of why this allocation was chosen",
    "estimated_sources": <estimated number of sources needed (6-30)>
}}

Guidelines:
- complexity_score 1-2: Simple, straightforward topics (2-3 subagents)
- complexity_score 3: Moderate topics requiring multiple perspectives (3-4 subagents)
- complexity_score 4-5: Complex, multi-faceted topics needing deep analysis (5-6 subagents)

Each subtask should be distinct, specific, and non-overlapping.
Ensure subtasks cover different aspects: fundamentals, current state, applications, challenges, future trends, comparisons, etc."""

        try:
            response = self.ai_service.ask(
                analysis_prompt, max_tokens=1500, temperature=0.2, model=model
            )

            # Extract JSON from response (handle potential markdown code blocks)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()

            analysis = json.loads(json_str)

            # Validate and clamp values
            analysis["complexity_score"] = max(
                1, min(5, analysis.get("complexity_score", 3))
            )
            analysis["num_subagents"] = max(2, min(6, analysis.get("num_subagents", 3)))
            analysis["estimated_sources"] = max(
                6, min(30, analysis.get("estimated_sources", 15))
            )

            # Ensure subtasks match num_subagents
            if len(analysis.get("subtasks", [])) != analysis["num_subagents"]:
                # Generate default subtasks if mismatch
                analysis["subtasks"] = self._generate_default_subtasks(
                    query, analysis["num_subagents"]
                )

            return analysis

        except Exception as e:
            # Fallback to moderate complexity if analysis fails
            return {
                "complexity_score": 3,
                "num_subagents": 3,
                "subtasks": self._generate_default_subtasks(query, 3),
                "explanation": f"Default allocation applied (analysis error: {str(e)}). Standard 3-agent approach for balanced coverage.",
                "estimated_sources": 15,
            }

    def _generate_default_subtasks(
        self, query: str, num_subagents: int
    ) -> List[Dict[str, str]]:
        """Generate default subtasks when AI analysis fails"""
        defaults = {
            2: [
                {
                    "id": 1,
                    "focus": f"{query} fundamentals and core concepts",
                    "rationale": "Establish foundational understanding",
                },
                {
                    "id": 2,
                    "focus": f"{query} applications and real-world use",
                    "rationale": "Explore practical implementations",
                },
            ],
            3: [
                {
                    "id": 1,
                    "focus": f"{query} fundamentals and principles",
                    "rationale": "Build foundational knowledge",
                },
                {
                    "id": 2,
                    "focus": f"{query} latest developments and trends",
                    "rationale": "Understand current state",
                },
                {
                    "id": 3,
                    "focus": f"{query} applications and implications",
                    "rationale": "Explore real-world impact",
                },
            ],
            4: [
                {
                    "id": 1,
                    "focus": f"{query} core concepts and fundamentals",
                    "rationale": "Establish base understanding",
                },
                {
                    "id": 2,
                    "focus": f"{query} current implementations and tools",
                    "rationale": "Review existing solutions",
                },
                {
                    "id": 3,
                    "focus": f"{query} challenges and limitations",
                    "rationale": "Identify pain points",
                },
                {
                    "id": 4,
                    "focus": f"{query} future outlook and innovations",
                    "rationale": "Explore emerging trends",
                },
            ],
            5: [
                {
                    "id": 1,
                    "focus": f"{query} foundational theory and history",
                    "rationale": "Historical context and basics",
                },
                {
                    "id": 2,
                    "focus": f"{query} technical architecture and mechanics",
                    "rationale": "Understand how it works",
                },
                {
                    "id": 3,
                    "focus": f"{query} current market leaders and solutions",
                    "rationale": "Review competitive landscape",
                },
                {
                    "id": 4,
                    "focus": f"{query} use cases and success stories",
                    "rationale": "Real-world applications",
                },
                {
                    "id": 5,
                    "focus": f"{query} future developments and roadmap",
                    "rationale": "What's coming next",
                },
            ],
            6: [
                {
                    "id": 1,
                    "focus": f"{query} fundamental concepts and definitions",
                    "rationale": "Build vocabulary and basics",
                },
                {
                    "id": 2,
                    "focus": f"{query} technical implementation details",
                    "rationale": "Deep technical dive",
                },
                {
                    "id": 3,
                    "focus": f"{query} industry adoption and case studies",
                    "rationale": "Market validation",
                },
                {
                    "id": 4,
                    "focus": f"{query} comparison with alternatives",
                    "rationale": "Competitive analysis",
                },
                {
                    "id": 5,
                    "focus": f"{query} challenges, risks, and ethics",
                    "rationale": "Critical evaluation",
                },
                {
                    "id": 6,
                    "focus": f"{query} future trajectory and predictions",
                    "rationale": "Forward-looking insights",
                },
            ],
        }

        return defaults.get(num_subagents, defaults[3])
