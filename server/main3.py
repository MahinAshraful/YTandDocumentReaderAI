from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import YoutubeLoader
from tenacity import retry, stop_after_attempt, wait_fixed
from sklearn.metrics.pairwise import cosine_similarity
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI
import numpy as np
import tiktoken
import time
import os
load_dotenv()
def perform_yt_rag(query, link):
    load_dotenv()
    def initialize_apis():
        pinecone_api_key = os.getenv('PINECONE_API_KEY')
        openai_api_key = os.getenv('OPENAI_API_KEY')
        os.environ['PINECONE_API_KEY'] = pinecone_api_key
        os.environ['OPENAI_API_KEY'] = openai_api_key
        return OpenAIEmbeddings(), "text-embedding-3-small", OpenAI()

    def initialize_text_splitter():
        tokenizer = tiktoken.get_encoding('p50k_base')
        def tiktoken_len(text):
            tokens = tokenizer.encode(text, disallowed_special=())
            return len(tokens)
        return RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=100,
            length_function=tiktoken_len,
            separators=["\n\n", "\n", " ", ""]
        )

    def get_embedding(text, model="text-embedding-3-small"):
        response = openai_client.embeddings.create(input=text, model=model)
        return response.data[0].embedding

    def cosine_similarity_between_words(sentence1, sentence2):
        embedding1 = np.array(get_embedding(sentence1)).reshape(1, -1)
        embedding2 = np.array(get_embedding(sentence2)).reshape(1, -1)
        return cosine_similarity(embedding1, embedding2)[0][0]

    def load_and_split_youtube_data():
        loader = YoutubeLoader.from_youtube_url(link, add_video_info=True)
        data = loader.load()
        return text_splitter.split_documents(data)
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def initialize_vectorstore(texts):
        index_name = "test"
        namespace = link
        return PineconeVectorStore.from_texts(
            [f"Source: {t.metadata['source']}, Title: {t.metadata['title']} \n\nContent: {t.page_content}" for t in texts],
            embeddings, index_name=index_name, namespace=namespace
        )

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def perform_query():
        pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
        pinecone_index = pc.Index("test")
        raw_query_embedding = openai_client.embeddings.create(
            input=[query],
            model="text-embedding-3-small"
        )
        query_embedding = raw_query_embedding.data[0].embedding
        top_matches = pinecone_index.query(vector=query_embedding, top_k=10, include_metadata=True, namespace=link)
        contexts = [item['metadata']['text'] for item in top_matches['matches']]
        return "<CONTEXT>\n" + "\n\n-------\n\n".join(contexts[:10]) + "\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n" + query

    def get_openai_answer(augmented_query):
        primer = """You are a personal assistant. Answer any questions I have about the Youtube Video provided."""
        res = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": primer},
                {"role": "user", "content": augmented_query}
            ]
        )
        return res.choices[0].message.content

    # Main execution
    try:
        print(f"Starting RAG process for query: {query} and link: {link}")
        
        # Initialize APIs
        embeddings, embed_model, openai_client = initialize_apis()
        print("APIs initialized successfully")

        # Initialize text splitter
        text_splitter = initialize_text_splitter()
        print("Text splitter initialized")

        # Load and split YouTube data
        texts = load_and_split_youtube_data()
        print(f"Loaded and split {len(texts)} text chunks from YouTube")

        time.sleep(3)  # Give some time for background processes to complete

        # Initialize vectorstore
        vectorstore_from_texts = initialize_vectorstore(texts)
        print("Vectorstore initialized")

        time.sleep(3)  # Give some time for vectorstore to be ready

        # Perform query
        augmented_query = perform_query()
        print("Query performed and augmented")

        # Get OpenAI answer
        openai_answer = get_openai_answer(augmented_query)
        print("Received answer from OpenAI")

        print("RAG process completed successfully")
        return openai_answer
    except Exception as e:
        error_message = f"Error in perform_yt_rag: {str(e)}"
        print(error_message)
        import traceback
        print(traceback.format_exc())
        raise Exception(error_message)

# Example usage


