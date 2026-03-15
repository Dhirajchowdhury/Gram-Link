from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os

class RAGPipeline:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        self.vectorstore = None
        self.qa_chain = None
        
    def ingest_documents(self, documents):
        """Ingest and embed documents"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)
        
        self.vectorstore = Chroma.from_documents(
            documents=texts,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        self.vectorstore.persist()
        
    def load_vectorstore(self):
        """Load existing vectorstore"""
        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )
        
    def query(self, question, language="en"):
        """Query the RAG system"""
        if not self.vectorstore:
            self.load_vectorstore()
            
        # TODO: Add language-specific prompting
        llm = OpenAI(temperature=0.7)
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 3})
        )
        
        response = self.qa_chain.run(question)
        return response

if __name__ == "__main__":
    # Test the pipeline
    rag = RAGPipeline()
    print("RAG Pipeline initialized")
