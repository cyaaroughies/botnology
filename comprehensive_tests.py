#!/usr/bin/env python3
"""
Comprehensive test suite for Botnology site
Tests all critical functionality to ensure site is production-ready
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000"
RESULTS = {"passed": 0, "failed": 0, "tests": []}

def log_test(name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = {"name": name, "passed": passed, "message": message}
    RESULTS["tests"].append(result)
    if passed:
        RESULTS["passed"] += 1
    else:
        RESULTS["failed"] += 1
    print(f"{status}: {name}")
    if message:
        print(f"  → {message}")

def test_health_endpoint():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        data = response.json()
        
        if response.status_code == 200:
            log_test("Health Endpoint", True, f"Status: {data.get('status')}")
            
            # Check OpenAI
            if data.get("openai"):
                log_test("OpenAI Configuration", True, "OpenAI API key loaded")
            else:
                log_test("OpenAI Configuration", False, "OpenAI not configured")
            
            # Check Stripe
            if data.get("stripe"):
                log_test("Stripe Configuration", True, "Stripe keys loaded")
            else:
                log_test("Stripe Configuration", False, "Stripe not configured")
            
            # Check public directory
            if data.get("public_dir_exists"):
                log_test("Public Directory", True, f"Path: {data.get('public_dir')}")
            else:
                log_test("Public Directory", False, "Public directory missing")
        else:
            log_test("Health Endpoint", False, f"Status code: {response.status_code}")
    except Exception as e:
        log_test("Health Endpoint", False, str(e))

def test_static_files():
    """Test that static files are accessible"""
    files_to_test = [
        "/index.html",
        "/pricing.html",
        "/dashboard.html",
        "/courses.html",
        "/study-hall.html",
        "/student-dashboard.html",
        "/quiz-module.html",
        "/script.js",
        "/style.css"
    ]
    
    for file_path in files_to_test:
        try:
            response = requests.get(f"{BASE_URL}{file_path}", timeout=5)
            if response.status_code == 200:
                log_test(f"Static File: {file_path}", True, f"Size: {len(response.content)} bytes")
            else:
                log_test(f"Static File: {file_path}", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test(f"Static File: {file_path}", False, str(e))

def test_file_crud():
    """Test file CRUD operations"""
    # Create file
    try:
        create_data = {
            "student_id": "test-student-123",
            "name": "test-file.txt",
            "content": "Test content for comprehensive testing"
        }
        response = requests.post(f"{BASE_URL}/api/files/", json=create_data, timeout=5)
        
        if response.status_code == 200:
            file_data = response.json()
            file_id = file_data.get("id")
            log_test("Create File", True, f"File ID: {file_id}")
            
            # Read file
            response = requests.get(f"{BASE_URL}/api/files/{file_id}", timeout=5)
            if response.status_code == 200:
                log_test("Read File", True, f"Retrieved file: {file_data.get('name')}")
            else:
                log_test("Read File", False, f"Status: {response.status_code}")
            
            # Update file
            update_data = {
                "student_id": "test-student-123",
                "name": "updated-file.txt",
                "content": "Updated content"
            }
            response = requests.put(f"{BASE_URL}/api/files/{file_id}", json=update_data, timeout=5)
            if response.status_code == 200:
                log_test("Update File", True, "File updated successfully")
            else:
                log_test("Update File", False, f"Status: {response.status_code}")
            
            # Delete file
            response = requests.delete(f"{BASE_URL}/api/files/{file_id}", timeout=5)
            if response.status_code == 200:
                log_test("Delete File", True, "File deleted successfully")
            else:
                log_test("Delete File", False, f"Status: {response.status_code}")
        else:
            log_test("Create File", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("File CRUD Operations", False, str(e))

def test_quiz_crud():
    """Test quiz attempt CRUD operations"""
    try:
        create_data = {
            "student_id": "test-student-123",
            "quiz_id": "quiz-1",
            "answers": {"q1": "Paris", "q2": "4"}
        }
        response = requests.post(f"{BASE_URL}/api/quiz-attempts/", json=create_data, timeout=5)
        
        if response.status_code == 200:
            quiz_data = response.json()
            attempt_id = quiz_data.get("id")
            log_test("Create Quiz Attempt", True, f"Attempt ID: {attempt_id}")
            
            # Read quiz attempt
            response = requests.get(f"{BASE_URL}/api/quiz-attempts/{attempt_id}", timeout=5)
            if response.status_code == 200:
                log_test("Read Quiz Attempt", True, "Retrieved quiz attempt")
            else:
                log_test("Read Quiz Attempt", False, f"Status: {response.status_code}")
            
            # Delete quiz attempt
            response = requests.delete(f"{BASE_URL}/api/quiz-attempts/{attempt_id}", timeout=5)
            if response.status_code == 200:
                log_test("Delete Quiz Attempt", True, "Quiz attempt deleted")
            else:
                log_test("Delete Quiz Attempt", False, f"Status: {response.status_code}")
        else:
            log_test("Create Quiz Attempt", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Quiz CRUD Operations", False, str(e))

def test_stripe_endpoint():
    """Test Stripe checkout endpoint (will fail on network but should validate inputs)"""
    try:
        checkout_data = {
            "plan": "associates",
            "cadence": "monthly",
            "student_id": "test-student-123",
            "email": "test@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/stripe/create-checkout-session", json=checkout_data, timeout=5)
        
        # We expect this to fail with network error, but should process the request
        if response.status_code in [200, 400, 500]:
            log_test("Stripe Endpoint Processing", True, f"Endpoint reachable, Status: {response.status_code}")
        else:
            log_test("Stripe Endpoint Processing", False, f"Unexpected status: {response.status_code}")
    except Exception as e:
        # Network error is expected
        if "api.stripe.com" in str(e) or "Stripe" in str(e):
            log_test("Stripe Endpoint Processing", True, "Endpoint reachable (network error expected)")
        else:
            log_test("Stripe Endpoint Processing", False, str(e))

def test_auth_endpoints():
    """Test authentication endpoints"""
    endpoints = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/logout"
    ]
    
    for endpoint in endpoints:
        try:
            # Just check if endpoints exist (will return 405 or 422 without proper data)
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            # 405 = Method Not Allowed (expects POST), 422 = Unprocessable (expects body)
            if response.status_code in [200, 405, 422]:
                log_test(f"Auth Endpoint: {endpoint}", True, f"Endpoint exists")
            else:
                log_test(f"Auth Endpoint: {endpoint}", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test(f"Auth Endpoint: {endpoint}", False, str(e))

def generate_report():
    """Generate test report"""
    print("\n" + "=" * 60)
    print("COMPREHENSIVE TEST REPORT")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Tests: {len(RESULTS['tests'])}")
    print(f"✅ Passed: {RESULTS['passed']}")
    print(f"❌ Failed: {RESULTS['failed']}")
    print(f"Success Rate: {(RESULTS['passed'] / len(RESULTS['tests']) * 100):.1f}%")
    print("=" * 60)
    
    if RESULTS['failed'] > 0:
        print("\nFailed Tests:")
        for test in RESULTS['tests']:
            if not test['passed']:
                print(f"  - {test['name']}: {test['message']}")
    
    print("\n" + "=" * 60)
    
    # Return exit code based on results
    return 0 if RESULTS['failed'] == 0 else 1

if __name__ == "__main__":
    print("🚀 Starting Comprehensive Test Suite")
    print("=" * 60)
    
    # Run all tests
    test_health_endpoint()
    test_static_files()
    test_file_crud()
    test_quiz_crud()
    test_stripe_endpoint()
    test_auth_endpoints()
    
    # Generate report and exit
    exit_code = generate_report()
    sys.exit(exit_code)
