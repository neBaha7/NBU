"""
submit.py — Submission Generator (v2 — NBU Challenge format)

Output format (matching submission_format.json):
[
    {
        "question_id": 1,
        "relevant_chunks": [
            {"document_name": "NSBU_annual_2134.xlsx", "page_number": 1}
        ],
        "answer": "some answer"
    },
    ...
]
"""

import os
import json
from typing import List, Dict, Any

from dotenv import load_dotenv

load_dotenv()

ANSWERS_PUBLIC = os.getenv('ANSWERS_PUBLIC', './docs/answers_public.json')


def load_public_answers(filepath: str = ANSWERS_PUBLIC) -> List[Dict[str, Any]]:
    """Load public answers for validation."""
    if not os.path.exists(filepath):
        print(f"[WARN] Public answers file not found: {filepath}")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        answers = json.load(f)
    return answers


def validate_submission(
    submission: List[Dict[str, Any]],
    public_answers: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Validate submission against public answers."""
    if public_answers is None:
        public_answers = load_public_answers()

    if not public_answers:
        print("[INFO] No public answers to validate against.")
        return {'status': 'no_validation'}

    # Build lookup
    pub_map = {item['question_id']: item for item in public_answers}
    sub_map = {item['question_id']: item for item in submission}

    correct = 0
    total = 0
    with_sources = 0
    details = []

    for qid, pub in pub_map.items():
        total += 1
        expected = pub.get('answer')
        
        sub = sub_map.get(qid)
        if not sub:
            details.append({'id': qid, 'status': 'missing', 'expected': expected, 'actual': None})
            continue

        actual = sub.get('answer')
        sources = sub.get('relevant_chunks', [])

        # Compare answers
        match = False
        if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
            match = expected == actual
        elif str(expected).strip().lower() == str(actual).strip().lower():
            match = True
        elif str(expected).strip() in str(actual).strip() or str(actual).strip() in str(expected).strip():
            match = True

        if match:
            correct += 1

        if sources and len(sources) > 0:
            with_sources += 1

        details.append({
            'id': qid,
            'expected': expected,
            'actual': actual,
            'match': match,
            'has_sources': len(sources) > 0,
        })

    score = {
        'total_public_questions': total,
        'correct_answers': correct,
        'accuracy': round(correct / total * 100, 1) if total > 0 else 0,
        'answers_with_sources': with_sources,
        'source_coverage': round(with_sources / total * 100, 1) if total > 0 else 0,
        'details': details,
    }

    print(f"\n{'='*50}")
    print(f"  VALIDATION RESULTS")
    print(f"{'='*50}")
    print(f"  Accuracy:        {score['accuracy']}% ({correct}/{total})")
    print(f"  Source coverage:  {score['source_coverage']}% ({with_sources}/{total})")
    print(f"{'='*50}")
    
    # Print per-question details
    for d in details:
        status = '✓' if d.get('match') else '✗'
        print(f"  {status} Q{d['id']}: expected={d.get('expected')} | got={d.get('actual')}")

    return score


def generate_submission(
    rag_answers: List[Dict[str, Any]],
    output_path: str = 'submission.json',
):
    """Full submission pipeline: format, validate, save."""
    # The rag_answers are already in submission format 
    # [{question_id, relevant_chunks, answer}]
    submission = rag_answers

    # Validate against public answers
    score = validate_submission(submission)

    # Save submission
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(submission, f, ensure_ascii=False, indent=2)
    print(f"\nSubmission saved to {output_path}")

    # Save validation report
    with open('validation_report.json', 'w', encoding='utf-8') as f:
        json.dump(score, f, ensure_ascii=False, indent=2)

    return submission, score


if __name__ == '__main__':
    with open('answers_raw.json', 'r', encoding='utf-8') as f:
        rag_answers = json.load(f)
    generate_submission(rag_answers)
