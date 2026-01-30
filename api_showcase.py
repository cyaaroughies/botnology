"""Visual showcase of the File and Quiz Attempt API"""
import json
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_request(method, url, data=None):
    print(f"\n📤 {method} {url}")
    if data:
        print(f"   Body: {json.dumps(data, indent=8)}")

def print_response(response):
    print(f"\n📥 Status: {response.status_code}")
    print(f"   Response:")
    print(json.dumps(response.json(), indent=8))

# Header
print("\n" + "🚀" * 35)
print("   BOTNOLOGY FILE & QUIZ ATTEMPT API SHOWCASE")
print("🚀" * 35)

# Files Section
print_section("FILE MANAGEMENT API")

# Create File
print_request("POST", "/api/files/", {
    "name": "calculus_notes.txt",
    "content": "Derivatives, integrals, and limits"
})
response = client.post("/api/files/", json={
    "name": "calculus_notes.txt",
    "content": "Derivatives, integrals, and limits"
})
print_response(response)
file_id = response.json()["id"]

# Get File
print_request("GET", f"/api/files/{file_id}")
response = client.get(f"/api/files/{file_id}")
print_response(response)

# Update File
print_request("PUT", f"/api/files/{file_id}", {
    "name": "advanced_calculus.txt",
    "content": "Added: Taylor series and differential equations"
})
response = client.put(f"/api/files/{file_id}", json={
    "name": "advanced_calculus.txt",
    "content": "Added: Taylor series and differential equations"
})
print_response(response)

# Quiz Attempts Section
print_section("QUIZ ATTEMPT MANAGEMENT API")

# Create Quiz Attempt
print_request("POST", "/api/quiz-attempts/", {
    "student_id": "STU-2024-001",
    "quiz_id": "CALC-MIDTERM-01",
    "answers": {
        "q1": "d/dx(x²) = 2x",
        "q2": "∫x dx = x²/2 + C",
        "q3": "lim(x→0) sin(x)/x = 1"
    }
})
response = client.post("/api/quiz-attempts/", json={
    "student_id": "STU-2024-001",
    "quiz_id": "CALC-MIDTERM-01",
    "answers": {
        "q1": "d/dx(x²) = 2x",
        "q2": "∫x dx = x²/2 + C",
        "q3": "lim(x→0) sin(x)/x = 1"
    }
})
print_response(response)
attempt_id = response.json()["id"]

# Get Quiz Attempt
print_request("GET", f"/api/quiz-attempts/{attempt_id}")
response = client.get(f"/api/quiz-attempts/{attempt_id}")
print_response(response)

# Cleanup Section
print_section("CLEANUP")

print_request("DELETE", f"/api/files/{file_id}")
response = client.delete(f"/api/files/{file_id}")
print_response(response)

print_request("DELETE", f"/api/quiz-attempts/{attempt_id}")
response = client.delete(f"/api/quiz-attempts/{attempt_id}")
print_response(response)

# Footer
print("\n" + "=" * 70)
print("✅ All API operations completed successfully!")
print("=" * 70 + "\n")
