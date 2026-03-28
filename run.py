#!/usr/bin/env python3
"""
run.py — NBU RAG Pipeline CLI
UzHack 2026

Usage:
  python run.py --step all       # Run everything
  python run.py --step ingest    # Only parse documents
  python run.py --step query     # Answer questions (direct-context, no embedding)
  python run.py --step submit    # Generate submission.json
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()


def banner():
    print("""
╔══════════════════════════════════════════╗
║  NBU RAG Challenge Pipeline              ║
║  UzHack 2026                             ║
╚══════════════════════════════════════════╝
""")


def step_ingest(args):
    """Step 1: Ingest all documents."""
    print("=" * 60)
    print("STEP 1: Document Ingestion")
    print("=" * 60)

    from pipeline.ingest import ingest_all
    dataset_dir = os.getenv('DATASET_DIR', './dataset')

    t0 = time.time()
    chunks = ingest_all(dataset_dir)
    elapsed = time.time() - t0

    # Save raw chunks
    with open('raw_chunks.json', 'w', encoding='utf-8') as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"\nIngestion complete in {elapsed:.1f}s")
    print(f"Total chunks: {len(chunks)}")
    print(f"Saved to: raw_chunks.json")
    return chunks


def step_query(args):
    """Step 2: Answer all questions using programmatic extraction."""
    print("=" * 60)
    print("STEP 2: Answering Questions (Programmatic Extraction)")
    print("=" * 60)

    from pipeline.direct_answer import answer_all

    t0 = time.time()
    results = answer_all()
    elapsed = time.time() - t0

    with open('answers_raw.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nQuery step complete in {elapsed:.1f}s")
    print(f"Answered: {len(results)} questions")
    print(f"Saved to: answers_raw.json")
    return results


def step_submit(args):
    """Step 3: Generate submission and validate."""
    print("=" * 60)
    print("STEP 3: Submission & Validation")
    print("=" * 60)

    from pipeline.submit import generate_submission

    with open('answers_raw.json', 'r', encoding='utf-8') as f:
        rag_answers = json.load(f)

    submission, score = generate_submission(rag_answers)
    return submission, score


def main():
    parser = argparse.ArgumentParser(description='NBU RAG Pipeline')
    parser.add_argument('--step', default='all',
                        choices=['all', 'ingest', 'query', 'submit'],
                        help='Pipeline step to run')
    args = parser.parse_args()

    banner()
    t_start = time.time()

    if args.step in ('all', 'ingest'):
        step_ingest(args)
        print()

    if args.step in ('all', 'query'):
        step_query(args)
        print()

    if args.step in ('all', 'submit'):
        step_submit(args)

    elapsed = time.time() - t_start
    print(f"\nPipeline finished in {elapsed:.1f}s")


if __name__ == '__main__':
    main()
