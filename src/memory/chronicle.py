import json
import os
from typing import List
from src.memory.schema import PrecedentObject

class TheChronicle:
    def __init__(self, persistence_path: str = "chronicle_data.json"):
        self.persistence_path = persistence_path
        self.memory: List[PrecedentObject] = []
        self._load()

    def _load(self):
        if os.path.exists(self.persistence_path):
            with open(self.persistence_path, 'r') as f:
                data = json.load(f)
                # Reconstruct objects
                for item in data:
                    self.memory.append(PrecedentObject(**item))

    def _save(self):
        with open(self.persistence_path, 'w') as f:
            json.dump([obj.to_dict() for obj in self.memory], f, indent=2)

    def log_precedent(self, precedent: PrecedentObject):
        self.memory.append(precedent)
        self._save()
        print(f"[CHRONICLE] Logged Case: {precedent.case_id}")

    def retrieve_relevant_case(self, query: str) -> List[PrecedentObject]:
        # Mock retrieval: Find cases where the question shares words with the query
        # In real implementation: embedding search via pgvector
        results = []
        query_words = set(query.lower().split())
        
        for case in self.memory:
            question_words = set(case.question.lower().split())
            intersection = query_words.intersection(question_words)
            if len(intersection) > 0:
                results.append(case)
        
        return results
