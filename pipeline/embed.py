"""
embed.py — Chunking & Embedding (google-genai SDK)

Takes raw chunks → splits into smaller pieces → embeds via Gemini → stores in ChromaDB.
"""

import os
import json
import hashlib
import time
from typing import List, Dict, Any

import chromadb
from google import genai
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '800'))
CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '150'))
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'models/text-embedding-004')
CHROMA_DIR = os.getenv('CHROMA_DIR', './chroma_db')

# Initialize Gemini client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))


def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks by paragraph/line boundaries."""
    if len(text) <= chunk_size:
        return [text]

    paragraphs = text.split('\n\n')
    chunks = []
    current = ''

    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current = (current + '\n\n' + para).strip() if current else para
        else:
            if current:
                chunks.append(current)
            if len(para) > chunk_size:
                lines = para.split('\n')
                current = ''
                for line in lines:
                    if len(current) + len(line) + 1 <= chunk_size:
                        current = (current + '\n' + line).strip() if current else line
                    else:
                        if current:
                            chunks.append(current)
                        current = line
            else:
                current = para

    if current:
        chunks.append(current)

    # Add overlap
    if overlap > 0 and len(chunks) > 1:
        overlapped = [chunks[0]]
        for i in range(1, len(chunks)):
            prev_tail = chunks[i - 1][-overlap:]
            overlapped.append(prev_tail + '\n' + chunks[i])
        chunks = overlapped

    return chunks


def chunk_id(company_id: str, filename: str, page_or_sheet: str, chunk_idx: int) -> str:
    """Generate a deterministic chunk ID."""
    raw = f"{company_id}|{filename}|{page_or_sheet}|{chunk_idx}"
    return hashlib.md5(raw.encode()).hexdigest()


def prepare_chunks(raw_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Split raw document chunks into smaller embedding-ready chunks."""
    embedding_chunks = []

    for doc in tqdm(raw_chunks, desc="Splitting into chunks"):
        text = doc['text_content']
        sub_chunks = split_text(text)

        for idx, sub_text in enumerate(sub_chunks):
            cid = chunk_id(
                doc['company_id'], doc['filename'],
                doc['page_or_sheet'], idx
            )
            embedding_chunks.append({
                'id': cid,
                'text': sub_text,
                'metadata': {
                    'company_id': doc['company_id'],
                    'filename': doc['filename'],
                    'page_or_sheet': doc['page_or_sheet'],
                    'page_number': doc.get('page_number', 1),
                    'doc_type': doc['doc_type'],
                    'source_path': doc.get('source_path', ''),
                    'chunk_index': idx,
                }
            })

    print(f"Prepared {len(embedding_chunks)} embedding chunks from {len(raw_chunks)} raw docs")
    return embedding_chunks


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings from Gemini in batches with free-tier rate limiting."""
    all_embeddings = []
    batch_size = 20  # Small batches to stay under 100 req/min
    retry_delay = 15

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch = [t[:8000] for t in batch]  # truncate long texts

        success = False
        attempts = 0
        while not success and attempts < 5:
            try:
                result = client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=batch,
                )
                for emb in result.embeddings:
                    all_embeddings.append(emb.values)
                success = True
            except Exception as e:
                attempts += 1
                if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                    wait = retry_delay * attempts
                    print(f"  Rate limited (attempt {attempts}), waiting {wait}s...")
                    time.sleep(wait)
                else:
                    raise

        # Delay between batches to avoid hitting 100 req/min
        time.sleep(3)

    return all_embeddings



def get_query_embedding(text: str) -> List[float]:
    """Get embedding for a single query."""
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return result.embeddings[0].values


def build_vector_store(chunks: List[Dict[str, Any]], persist_dir: str = CHROMA_DIR):
    """Generate embeddings and store in ChromaDB."""
    chroma_client = chromadb.PersistentClient(path=persist_dir)

    try:
        chroma_client.delete_collection("nbu_documents")
    except Exception:
        pass

    collection = chroma_client.create_collection(
        name="nbu_documents",
        metadata={"hnsw:space": "cosine"}
    )

    print(f"Generating embeddings for {len(chunks)} chunks...")

    batch_size = 50
    for i in tqdm(range(0, len(chunks), batch_size), desc="Embedding batches"):
        batch = chunks[i:i + batch_size]
        texts = [c['text'] for c in batch]
        ids = [c['id'] for c in batch]
        metadatas = [c['metadata'] for c in batch]

        embeddings = get_embeddings(texts)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        time.sleep(0.5)

    print(f"Vector store built with {collection.count()} chunks at {persist_dir}")
    return collection


def load_vector_store(persist_dir: str = CHROMA_DIR):
    """Load existing ChromaDB vector store."""
    chroma_client = chromadb.PersistentClient(path=persist_dir)
    collection = chroma_client.get_collection("nbu_documents")
    print(f"Loaded vector store with {collection.count()} chunks")
    return collection


if __name__ == '__main__':
    with open('raw_chunks.json', 'r', encoding='utf-8') as f:
        raw_chunks = json.load(f)
    chunks = prepare_chunks(raw_chunks)
    build_vector_store(chunks)
