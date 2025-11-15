# 📚 Complete API Documentation for Flutter Integration

**Base URL:** `http://localhost:3000/api` (or your production URL)

**All APIs return JSON format**

---

## 📋 Table of Contents

1. [Courses APIs](#1-courses-apis)
2. [Lessons APIs](#2-lessons-apis)
3. [AI Mastery Paths APIs](#3-ai-mastery-paths-apis)
4. [Challenges APIs](#4-challenges-apis)
5. [Prompts APIs](#5-prompts-apis)
6. [Users APIs](#6-users-apis)
7. [Certificates APIs](#7-certificates-apis)
8. [Payment APIs](#8-payment-apis)
9. [Certificate Templates APIs](#9-certificate-templates-apis)
10. [Error Codes](#error-codes)
11. [Flutter Integration Examples](#flutter-integration-examples)

---

## 1. Courses APIs

### 1.1 Get All Courses

**Endpoint:** `GET /api/courses`

**Query Parameters:**
- `type` (optional): Filter by course type (`simple`, `mastery-path`, `challenge`, `prompt-suggested`)
- `isActive` (optional): Filter by active status (`true` or `false`)

**Example Request:**
```dart
// Get all courses
GET http://localhost:3000/api/courses

// Get only active simple courses
GET http://localhost:3000/api/courses?type=simple&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "ChatGPT Mastery",
      "heading": "Master ChatGPT from Zero to Hero",
      "subHeading": "Complete guide to ChatGPT",
      "type": "simple",
      "category": "AI",
      "photo": "data:image/png;base64,iVBORw0KG...",
      "isActive": true,
      "lessons": [
        {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "title": "Introduction to ChatGPT",
          "order": 1
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<Course>> fetchCourses({String? type, bool? isActive}) async {
  final queryParams = <String, String>{};
  if (type != null) queryParams['type'] = type;
  if (isActive != null) queryParams['isActive'] = isActive.toString();
  
  final uri = Uri.parse('http://localhost:3000/api/courses')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(uri);
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return (json['data'] as List)
        .map((item) => Course.fromJson(item))
        .toList();
  }
  throw Exception(json['error'] ?? 'Failed to fetch courses');
}
```

---

### 1.2 Get Single Course (with all details)

**Endpoint:** `GET /api/courses/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/courses/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "ChatGPT Mastery",
    "heading": "Master ChatGPT from Zero to Hero",
    "subHeading": "Complete guide to ChatGPT",
    "type": "simple",
    "category": "AI",
    "photo": "data:image/png;base64,iVBORw0KG...",
    "isActive": true,
    "lessons": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "title": "Introduction to ChatGPT",
        "content": "ChatGPT is an AI language model...",
        "order": 1,
        "isInteractive": true,
        "media": ["https://example.com/video.mp4"],
        "photos": ["data:image/png;base64,..."],
        "questions": [
          {
            "question": "What is ChatGPT?",
            "options": ["AI Model", "Game", "App"],
            "correctAnswer": 0,
            "explanation": "ChatGPT is an AI language model"
          }
        ],
        "canRead": true,
        "canListen": false
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Flutter Example:**
```dart
Future<Course> fetchCourseDetails(String courseId) async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/courses/$courseId'),
  );
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return Course.fromJson(json['data']);
  }
  throw Exception(json['error'] ?? 'Course not found');
}
```

---

### 1.3 Create Course (Admin Only)

**Endpoint:** `POST /api/courses`

**Request Body:**
```json
{
  "title": "New Course",
  "heading": "Course Heading",
  "subHeading": "Optional sub-heading",
  "type": "simple",
  "category": "AI",
  "photo": "data:image/png;base64,...",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "New Course",
    ...
  }
}
```

---

### 1.4 Update Course (Admin Only)

**Endpoint:** `PUT /api/courses/:id`

**Request Body:** (Same as create, all fields optional)

---

### 1.5 Delete Course (Admin Only)

**Endpoint:** `DELETE /api/courses/:id`

---

## 2. Lessons APIs

### 2.1 Get All Lessons

**Endpoint:** `GET /api/lessons`

**Query Parameters:**
- `courseId` (optional): Filter by course ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```dart
// Get all lessons
GET http://localhost:3000/api/lessons

// Get lessons for a specific course
GET http://localhost:3000/api/lessons?courseId=65a1b2c3d4e5f6g7h8i9j0k1

// Get lessons with pagination
GET http://localhost:3000/api/lessons?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "courseId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Introduction to ChatGPT",
      "content": "ChatGPT is an AI language model developed by OpenAI...",
      "order": 1,
      "isInteractive": true,
      "media": ["https://example.com/video.mp4"],
      "photos": ["data:image/png;base64,..."],
      "questions": [
        {
          "question": "What is ChatGPT?",
          "options": ["AI Model", "Game", "App"],
          "correctAnswer": 0,
          "explanation": "ChatGPT is an AI language model"
        }
      ],
      "canRead": true,
      "canListen": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Flutter Example:**
```dart
Future<LessonResponse> fetchLessons({
  String? courseId,
  int page = 1,
  int limit = 10,
}) async {
  final queryParams = <String, String>{
    'page': page.toString(),
    'limit': limit.toString(),
  };
  if (courseId != null) queryParams['courseId'] = courseId;
  
  final uri = Uri.parse('http://localhost:3000/api/lessons')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(uri);
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return LessonResponse(
      lessons: (json['data'] as List)
          .map((item) => Lesson.fromJson(item))
          .toList(),
      pagination: Pagination.fromJson(json['pagination']),
    );
  }
  throw Exception(json['error'] ?? 'Failed to fetch lessons');
}
```

---

### 2.2 Get Single Lesson (with all details)

**Endpoint:** `GET /api/lessons/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/lessons/65a1b2c3d4e5f6g7h8i9j0k2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "courseId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Introduction to ChatGPT",
    "content": "Full lesson content here...",
    "order": 1,
    "isInteractive": true,
    "media": ["https://example.com/video.mp4"],
    "photos": ["data:image/png;base64,..."],
    "questions": [
      {
        "question": "What is ChatGPT?",
        "options": ["AI Model", "Game", "App"],
        "correctAnswer": 0,
        "explanation": "ChatGPT is an AI language model"
      }
    ],
    "canRead": true,
    "canListen": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Flutter Example:**
```dart
Future<Lesson> fetchLessonDetails(String lessonId) async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/lessons/$lessonId'),
  );
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return Lesson.fromJson(json['data']);
  }
  throw Exception(json['error'] ?? 'Lesson not found');
}
```

---

### 2.3 Create Lesson (Admin Only)

**Endpoint:** `POST /api/lessons`

**Request Body:**
```json
{
  "courseId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "New Lesson",
  "content": "Lesson content here...",
  "order": 1,
  "isInteractive": false,
  "media": ["https://example.com/video.mp4"],
  "photos": ["data:image/png;base64,..."],
  "questions": [],
  "canRead": true,
  "canListen": false
}
```

---

## 3. AI Mastery Paths APIs

### 3.1 Get All AI Mastery Paths

**Endpoint:** `GET /api/aiCourses`

**Example Request:**
```dart
GET http://localhost:3000/api/aiCourses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "title": "ChatGPT Mastery Path",
      "heading": "Complete ChatGPT Learning Path",
      "subHeading": "From beginner to expert",
      "type": "mastery-path",
      "aiTool": "ChatGPT",
      "category": "Text Generation",
      "coverImage": "data:image/png;base64,...",
      "isActive": true,
      "tree": [
        {
          "level": 1,
          "topic": "Introduction",
          "lessons": [
            {
              "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
              "title": "What is ChatGPT?",
              "order": 1
            }
          ],
          "canRead": true,
          "canListen": false,
          "promptIds": [
            {
              "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
              "title": "ChatGPT Prompt Template"
            }
          ]
        }
      ],
      "certificateId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<AICourse>> fetchAICourses() async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/aiCourses'),
  );
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return (json['data'] as List)
        .map((item) => AICourse.fromJson(item))
        .toList();
  }
  throw Exception(json['error'] ?? 'Failed to fetch AI courses');
}
```

---

### 3.2 Get Single AI Mastery Path (with all details)

**Endpoint:** `GET /api/aiCourses/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/aiCourses/65a1b2c3d4e5f6g7h8i9j0k3
```

**Response:** (Same structure as above, with full populated data)

---

## 4. Challenges APIs

### 4.1 Get All Challenges

**Endpoint:** `GET /api/challenges`

**Query Parameters:**
- `isActive` (optional): Filter by active status

**Example Request:**
```dart
GET http://localhost:3000/api/challenges
GET http://localhost:3000/api/challenges?isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "title": "30-Day AI Challenge",
      "description": "Complete 30 days of AI learning",
      "duration": 30,
      "level": "beginner",
      "isActive": true,
      "lessons": [
        {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "title": "Day 1: Introduction",
          "order": 1
        }
      ],
      "interactiveQuestions": [
        {
          "day": 1,
          "lessonId": "65a1b2c3d4e5f6g7h8i9j0k2",
          "questions": [
            {
              "question": "What did you learn today?",
              "options": ["Option 1", "Option 2", "Option 3"],
              "correctAnswer": 0,
              "explanation": "Explanation here"
            }
          ]
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<Challenge>> fetchChallenges({bool? isActive}) async {
  final queryParams = <String, String>{};
  if (isActive != null) queryParams['isActive'] = isActive.toString();
  
  final uri = Uri.parse('http://localhost:3000/api/challenges')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(uri);
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return (json['data'] as List)
        .map((item) => Challenge.fromJson(item))
        .toList();
  }
  throw Exception(json['error'] ?? 'Failed to fetch challenges');
}
```

---

### 4.2 Get Single Challenge (with all details)

**Endpoint:** `GET /api/challenges/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/challenges/65a1b2c3d4e5f6g7h8i9j0k5
```

---

## 5. Prompts APIs

### 5.1 Get All Prompts

**Endpoint:** `GET /api/prompts`

**Query Parameters:**
- `category` (optional): Filter by category (`Life`, `Business`, `Creativity`, `Work`)
- `tool` (optional): Filter by AI tool (e.g., `ChatGPT`, `MidJourney`)
- `relatedCourseId` (optional): Filter by related course ID

**Example Request:**
```dart
GET http://localhost:3000/api/prompts
GET http://localhost:3000/api/prompts?category=Business&tool=ChatGPT
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "title": "Business Email Template",
      "category": "Business",
      "content": "Write a professional email...",
      "tool": "ChatGPT",
      "tags": ["email", "business", "professional"],
      "relatedCourseId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<Prompt>> fetchPrompts({
  String? category,
  String? tool,
  String? relatedCourseId,
}) async {
  final queryParams = <String, String>{};
  if (category != null) queryParams['category'] = category;
  if (tool != null) queryParams['tool'] = tool;
  if (relatedCourseId != null) queryParams['relatedCourseId'] = relatedCourseId;
  
  final uri = Uri.parse('http://localhost:3000/api/prompts')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(uri);
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return (json['data'] as List)
        .map((item) => Prompt.fromJson(item))
        .toList();
  }
  throw Exception(json['error'] ?? 'Failed to fetch prompts');
}
```

---

### 5.2 Get Single Prompt

**Endpoint:** `GET /api/prompts/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/prompts/65a1b2c3d4e5f6g7h8i9j0k4
```

---

## 6. Users APIs

### 6.1 Get All Users

**Endpoint:** `GET /api/users`

**Example Request:**
```dart
GET http://localhost:3000/api/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "name": "John Doe",
      "email": "john@example.com",
      "streak": 5,
      "completedLessons": ["65a1b2c3d4e5f6g7h8i9j0k2"],
      "joinedChallenges": [
        {
          "challengeId": "65a1b2c3d4e5f6g7h8i9j0k5",
          "currentDay": 3,
          "completedDays": [1, 2],
          "joinedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "masteryProgress": [
        {
          "courseId": "65a1b2c3d4e5f6g7h8i9j0k3",
          "currentLevel": 2,
          "completedLevels": [1],
          "progress": 50
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 6.2 Get Single User

**Endpoint:** `GET /api/users/:id`

**Example Request:**
```dart
GET http://localhost:3000/api/users/65a1b2c3d4e5f6g7h8i9j0k6
```

---

### 6.3 Create User

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Note:** Only `name` is required, all other fields are optional.

---

### 6.4 Update User Progress

**Endpoint:** `PUT /api/users/:id`

**Request Body:**
```json
{
  "streak": 6,
  "completedLessons": ["65a1b2c3d4e5f6g7h8i9j0k2", "65a1b2c3d4e5f6g7h8i9j0k7"],
  "joinedChallenges": [
    {
      "challengeId": "65a1b2c3d4e5f6g7h8i9j0k5",
      "currentDay": 4,
      "completedDays": [1, 2, 3],
      "joinedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "masteryProgress": [
    {
      "courseId": "65a1b2c3d4e5f6g7h8i9j0k3",
      "currentLevel": 3,
      "completedLevels": [1, 2],
      "progress": 75
    }
  ]
}
```

**Flutter Example:**
```dart
Future<void> updateUserProgress(String userId, Map<String, dynamic> progress) async {
  final response = await http.put(
    Uri.parse('http://localhost:3000/api/users/$userId'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(progress),
  );
  
  final json = jsonDecode(response.body);
  if (!json['success']) {
    throw Exception(json['error'] ?? 'Failed to update progress');
  }
}
```

---

## 7. Certificates APIs

### 7.1 Get User Certificates

**Endpoint:** `GET /api/certificates`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `courseId` (optional): Filter by course ID

**Example Request:**
```dart
GET http://localhost:3000/api/certificates?userId=65a1b2c3d4e5f6g7h8i9j0k6
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "userId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
        "name": "John Doe"
      },
      "courseId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "title": "ChatGPT Mastery"
      },
      "icon": "🏆",
      "title": "Certificate of Completion",
      "dateIssued": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<Certificate>> fetchUserCertificates(String userId) async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/certificates?userId=$userId'),
  );
  final json = jsonDecode(response.body);
  
  if (json['success']) {
    return (json['data'] as List)
        .map((item) => Certificate.fromJson(item))
        .toList();
  }
  throw Exception(json['error'] ?? 'Failed to fetch certificates');
}
```

---

## 8. Payment APIs

### 8.1 Get All Payments

**Endpoint:** `GET /api/payments`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `courseId` (optional): Filter by course ID
- `status` (optional): Filter by status (`pending`, `completed`, `failed`, `refunded`)
- `paymentMethod` (optional): Filter by method (`spay`, `card`, `paypal`, `stripe`, `other`)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example Request:**
```dart
GET http://localhost:3000/api/payments?userId=65a1b2c3d4e5f6g7h8i9j0k6&status=completed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
      "userId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "courseId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "title": "ChatGPT Mastery",
        "heading": "Master ChatGPT"
      },
      "amount": 29.99,
      "currency": "USD",
      "paymentMethod": "spay",
      "status": "completed",
      "transactionId": "TXN123456789",
      "msisdn": "249123456789",
      "requestId": "REQ123456",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 8.2 Create Payment Record

**Endpoint:** `POST /api/payments`

**Request Body:**
```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k6",
  "courseId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 29.99,
  "currency": "USD",
  "paymentMethod": "spay",
  "status": "completed",
  "transactionId": "TXN123456789",
  "msisdn": "249123456789",
  "requestId": "REQ123456",
  "metadata": {
    "additional": "data"
  }
}
```

**Flutter Example:**
```dart
Future<void> createPaymentRecord(Map<String, dynamic> paymentData) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/payments'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(paymentData),
  );
  
  final json = jsonDecode(response.body);
  if (!json['success']) {
    throw Exception(json['error'] ?? 'Failed to create payment');
  }
}
```

---

### 8.3 Get Single Payment

**Endpoint:** `GET /api/payments/:id`

---

## 9. Certificate Templates APIs

### 9.1 Get All Certificate Templates

**Endpoint:** `GET /api/certificate-templates`

**Example Request:**
```dart
GET http://localhost:3000/api/certificate-templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k10",
      "name": "Classic Gold",
      "icon": "🏆",
      "title": "Certificate of Completion",
      "description": "Elegant gold certificate",
      "design": {
        "backgroundColor": "#1a1a1a",
        "textColor": "#FFD700",
        "borderColor": "#FFD700",
        "borderStyle": "solid"
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Error Codes

All APIs return standard error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Flutter Integration Examples

### Complete Flutter Service Class

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Generic GET request
  Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('$baseUrl$endpoint')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(uri);
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load: ${response.statusCode}');
  }
  
  // Generic POST request
  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to create: ${response.statusCode}');
  }
  
  // Generic PUT request
  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to update: ${response.statusCode}');
  }
  
  // Generic DELETE request
  Future<void> delete(String endpoint) async {
    final response = await http.delete(Uri.parse('$baseUrl$endpoint'));
    
    if (response.statusCode != 200) {
      throw Exception('Failed to delete: ${response.statusCode}');
    }
  }
  
  // Courses
  Future<List<Course>> getCourses({String? type, bool? isActive}) async {
    final queryParams = <String, String>{};
    if (type != null) queryParams['type'] = type;
    if (isActive != null) queryParams['isActive'] = isActive.toString();
    
    final response = await get('/courses', queryParams: queryParams);
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Course.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch courses');
  }
  
  Future<Course> getCourseDetails(String courseId) async {
    final response = await get('/courses/$courseId');
    if (response['success']) {
      return Course.fromJson(response['data']);
    }
    throw Exception(response['error'] ?? 'Course not found');
  }
  
  // Lessons
  Future<List<Lesson>> getLessons({String? courseId, int page = 1, int limit = 10}) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (courseId != null) queryParams['courseId'] = courseId;
    
    final response = await get('/lessons', queryParams: queryParams);
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Lesson.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch lessons');
  }
  
  Future<Lesson> getLessonDetails(String lessonId) async {
    final response = await get('/lessons/$lessonId');
    if (response['success']) {
      return Lesson.fromJson(response['data']);
    }
    throw Exception(response['error'] ?? 'Lesson not found');
  }
  
  // AI Courses
  Future<List<AICourse>> getAICourses() async {
    final response = await get('/aiCourses');
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => AICourse.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch AI courses');
  }
  
  Future<AICourse> getAICourseDetails(String courseId) async {
    final response = await get('/aiCourses/$courseId');
    if (response['success']) {
      return AICourse.fromJson(response['data']);
    }
    throw Exception(response['error'] ?? 'AI Course not found');
  }
  
  // Challenges
  Future<List<Challenge>> getChallenges({bool? isActive}) async {
    final queryParams = <String, String>{};
    if (isActive != null) queryParams['isActive'] = isActive.toString();
    
    final response = await get('/challenges', queryParams: queryParams);
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Challenge.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch challenges');
  }
  
  Future<Challenge> getChallengeDetails(String challengeId) async {
    final response = await get('/challenges/$challengeId');
    if (response['success']) {
      return Challenge.fromJson(response['data']);
    }
    throw Exception(response['error'] ?? 'Challenge not found');
  }
  
  // Prompts
  Future<List<Prompt>> getPrompts({String? category, String? tool}) async {
    final queryParams = <String, String>{};
    if (category != null) queryParams['category'] = category;
    if (tool != null) queryParams['tool'] = tool;
    
    final response = await get('/prompts', queryParams: queryParams);
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Prompt.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch prompts');
  }
  
  // Users
  Future<User> getUser(String userId) async {
    final response = await get('/users/$userId');
    if (response['success']) {
      return User.fromJson(response['data']);
    }
    throw Exception(response['error'] ?? 'User not found');
  }
  
  Future<void> updateUserProgress(String userId, Map<String, dynamic> progress) async {
    await put('/users/$userId', progress);
  }
  
  // Payments
  Future<void> createPayment(Map<String, dynamic> paymentData) async {
    final response = await post('/payments', paymentData);
    if (!response['success']) {
      throw Exception(response['error'] ?? 'Failed to create payment');
    }
  }
  
  Future<List<Payment>> getUserPayments(String userId) async {
    final response = await get('/payments', queryParams: {'userId': userId});
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Payment.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch payments');
  }
  
  // Certificates
  Future<List<Certificate>> getUserCertificates(String userId) async {
    final response = await get('/certificates', queryParams: {'userId': userId});
    if (response['success']) {
      return (response['data'] as List)
          .map((item) => Certificate.fromJson(item))
          .toList();
    }
    throw Exception(response['error'] ?? 'Failed to fetch certificates');
  }
}
```

---

## Data Models for Flutter

### Course Model

```dart
class Course {
  final String id;
  final String title;
  final String heading;
  final String? subHeading;
  final String type;
  final String category;
  final String? photo;
  final bool isActive;
  final List<Lesson>? lessons;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  Course({
    required this.id,
    required this.title,
    required this.heading,
    this.subHeading,
    required this.type,
    required this.category,
    this.photo,
    required this.isActive,
    this.lessons,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['_id'],
      title: json['title'],
      heading: json['heading'],
      subHeading: json['subHeading'],
      type: json['type'],
      category: json['category'] ?? 'General',
      photo: json['photo'],
      isActive: json['isActive'] ?? true,
      lessons: json['lessons'] != null
          ? (json['lessons'] as List).map((l) => Lesson.fromJson(l)).toList()
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
```

### Lesson Model

```dart
class Lesson {
  final String id;
  final String courseId;
  final String title;
  final String content;
  final int order;
  final bool isInteractive;
  final List<String>? media;
  final List<String>? photos;
  final List<Question>? questions;
  final bool? canRead;
  final bool? canListen;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  Lesson({
    required this.id,
    required this.courseId,
    required this.title,
    required this.content,
    required this.order,
    required this.isInteractive,
    this.media,
    this.photos,
    this.questions,
    this.canRead,
    this.canListen,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['_id'],
      courseId: json['courseId'] is String 
          ? json['courseId'] 
          : json['courseId']['_id'],
      title: json['title'],
      content: json['content'],
      order: json['order'],
      isInteractive: json['isInteractive'] ?? false,
      media: json['media'] != null ? List<String>.from(json['media']) : null,
      photos: json['photos'] != null ? List<String>.from(json['photos']) : null,
      questions: json['questions'] != null
          ? (json['questions'] as List).map((q) => Question.fromJson(q)).toList()
          : null,
      canRead: json['canRead'],
      canListen: json['canListen'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class Question {
  final String question;
  final List<String> options;
  final int correctAnswer;
  final String? explanation;
  
  Question({
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.explanation,
  });
  
  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      question: json['question'],
      options: List<String>.from(json['options']),
      correctAnswer: json['correctAnswer'],
      explanation: json['explanation'],
    );
  }
}
```

---

## Quick Reference

### Most Used Endpoints for Flutter App:

1. **Get All Active Courses:**
   ```
   GET /api/courses?isActive=true
   ```

2. **Get Course with All Lessons:**
   ```
   GET /api/courses/:courseId
   ```

3. **Get Lesson Details:**
   ```
   GET /api/lessons/:lessonId
   ```

4. **Get All Active Challenges:**
   ```
   GET /api/challenges?isActive=true
   ```

5. **Get Prompts by Tool:**
   ```
   GET /api/prompts?tool=ChatGPT
   ```

6. **Get AI Mastery Paths:**
   ```
   GET /api/aiCourses
   ```

7. **Update User Progress:**
   ```
   PUT /api/users/:userId
   ```

8. **Create Payment:**
   ```
   POST /api/payments
   ```

9. **Get User Certificates:**
   ```
   GET /api/certificates?userId=:userId
   ```

---

## Notes for Flutter Integration

1. **Base64 Images:** Course `photo` and lesson `photos` are Base64 encoded strings. Use them directly in Flutter Image widgets.

2. **Populated Fields:** When fetching single items, related fields (like `lessons` in course) are automatically populated.

3. **Pagination:** Lessons API supports pagination. Use `page` and `limit` parameters.

4. **Error Handling:** Always check `success` field in response before using `data`.

5. **Date Formats:** All dates are in ISO 8601 format. Use `DateTime.parse()` in Flutter.

6. **Optional Fields:** Many fields are optional. Always use null-safe operators in Flutter.

---

**This documentation covers all APIs needed for Flutter integration!** 🚀

