"""Demonstration of the File and Quiz Attempt API endpoints"""
from fastapi.testclient import TestClient
from api.index import app
import json

client = TestClient(app)

print("=" * 60)
print("File and Quiz Attempt API Demonstration")
print("=" * 60)
print()

# Demonstrate File CRUD
print("1. Creating a new file...")
response = client.post("/api/files/", json={
    "name": "study_notes.txt",
    "content": "These are my study notes for the exam."
})
print(f"   Status: {response.status_code}")
file_data = response.json()
print(f"   Response: {json.dumps(file_data, indent=4)}")
file_id = file_data["id"]
print()

print("2. Retrieving the file...")
response = client.get(f"/api/files/{file_id}")
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

print("3. Updating the file...")
response = client.put(f"/api/files/{file_id}", json={
    "name": "study_notes_updated.txt",
    "content": "Updated study notes with more information."
})
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

# Demonstrate Quiz Attempt CRUD
print("4. Creating a quiz attempt...")
response = client.post("/api/quiz-attempts/", json={
    "student_id": "student_12345",
    "quiz_id": "midterm_quiz_01",
    "answers": {
        "question_1": "Paris",
        "question_2": "42",
        "question_3": "Python"
    }
})
print(f"   Status: {response.status_code}")
attempt_data = response.json()
print(f"   Response: {json.dumps(attempt_data, indent=4)}")
attempt_id = attempt_data["id"]
print()

print("5. Retrieving the quiz attempt...")
response = client.get(f"/api/quiz-attempts/{attempt_id}")
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

print("6. Updating the quiz attempt...")
response = client.put(f"/api/quiz-attempts/{attempt_id}", json={
    "student_id": "student_12345",
    "quiz_id": "midterm_quiz_01",
    "answers": {
        "question_1": "Paris",
        "question_2": "43",  # Changed answer
        "question_3": "JavaScript"  # Changed answer
    }
})
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

print("7. Deleting the file...")
response = client.delete(f"/api/files/{file_id}")
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

print("8. Deleting the quiz attempt...")
response = client.delete(f"/api/quiz-attempts/{attempt_id}")
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=4)}")
print()

print("=" * 60)
print("✅ All API operations completed successfully!")
print("=" * 60)
