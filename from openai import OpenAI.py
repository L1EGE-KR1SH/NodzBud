from openai import OpenAI
import os

class LLMProcessor:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key:
            try:
                # Initialize OpenAI client with minimal config
                self.client = OpenAI(
                    api_key=self.api_key,
                    timeout=30.0,
                    max_retries=2
                )
                print("✅ OpenAI client initialized")
            except TypeError as e:
                # Handle proxy-related errors
                if 'proxies' in str(e):
                    try:
                        # Try without extra arguments
                        self.client = OpenAI(api_key=self.api_key)
                        print("✅ OpenAI client initialized (basic config)")
                    except Exception as e2:
                        print(f"⚠️ OpenAI client error 1: {e2}")
                else:
                    print(f"⚠️ OpenAI client error 2: {e}")
            except Exception as e:
                print(f"⚠️ OpenAI client error 3: {e}")
        else:
            print("⚠️ OPENAI_API_KEY not found in environment")
    
    def is_configured(self):
        return self.client is not None
    
    def refine_text(self, raw_text: str):
        """Refine raw sign language text into proper sentences"""
        if not raw_text or len(raw_text.strip()) == 0:
            return ""
        
        if not self.is_configured():
            print("⚠️ OpenAI API key not configured, returning original text")
            # Basic fallback refinement
            return self._basic_refinement(raw_text)
        
        prompt = f"""You are a sign language interpreter assistant. 
The following text is from sign language detection where each letter was detected separately.
The user has signed: "{raw_text}"

Convert this into a proper, grammatically correct sentence:
- Correct common abbreviations (HLO → Hello, U → You, THX → Thanks, R → Are)
- Fix spelling errors
- Add proper punctuation
- Make it natural English
- Keep the original meaning

Return only the refined sentence, nothing else."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful sign language interpreter assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=150
            )
            
            refined = response.choices[0].message.content.strip()
            print(f"✅ LLM refined: '{raw_text}' → '{refined}'")
            return refined
            
        except Exception as e:
            print(f"❌ LLM error: {e}")
            return self._basic_refinement(raw_text)
    
    def _basic_refinement(self, text: str):
        """Basic text refinement without LLM"""
        refined = text.strip()
        
        if not refined:
            return ""
        
        # Capitalize first letter
        refined = refined[0].upper() + refined[1:] if len(refined) > 1 else refined.upper()
        
        # Remove extra spaces
        refined = ' '.join(refined.split())
        
        # Add period if not present
        if refined and not refined.endswith(('.', '!', '?')):
            refined += '.'
        
        return refined