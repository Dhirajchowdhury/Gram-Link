"""
RAG (Retrieval-Augmented Generation) Service for GramLink AI
Handles intelligent scheme search using Google Gemini and ChromaDB
"""
import os
import json
from typing import List, Dict
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

class RAGService:
    def __init__(self, gemini_api_key: str):
        self.gemini_api_key = gemini_api_key
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vector_store = None
        self.llm = None
        self.schemes_data = []
        
    def load_schemes(self, schemes_file_path: str):
        """Load government schemes from JSON file"""
        with open(schemes_file_path, 'r', encoding='utf-8') as f:
            self.schemes_data = json.load(f)
        print(f"✅ Loaded {len(self.schemes_data)} schemes")
        
    def create_vector_store(self):
        """Create vector store from schemes data"""
        documents = []
        
        for scheme in self.schemes_data:
            # Create comprehensive text for each scheme
            scheme_text = f"""
Scheme: {scheme['name']}
ID: {scheme['id']}
Category: {scheme['category']}
Description: {scheme['description']}
Benefit: {scheme['benefit']}
Eligibility: {json.dumps(scheme['eligibility'], indent=2)}
Required Documents: {', '.join(scheme['documents'])}
Application Process: {scheme['application_process']}
Helpline: {scheme['helpline']}
Website: {scheme['website']}
Coverage: {scheme['states']}
"""
            
            doc = Document(
                page_content=scheme_text,
                metadata={
                    "scheme_id": scheme['id'],
                    "scheme_name": scheme['name'],
                    "category": scheme['category']
                }
            )
            documents.append(doc)
        
        # Create vector store
        self.vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory="./chroma_db"
        )
        print("✅ Vector store created successfully!")
        
    def initialize_llm(self):
        """Initialize Google Gemini LLM"""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=self.gemini_api_key,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        print("✅ Gemini LLM initialized successfully!")
        
    def query(self, question: str, user_profile: Dict = None, language: str = "en") -> Dict:
        """Query the RAG system with improved search and language support"""
        try:
            # Language instructions
            language_instructions = {
                "en": "Respond in English.",
                "hi": "हिंदी में जवाब दें। (Respond in Hindi)",
                "bn": "বাংলায় উত্তর দিন। (Respond in Bengali)"
            }
            
            lang_instruction = language_instructions.get(language, language_instructions["en"])
            
            # Enhance question with user profile if available
            profile_context = ""
            if user_profile:
                profile_context = f"""
User Profile:
- Age: {user_profile.get('age', 'N/A')}
- Gender: {user_profile.get('gender', 'N/A')}
- State: {user_profile.get('state', 'N/A')}
- Occupation: {user_profile.get('occupation', 'N/A')}
"""
                enhanced_question = f"{profile_context}\nQuestion: {question}"
            else:
                enhanced_question = question
                
            # Search for relevant schemes with higher k for better results
            docs = self.vector_store.similarity_search(enhanced_question, k=8)
            
            # Extract context from documents
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Improved prompt with better instructions and language support
            prompt = ChatPromptTemplate.from_template("""You are GramLink AI, a friendly and knowledgeable assistant helping Indian citizens discover government schemes.

{profile_context}

Available Schemes Information:
{context}

User Question: {question}

IMPORTANT: {lang_instruction}

Instructions:
1. Provide a warm, conversational response in the specified language
2. List 2-3 most relevant schemes with clear benefits
3. Explain eligibility in simple terms (avoid jargon)
4. Mention key documents needed
5. Add helpline numbers for easy access
6. If asking about a specific scheme, provide detailed information
7. If no exact match, suggest the closest relevant schemes
8. Keep response concise but informative (max 200 words)
9. End with an encouraging note
10. MUST respond in the language specified above

Response:""")
            
            # Create chain
            chain = (
                {
                    "profile_context": lambda x: profile_context,
                    "context": lambda x: context,
                    "question": RunnablePassthrough(),
                    "lang_instruction": lambda x: lang_instruction
                }
                | prompt
                | self.llm
                | StrOutputParser()
            )
            
            # Get response
            answer = chain.invoke(question)
            
            # Extract scheme IDs from source documents
            scheme_ids = []
            for doc in docs:
                scheme_id = doc.metadata.get('scheme_id')
                if scheme_id and scheme_id not in scheme_ids:
                    scheme_ids.append(scheme_id)
            
            # Get full scheme details and calculate relevance scores
            schemes = []
            for scheme_id in scheme_ids:
                scheme = self.get_scheme_by_id(scheme_id)
                if scheme:
                    # Add relevance score based on user profile
                    score = self._calculate_relevance_score(scheme, user_profile, question)
                    scheme_copy = scheme.copy()
                    scheme_copy['score'] = score
                    schemes.append(scheme_copy)
            
            # Sort by relevance score
            schemes.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            return {
                "answer": answer,
                "schemes": schemes[:5],  # Top 5 schemes
                "schemes_count": len(schemes)
            }
        except Exception as e:
            # Enhanced fallback with better formatting
            print(f"⚠️ Gemini error, using enhanced fallback: {e}")
            docs = self.vector_store.similarity_search(question, k=8)
            
            scheme_ids = []
            for doc in docs:
                scheme_id = doc.metadata.get('scheme_id')
                if scheme_id and scheme_id not in scheme_ids:
                    scheme_ids.append(scheme_id)
            
            schemes = []
            for scheme_id in scheme_ids:
                scheme = self.get_scheme_by_id(scheme_id)
                if scheme:
                    score = self._calculate_relevance_score(scheme, user_profile, question)
                    scheme_copy = scheme.copy()
                    scheme_copy['score'] = score
                    schemes.append(scheme_copy)
            
            schemes.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            # Generate better fallback response
            if schemes:
                answer = f"🎯 Found {len(schemes)} schemes matching your query!\n\n"
                for i, scheme in enumerate(schemes[:3], 1):
                    answer += f"{i}. {scheme['name']}\n"
                    answer += f"   💰 Benefit: {scheme['benefit']}\n"
                    answer += f"   📋 Category: {scheme['category']}\n"
                    if scheme.get('score', 0) > 70:
                        answer += f"   ✅ {scheme['score']}% match for you!\n"
                    answer += "\n"
                answer += "Tap on any scheme to see full details and apply!"
            else:
                answer = "I couldn't find exact matches, but let me show you some popular schemes that might interest you."
            
            return {
                "answer": answer,
                "schemes": schemes[:5],
                "schemes_count": len(schemes)
            }
    
    def _calculate_relevance_score(self, scheme: Dict, user_profile: Dict, query: str) -> int:
        """Calculate relevance score based on user profile and query"""
        score = 50  # Base score
        
        if not user_profile:
            return score
        
        eligibility = scheme.get('eligibility', {})
        
        # Check occupation match
        if user_profile.get('occupation'):
            occupation = user_profile['occupation'].lower()
            if isinstance(eligibility.get('occupation'), list):
                for occ in eligibility['occupation']:
                    if occupation in occ.lower():
                        score += 20
                        break
        
        # Check gender match
        if user_profile.get('gender'):
            gender = user_profile['gender'].lower()
            scheme_gender = str(eligibility.get('gender', 'all')).lower()
            if 'all' in scheme_gender or gender in scheme_gender:
                score += 10
        
        # Check age match
        if user_profile.get('age'):
            age = int(user_profile['age'])
            age_req = str(eligibility.get('age', '18+'))
            if '+' in age_req:
                min_age = int(age_req.replace('+', ''))
                if age >= min_age:
                    score += 15
        
        # Check state match
        if user_profile.get('state'):
            state = user_profile['state'].lower()
            scheme_states = str(scheme.get('states', 'all india')).lower()
            if 'all' in scheme_states or state in scheme_states:
                score += 10
        
        # Query keyword matching
        query_lower = query.lower()
        scheme_text = f"{scheme['name']} {scheme['description']} {scheme['category']}".lower()
        
        keywords = query_lower.split()
        matches = sum(1 for keyword in keywords if len(keyword) > 3 and keyword in scheme_text)
        score += min(matches * 5, 20)
        
        return min(score, 99)  # Cap at 99%
    
    def get_scheme_by_id(self, scheme_id: str) -> Dict:
        """Get full scheme details by ID"""
        for scheme in self.schemes_data:
            if scheme['id'] == scheme_id:
                return scheme
        return None
    
    def search_schemes(self, query: str, limit: int = 10) -> List[Dict]:
        """Simple search through schemes"""
        if not self.vector_store:
            return []
            
        docs = self.vector_store.similarity_search(query, k=limit)
        scheme_ids = [doc.metadata['scheme_id'] for doc in docs]
        
        schemes = []
        for scheme_id in scheme_ids:
            scheme = self.get_scheme_by_id(scheme_id)
            if scheme:
                schemes.append(scheme)
                
        return schemes

# Global RAG service instance
rag_service = None

def initialize_rag(gemini_api_key: str, schemes_file: str):
    """Initialize RAG service with Gemini"""
    global rag_service
    rag_service = RAGService(gemini_api_key)
    rag_service.load_schemes(schemes_file)
    rag_service.create_vector_store()
    rag_service.initialize_llm()
    return rag_service

def get_rag_service():
    """Get RAG service instance"""
    return rag_service
