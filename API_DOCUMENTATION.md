# File and Quiz Attempt API Implementation

## Overview

This implementation provides FastAPI backend endpoints for managing student files and quiz attempts, following the exact specifications from the problem statement.

## Endpoints

### File Management

All file endpoints are available at `/api/files/`:

- **POST /api/files/** - Create a new file
  ```json
  Request: {"name": "file.txt", "content": "Hello World"}
  Response: {"id": "uuid", "name": "file.txt", "content": "Hello World"}
  ```

- **GET /api/files/{file_id}** - Retrieve a file by ID
  ```json
  Response: {"id": "uuid", "name": "file.txt", "content": "Hello World"}
  ```

- **PUT /api/files/{file_id}** - Update a file
  ```json
  Request: {"name": "updated.txt", "content": "New content"}
  Response: {"id": "uuid", "name": "updated.txt", "content": "New content"}
  ```

- **DELETE /api/files/{file_id}** - Delete a file
  ```json
  Response: {"detail": "File deleted"}
  ```

### Quiz Attempt Management

All quiz attempt endpoints are available at `/api/quiz-attempts/`:

- **POST /api/quiz-attempts/** - Create a new quiz attempt
  ```json
  Request: {
    "student_id": "student123",
    "quiz_id": "quiz456",
    "answers": {"q1": "answer1", "q2": "answer2"}
  }
  Response: {
    "id": "uuid",
    "student_id": "student123",
    "quiz_id": "quiz456",
    "answers": {"q1": "answer1", "q2": "answer2"},
    "score": null
  }
  ```

- **GET /api/quiz-attempts/{attempt_id}** - Retrieve a quiz attempt
  ```json
  Response: {
    "id": "uuid",
    "student_id": "student123",
    "quiz_id": "quiz456",
    "answers": {"q1": "answer1", "q2": "answer2"},
    "score": null
  }
  ```

- **PUT /api/quiz-attempts/{attempt_id}** - Update a quiz attempt
  ```json
  Request: {
    "student_id": "student123",
    "quiz_id": "quiz456",
    "answers": {"q1": "new_answer1", "q2": "new_answer2"}
  }
  Response: {
    "id": "uuid",
    "student_id": "student123",
    "quiz_id": "quiz456",
    "answers": {"q1": "new_answer1", "q2": "new_answer2"},
    "score": null
  }
  ```

- **DELETE /api/quiz-attempts/{attempt_id}** - Delete a quiz attempt
  ```json
  Response: {"detail": "Quiz attempt deleted"}
  ```

## Data Models

### File
```python
class File(BaseModel):
    id: str
    name: str
    content: str
```

### FileCreate
```python
class FileCreate(BaseModel):
    name: str
    content: Optional[str] = ""
```

### QuizAttempt
```python
class QuizAttempt(BaseModel):
    id: str
    student_id: str
    quiz_id: str
    answers: dict
    score: Optional[float] = None
```

### QuizAttemptCreate
```python
class QuizAttemptCreate(BaseModel):
    student_id: str
    quiz_id: str
    answers: dict
```

## Implementation Details

- **Storage**: In-memory dictionaries for demo purposes
- **IDs**: Generated using UUID4
- **Validation**: Automatic via Pydantic models
- **Error Handling**: Returns 404 for missing resources
- **Path Convention**: All endpoints use `/api/` prefix following repository convention

## Testing

Comprehensive tests are included covering:
- ✅ Create operations (POST)
- ✅ Read operations (GET)
- ✅ Update operations (PUT)
- ✅ Delete operations (DELETE)
- ✅ Error cases (404 not found)

Run tests with:
```bash
python test_endpoints.py
```

## Example Usage

```python
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

# Create a file
response = client.post("/api/files/", json={
    "name": "notes.txt",
    "content": "My study notes"
})
file_id = response.json()["id"]

# Retrieve the file
response = client.get(f"/api/files/{file_id}")
print(response.json())
```

## Notes

- All endpoints follow RESTful conventions
- Storage is in-memory and will be reset when the server restarts
- The implementation matches the problem statement specifications exactly
- URL paths use `/api/` prefix to maintain consistency with other endpoints in the repository
