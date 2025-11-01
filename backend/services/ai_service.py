"""
AI service using Cerebras API.
Handles AI model interactions and completions.
"""
from cerebras.cloud.sdk import Cerebras
from config.settings import Settings

class AIService:
    """Manages AI model interactions using Cerebras"""
    
    def __init__(self):
        """Initialize Cerebras client with API key"""
        self.client = Cerebras(api_key=Settings.CEREBRAS_API_KEY)
        print("✅ AI service initialized")
    
    def ask(self, prompt: str, max_tokens: int = None, temperature: float = None) -> str:
        """
        Get AI response from Cerebras.
        
        Args:
            prompt: The prompt/question to send to AI
            max_tokens: Maximum response length (default from settings)
            temperature: Response randomness 0-1 (default from settings)
            
        Returns:
            AI-generated response text
        """
        if max_tokens is None:
            max_tokens = Settings.MAX_TOKENS
        if temperature is None:
            temperature = Settings.TEMPERATURE
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=Settings.AI_MODEL,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"❌ AI error: {e}")
            return ""