import os

class LLMProcessor:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key:
            try:
                # Import OpenAI
                from openai import OpenAI
                
                # Try initializing with just API key (most compatible)
                self.client = OpenAI(api_key=self.api_key)
                print("✅ OpenAI client initialized")
                
            except ImportError:
                print("⚠️ OpenAI library not installed. Run: pip install openai")
            except Exception as e:
                # If initialization fails for any reason, disable LLM
                print(f"⚠️ OpenAI initialization failed: {type(e).__name__}")
                print(f"💡 LLM refinement will use basic text cleanup instead")
                self.client = None
        else:
            print("ℹ️  OPENAI_API_KEY not set - using basic text refinement")
    
    def is_configured(self):
        return self.client is not None
    
    def refine_text(self, raw_text: str):
        """Refine raw sign language text into proper sentences"""
        if not raw_text or len(raw_text.strip()) == 0:
            return ""
        
        # Always do basic refinement first as fallback
        basic_refined = self._basic_refinement(raw_text)
        
        # If OpenAI is configured, try to enhance further
        if self.is_configured():
            try:
                return self._llm_refinement(raw_text)
            except Exception as e:
                print(f"⚠️ LLM refinement failed: {e}")
                print(f"📝 Using basic refinement instead")
                return basic_refined
        
        return basic_refined
    
    def _llm_refinement(self, text: str):
        """Use OpenAI to refine text"""
        prompt = f"""You are a sign language interpreter assistant. 
The following text is from sign language detection where each letter was detected separately.
The user has signed: "{text}"

Convert this into a proper, grammatically correct sentence:
- Correct common abbreviations (HLO → Hello, U → You, THX → Thanks, R → Are)
- Fix spelling errors
- Add proper punctuation
- Make it natural English
- Keep the original meaning

Return only the refined sentence, nothing else."""
        
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
        print(f"✅ LLM refined: '{text}' → '{refined}'")
        return refined
    
    def _basic_refinement(self, text: str):
        """Basic text refinement without LLM"""
        refined = text.strip()
        
        if not refined:
            return ""
        
        # Common abbreviation corrections
        replacements = {
            'HLO': 'Hello',
            'THX': 'Thanks', 
            'THNKS': 'Thanks',
            'PLS': 'Please',
            'PLSE': 'Please',
            'U': 'You',
            'R': 'Are',
            'Y': 'Why',
            'HOW R U': 'How are you',
            'WHTS UP': "What's up",
            'GD': 'Good',
            'BYE': 'Goodbye',
        }
        
        # Apply replacements (whole word, case-insensitive)
        words = refined.split()
        new_words = []
        for word in words:
            upper_word = word.upper()
            if upper_word in replacements: 
                new_words.append(replacements[upper_word])
            else:
                new_words.append(word)
        refined = ' '.join(new_words)
        
        # Capitalize first letter
        if refined:
            refined = refined[0].upper() + refined[1:] if len(refined) > 1 else refined.upper()
        
        # Add period if not present
        if refined and not refined.endswith(('.', '!', '?')):
            refined += '.'
        
        return refined