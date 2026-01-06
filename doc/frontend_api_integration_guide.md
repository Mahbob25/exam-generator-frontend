# Adaptive Learning Platform – Frontend API Integration Guide

> **Version:** 1.0  
> **Last Updated:** January 6, 2026  
> **Framework:** Next.js (App Router) ↔ FastAPI Backend

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Authentication Flow](#2-authentication-flow-frontend--backend)
3. [Authorization & User Roles](#3-authorization--user-roles)
4. [Base API Configuration](#4-base-api-configuration)
5. [Curriculum Browsing APIs](#5-curriculum-browsing-apis)
6. [Learning Runtime APIs (CORE)](#6-learning-runtime-apis-core)
7. [Learning Runtime Flow (End-to-End)](#7-learning-runtime-flow-end-to-end)
8. [Adaptive Learning & Variants](#8-adaptive-learning--variants)
9. [Error Handling & UX Guidelines](#9-error-handling--ux-guidelines)
10. [Security & Frontend Responsibilities](#10-security--frontend-responsibilities)
11. [Environment Variables (Next.js)](#11-environment-variables-nextjs)
12. [Example Frontend Integration Snippets](#12-example-frontend-integration-snippets)

---

## 1. Platform Overview

### What the Platform Does

The Adaptive Learning Platform is a **concept-based learning system** designed for K-12 students. The platform structures educational content into small, digestible **concepts** that students learn through interactive experiences.

### Key Entities

| Entity     | Description                                                  |
|------------|--------------------------------------------------------------|
| **Subject** | Top-level curriculum area (e.g., "Grade 7 Science")        |
| **Lesson**  | A collection of related concepts within a subject          |
| **Concept** | The smallest unit of learning – a single idea to understand |

### How Students Learn Concepts

Each concept follows a structured **learning flow**:

1. **Hook** – An engaging opener (question, story, or fact) to capture attention
2. **Dose** – The core content explaining the concept
3. **Experiment** – An interactive exercise (MCQ, drag-drop, etc.)
4. **Why** – A prompt for students to articulate their understanding
5. **Exit Challenge** – A final assessment to confirm mastery

### What "Adaptive Learning" Means

The platform **adapts in real-time** based on student performance:

- **On failure:** The backend provides alternative explanations (simplified versions, analogies)
- **Variant rotation:** Multiple pre-generated variants exist for hooks, explanations, and analogies
- **Personalized support:** Students who struggle receive different angles on the same concept

> [!IMPORTANT]
> The **backend is the single source of truth** for all learning logic. The frontend must NEVER select learning variants or determine adaptation – it only displays what the backend provides.

### System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│   │   Frontend   │         │    Firebase  │         │   Backend    │       │
│   │   (Next.js)  │         │     Auth     │         │   (FastAPI)  │       │
│   └──────┬───────┘         └──────┬───────┘         └──────┬───────┘       │
│          │                        │                        │               │
│          │  1. Sign in            │                        │               │
│          │───────────────────────>│                        │               │
│          │                        │                        │               │
│          │  2. ID Token           │                        │               │
│          │<───────────────────────│                        │               │
│          │                        │                        │               │
│          │  3. API Request + Bearer Token                  │               │
│          │─────────────────────────────────────────────────>               │
│          │                        │                        │               │
│          │                        │  4. Verify Token       │               │
│          │                        │<───────────────────────│               │
│          │                        │                        │               │
│          │                        │  5. Token Valid + Role │               │
│          │                        │───────────────────────>│               │
│          │                        │                        │               │
│          │                        │     ┌──────────────┐   │               │
│          │                        │     │  Firestore   │   │               │
│          │                        │     │   Database   │   │               │
│          │                        │     └──────┬───────┘   │               │
│          │                        │            │           │               │
│          │                        │  6. Query  │           │               │
│          │                        │<───────────┘           │               │
│          │                        │                        │               │
│          │  7. JSON Response                               │               │
│          │<─────────────────────────────────────────────────               │
│          │                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow (Frontend → Backend)

### Overview

The platform uses **Firebase Authentication** with the following flow:

1. User signs up/in on the frontend using Firebase Web SDK
2. Frontend obtains a **Firebase ID Token**
3. Token is sent to the backend with every API request
4. Backend verifies the token using Firebase Admin SDK

### Step-by-Step Flow

#### 1. User Signs Up / Signs In

Use the Firebase Web SDK to authenticate users:

```javascript
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

// Sign up new user
await createUserWithEmailAndPassword(auth, email, password);

// Sign in existing user
await signInWithEmailAndPassword(auth, email, password);
```

#### 2. Obtain Firebase ID Token

After authentication, get the ID token to send to the backend:

```javascript
const user = auth.currentUser;
const idToken = await user.getIdToken();
```

#### 3. Send Token to Backend

Include the token in every API request using the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

Example with fetch:

```javascript
const response = await fetch('https://api.example.com/curriculum/subjects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  },
});
```

### Token Refresh

Firebase ID tokens **expire after 1 hour**. The Firebase Web SDK handles token refresh automatically.

**Best Practice:** Always call `getIdToken()` before each request to ensure you have a fresh token:

```javascript
// getIdToken(true) forces refresh if token is expired
const freshToken = await user.getIdToken(true);
```

### What Happens When Token is Invalid or Expired

| Scenario             | Backend Response                                           |
|---------------------|-----------------------------------------------------------|
| Token expired       | `401 Unauthorized` – "Token has expired. Please sign in again." |
| Token invalid       | `401 Unauthorized` – "Invalid authentication token."      |
| Token revoked       | `401 Unauthorized` – "Token has been revoked. Please sign in again." |
| No token provided   | `401 Unauthorized` – "Not authenticated"                   |

The response will include the header:
```
WWW-Authenticate: Bearer
```

**Frontend Action:** On any 401 error, prompt the user to sign in again.

---

## 3. Authorization & User Roles

### Supported Roles

| Role      | Description                                         |
|-----------|-----------------------------------------------------|
| `student` | Default role. Can browse curriculum and learn concepts. |
| `admin`   | Full access. Can do everything students can, plus content structuring and batch operations. |

### Default Role for New Users

When a user first signs up, they are assigned the **`student`** role by default.

> [!NOTE]
> Roles are stored as Firebase Custom Claims and can only be modified via the Firebase Admin SDK on the server side.

### Student Permissions

Students can:
- ✅ Browse subjects, lessons, and concepts
- ✅ Start learning a concept
- ✅ Record failures and completions
- ✅ View their own learning progress
- ❌ Cannot access admin endpoints

### Admin Permissions

Admins can:
- ✅ All student permissions
- ✅ Structure curriculum from raw text
- ✅ Batch generate learning flows
- ✅ Access admin-only endpoints

### Backend Behavior for Invalid Roles

| Scenario                      | Backend Response                                  |
|-------------------------------|---------------------------------------------------|
| Invalid/unknown role in token | Defaults to `student` role                        |
| Student accessing admin endpoint | `403 Forbidden` – "Admin access required."     |
| Missing role claim            | Defaults to `student` role                        |

---

## 4. Base API Configuration

### Base API URL

Configure the base URL as an environment variable:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

For local development:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Required HTTP Headers

Every authenticated request must include:

| Header            | Value                            | Required |
|-------------------|----------------------------------|----------|
| `Authorization`   | `Bearer <firebase_id_token>`     | Yes (for protected endpoints) |
| `Content-Type`    | `application/json`               | Yes (for POST/PUT with body) |

### Standard Error Response Structure

All API errors return a consistent JSON structure:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "concept_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

For rate limit errors:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please slow down.",
  "detail": "60/minute",
  "retry_after": "60 seconds"
}
```

### Rate Limits

| Endpoint Type        | Limit         | Examples                           |
|---------------------|---------------|-----------------------------------|
| Read endpoints      | 60/minute     | Get subjects, lessons, concepts    |
| Learning runtime    | 60/minute     | Start, fail, complete              |
| Batch operations    | 5/minute      | Batch generate (admin only)        |

---

## 5. Curriculum Browsing APIs

### 5.1 Get All Subjects

**Purpose:** Retrieve the list of all available subjects for students to browse.

| Property            | Value                            |
|---------------------|----------------------------------|
| **HTTP Method**     | `GET`                            |
| **URL**             | `/curriculum/subjects`           |
| **Authentication**  | ✅ Required                       |
| **Role Required**   | Student or Admin                  |

**Request Parameters:** None

**Response Shape:**

```json
[
  {
    "id": "7_science",
    "name": "science",
    "grade": 7,
    "display_name": "العلوم",
    "created_at": "2026-01-05T10:30:00Z"
  },
  {
    "id": "7_math",
    "name": "math",
    "grade": 7,
    "display_name": "الرياضيات",
    "created_at": "2026-01-05T10:30:00Z"
  }
]
```

**Error Cases:**

| Status Code | Scenario                           |
|-------------|-----------------------------------|
| 401         | Missing or invalid token           |

**Frontend Usage Notes:**
- Use this to populate the subject selection UI
- The `id` field is used for subsequent API calls
- `display_name` contains the Arabic display name if available

---

### 5.2 Get Lessons for a Subject

**Purpose:** Retrieve all lessons within a specific subject, ordered by sequence.

| Property            | Value                                    |
|---------------------|------------------------------------------|
| **HTTP Method**     | `GET`                                    |
| **URL**             | `/curriculum/subjects/{subject_id}/lessons` |
| **Authentication**  | ✅ Required                               |
| **Role Required**   | Student or Admin                          |

**Request Parameters:**

| Parameter     | Type   | Location | Description              |
|--------------|--------|----------|--------------------------|
| `subject_id` | string | Path     | The subject identifier   |

**Response Shape:**

```json
[
  {
    "id": "7_science_lesson1",
    "subject_id": "7_science",
    "title": "المادة وخصائصها",
    "display_name": "الدرس الأول: المادة وخصائصها",
    "order": 1,
    "created_at": "2026-01-05T10:35:00Z"
  },
  {
    "id": "7_science_lesson2",
    "subject_id": "7_science",
    "title": "حالات المادة",
    "order": 2,
    "created_at": "2026-01-05T10:35:00Z"
  }
]
```

**Error Cases:**

| Status Code | Scenario                           |
|-------------|-----------------------------------|
| 401         | Missing or invalid token           |

> [!NOTE]
> Returns an empty array `[]` if the subject has no lessons.

**Frontend Usage Notes:**
- Lessons are returned sorted by the `order` field
- Display lessons in a list/card view for navigation
- Use `lesson.id` for subsequent API calls

---

### 5.3 Get Concepts for a Lesson

**Purpose:** Retrieve all concepts within a specific lesson, ordered by sequence.

| Property            | Value                                    |
|---------------------|------------------------------------------|
| **HTTP Method**     | `GET`                                    |
| **URL**             | `/curriculum/lessons/{lesson_id}/concepts` |
| **Authentication**  | ✅ Required                               |
| **Role Required**   | Student or Admin                          |

**Request Parameters:**

| Parameter    | Type   | Location | Description             |
|-------------|--------|----------|-------------------------|
| `lesson_id` | string | Path     | The lesson identifier   |

**Response Shape:**

```json
[
  {
    "id": "7_science_lesson1_001",
    "lesson_id": "7_science_lesson1",
    "title": "تعريف المادة",
    "source_text": "المادة هي كل شيء له كتلة ويشغل حيزاً من الفراغ...",
    "order": 1,
    "created_at": "2026-01-05T10:40:00Z"
  },
  {
    "id": "7_science_lesson1_002",
    "lesson_id": "7_science_lesson1",
    "title": "خصائص المادة",
    "source_text": "للمادة خصائص متعددة منها الكتلة والحجم...",
    "order": 2,
    "created_at": "2026-01-05T10:40:00Z"
  }
]
```

**Error Cases:**

| Status Code | Scenario                           |
|-------------|-----------------------------------|
| 401         | Missing or invalid token           |

**Frontend Usage Notes:**
- Concepts are returned sorted by the `order` field
- Use `concept.id` to start learning flow
- The `title` is used for display in the concept list
- `source_text` is the original curriculum text (for reference only)

---

## 6. Learning Runtime APIs (CORE)

These are the core endpoints that power the student learning experience.

### 6.1 Start Learning a Concept

**Purpose:** Initialize a learning session for a concept. Returns the complete learning flow with adaptive recommendations.

| Property            | Value                            |
|---------------------|----------------------------------|
| **HTTP Method**     | `POST`                           |
| **URL**             | `/runtime/learn/start`           |
| **Authentication**  | ✅ Required                       |
| **Role Required**   | Student (or Admin for testing)   |

**Request Body:**

```json
{
  "concept_id": "7_science_lesson1_001"
}
```

| Field        | Type   | Required | Validation                                      |
|-------------|--------|----------|------------------------------------------------|
| `concept_id`| string | Yes      | 1-200 chars, alphanumeric with `_`, `-`, `.`   |

**Response Body:**

```json
{
  "flow": {
    "concept_id": "7_science_lesson1_001",
    "version": 1,
    "generated_at": "2026-01-05T12:00:00Z",
    "story_context": "تخيل أنك تمشي في حديقة...",
    "hooks": [
      { "type": "question", "content": "هل فكرت يومًا لماذا تطفو السفن الضخمة؟" },
      { "type": "fact", "content": "كل شيء حولك مصنوع من المادة!" },
      { "type": "story", "content": "تخيل لو اختفت كل المادة..." }
    ],
    "dose": {
      "text": "المادة هي كل شيء له كتلة ويشغل حيزاً من الفراغ...",
      "media": null
    },
    "adaptive_explain": {
      "simplified": [
        "المادة = أي شيء ملموس حولك",
        "كل ما تستطيع لمسه أو رؤيته هو مادة"
      ],
      "analogies": [
        "المادة مثل مكعبات الليغو - كل شيء مبني منها",
        "تخيل أن المادة مثل العجين - يمكن تشكيلها بأشكال مختلفة"
      ]
    },
    "experiment": {
      "type": "mcq",
      "question": "أي مما يلي يُعتبر مادة؟",
      "options": ["الهواء", "الحب", "السعادة", "الحظ"],
      "correct_index": 0
    },
    "why": {
      "prompt": "لماذا يُعتبر الهواء مادة رغم أننا لا نراه؟"
    },
    "exit_challenge": {
      "question": "اذكر ثلاثة أمثلة على المادة من حولك.",
      "answer": "أمثلة: الماء، الكتاب، الهواء"
    },
    "reward": {
      "xp": 10
    }
  },
  "progress": {
    "id": "user123_7_science_lesson1_001",
    "student_id": "user123",
    "concept_id": "7_science_lesson1_001",
    "status": "started",
    "failed_attempts": 0,
    "last_step": "hook",
    "updated_at": "2026-01-06T10:00:00Z"
  },
  "adaptive": {
    "action": "continue",
    "message": null,
    "show": null,
    "hook_index": 0,
    "current_hook": { "type": "question", "content": "هل فكرت يومًا لماذا تطفو السفن الضخمة؟" }
  }
}
```

**Response Fields Explained:**

| Field                     | Description                                                |
|---------------------------|-----------------------------------------------------------|
| `flow`                    | The complete learning flow content                        |
| `flow.hooks`              | Array of hook variants (use the one in `adaptive`)        |
| `flow.adaptive_explain`   | Simplified explanations and analogies for failures        |
| `progress`                | Student's current progress on this concept                |
| `progress.failed_attempts`| Number of times student has failed                        |
| `adaptive`                | Backend's recommendation for what to show                 |
| `adaptive.hook_index`     | Which hook to display                                     |
| `adaptive.current_hook`   | The recommended hook content to show                      |

**Error Cases:**

| Status Code | Scenario                           | Detail Message                                |
|-------------|-----------------------------------|----------------------------------------------|
| 401         | Missing or invalid token           | "Token has expired. Please sign in again."   |
| 403         | User is not a student/admin        | "Student access required."                   |
| 404         | Concept not found or no flow       | "Learning flow not found"                    |
| 422         | Invalid concept_id format          | Validation error details                     |

**Frontend Usage Notes:**
- Call this when user clicks on a concept to start learning
- Use `adaptive.current_hook` as the initial hook to display
- Store the full `flow` object for the learning session
- The `progress.failed_attempts` tells you if this is a retry

---

### 6.2 Record a Failed Attempt

**Purpose:** Report that the student failed a step. The backend returns adaptive recommendations.

| Property            | Value                            |
|---------------------|----------------------------------|
| **HTTP Method**     | `POST`                           |
| **URL**             | `/runtime/learn/fail`            |
| **Authentication**  | ✅ Required                       |
| **Role Required**   | Student (or Admin for testing)   |

**Request Body:**

```json
{
  "concept_id": "7_science_lesson1_001",
  "step": "experiment"
}
```

| Field        | Type   | Required | Valid Values                                     |
|-------------|--------|----------|--------------------------------------------------|
| `concept_id`| string | Yes      | 1-200 chars, alphanumeric with `_`, `-`, `.`     |
| `step`      | string | Yes      | `hook`, `dose`, `experiment`, `why`, `exit_challenge` |

**Response Body:**

```json
{
  "status": "recorded"
}
```

> [!NOTE]
> For adaptive content, call the `/runtime/learn/start` endpoint again after recording a failure – the backend will provide updated adaptive recommendations based on the new failure count.

**Error Cases:**

| Status Code | Scenario                           | Detail Message                                |
|-------------|-----------------------------------|----------------------------------------------|
| 401         | Missing or invalid token           | "Token has expired..."                       |
| 403         | User is not a student/admin        | "Student access required."                   |
| 422         | Invalid step value                 | Validation error details                     |

**Frontend Usage Notes:**
- Call this immediately when a student gives a wrong answer
- Valid steps: `hook`, `dose`, `experiment`, `why`, `exit_challenge`
- After recording failure, call `/runtime/learn/start` again to get updated adaptive content

---

### 6.3 Complete a Concept

**Purpose:** Mark a concept as successfully completed after the student passes the exit challenge.

| Property            | Value                            |
|---------------------|----------------------------------|
| **HTTP Method**     | `POST`                           |
| **URL**             | `/runtime/learn/complete`        |
| **Authentication**  | ✅ Required                       |
| **Role Required**   | Student (or Admin for testing)   |

**Request Body:**

```json
{
  "concept_id": "7_science_lesson1_001"
}
```

| Field        | Type   | Required | Validation                                       |
|-------------|--------|----------|--------------------------------------------------|
| `concept_id`| string | Yes      | 1-200 chars, alphanumeric with `_`, `-`, `.`     |

**Response Body:**

```json
{
  "status": "completed"
}
```

**Error Cases:**

| Status Code | Scenario                           | Detail Message                                |
|-------------|-----------------------------------|----------------------------------------------|
| 401         | Missing or invalid token           | "Token has expired..."                       |
| 403         | User is not a student/admin        | "Student access required."                   |
| 422         | Invalid concept_id format          | Validation error details                     |

**Frontend Usage Notes:**
- Call this ONLY after the student successfully completes the exit challenge
- This updates the student's progress status to "completed"
- Display celebration/success UI after this call succeeds
- If the student had failures before completing, they earn bonus XP (handled by backend display logic)

---

## 7. Learning Runtime Flow (End-to-End)

This section describes the complete user journey from opening a concept to completion.

### Step-by-Step Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    LEARNING SESSION FLOW                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. Student clicks on a concept                                            │
│                    │                                                       │
│                    ▼                                                       │
│  2. Frontend calls POST /runtime/learn/start                               │
│                    │                                                       │
│                    ▼                                                       │
│  3. Backend returns:                                                       │
│     • Complete learning flow (all steps)                                   │
│     • Current progress (failures, status)                                  │
│     • Adaptive recommendation (which hook to show)                         │
│                    │                                                       │
│                    ▼                                                       │
│  4. Frontend displays HOOK from adaptive.current_hook                      │
│                    │                                                       │
│                    ▼                                                       │
│  5. Student proceeds to DOSE (main content)                                │
│                    │                                                       │
│                    ▼                                                       │
│  6. Student attempts EXPERIMENT (interactive quiz)                         │
│                    │                                                       │
│              ┌─────┴─────┐                                                 │
│              │           │                                                 │
│         CORRECT      INCORRECT                                             │
│              │           │                                                 │
│              ▼           ▼                                                 │
│           Continue    POST /runtime/learn/fail                             │
│              │           │                                                 │
│              │           ▼                                                 │
│              │       POST /runtime/learn/start (get updated adaptive)      │
│              │           │                                                 │
│              │           ▼                                                 │
│              │       Show adaptive content (simplified/analogy)            │
│              │           │                                                 │
│              │           ▼                                                 │
│              │       Student retries experiment                            │
│              │           │                                                 │
│              └───────────┘                                                 │
│                    │                                                       │
│                    ▼                                                       │
│  7. Student completes WHY section (reflection)                             │
│                    │                                                       │
│                    ▼                                                       │
│  8. Student attempts EXIT CHALLENGE                                        │
│                    │                                                       │
│              ┌─────┴─────┐                                                 │
│         PASS         FAIL                                                  │
│              │           │                                                 │
│              ▼           ▼                                                 │
│  9. POST /runtime/learn/complete     (retry with adaptive support)         │
│              │                                                             │
│              ▼                                                             │
│  10. Show success/celebration UI                                           │
│              │                                                             │
│              ▼                                                             │
│  11. Navigate to next concept or lesson completion screen                  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Steps

| # | Action | API Call | Notes |
|---|--------|----------|-------|
| 1 | Student selects concept | — | User interaction |
| 2 | Initialize learning session | `POST /runtime/learn/start` | Get flow + adaptive recommendations |
| 3 | Display hook | — | Use `adaptive.current_hook` |
| 4 | Display dose | — | Main content from `flow.dose` |
| 5 | Present experiment | — | Interactive quiz from `flow.experiment` |
| 6 | On wrong answer | `POST /runtime/learn/fail` | Record failure |
| 7 | Get updated adaptive content | `POST /runtime/learn/start` | Returns new simplified/analogy |
| 8 | Display adaptive content | — | Show `adaptive.show` content |
| 9 | Student retries | — | Retry the experiment |
| 10 | Display why section | — | From `flow.why.prompt` |
| 11 | Present exit challenge | — | From `flow.exit_challenge` |
| 12 | On successful completion | `POST /runtime/learn/complete` | Mark concept done |
| 13 | Show celebration | — | Display success UI + XP earned |

---

## 8. Adaptive Learning & Variants

### What Are Learning Variants?

The platform generates **multiple versions** of key learning elements. Each variant presents the **same concept from a different angle**, not different information.

| Variant Type    | Description                                         | Example |
|----------------|-----------------------------------------------------|---------|
| **Hooks**       | Different opening styles (question, story, fact)    | 3 variants per concept |
| **Simplified**  | Different simple explanations of the same idea      | 2-3 variants per concept |
| **Analogies**   | Different real-world comparisons                    | 2-3 variants per concept |

### Why Multiple Variants Exist

1. **Learning diversity** – Different students connect with different explanations
2. **Failure recovery** – When a student fails, show them a fresh perspective
3. **Session variety** – Returning students see different hooks, keeping it fresh

### Variant Selection Logic

#### Initial Selection (First Visit)

- The backend **randomly selects** which hook to show
- This is returned in `adaptive.hook_index` and `adaptive.current_hook`
- Random selection provides variety across students and sessions

#### Adaptive Switching (On Failure)

| Failure Count | Backend Action                                        |
|--------------|------------------------------------------------------|
| 1st failure  | Show first simplified explanation                     |
| 2nd failure  | Show an analogy + next simplified explanation         |
| 3rd+ failure | Restart from dose with rotated variants               |

#### Adaptive Response Examples

**First failure (`failed_attempts = 1`):**
```json
{
  "action": "show_simplified_explain",
  "show": "المادة = أي شيء ملموس حولك",
  "message": "خلّينا نعيدها بطريقة أبسط 👌"
}
```

**Second failure (`failed_attempts = 2`):**
```json
{
  "action": "show_analogy",
  "show": "المادة مثل مكعبات الليغو - كل شيء مبني منها",
  "simplified": "كل ما تستطيع لمسه أو رؤيته هو مادة",
  "message": "خلّينا نفهمها بتشبيه بسيط 👇",
  "suggest_chat": true
}
```

**Third+ failure (`failed_attempts >= 3`):**
```json
{
  "action": "restart_from_dose",
  "show": "تخيل أن المادة مثل العجين - يمكن تشكيلها بأشكال مختلفة",
  "simplified": "المادة هي كل شيء تستطيع وزنه أو لمسه",
  "message": "واضح إن الفكرة تحتاج مراجعة بسيطة، نرجع لها معًا 👍"
}
```

**Completion after struggle:**
```json
{
  "action": "celebrate_resilience",
  "message": "رائع! واضح أنك فهمت الفكرة رغم الصعوبة 👏",
  "bonus_xp": 5
}
```

> [!CAUTION]
> **Frontend must NEVER:**
> - Select which variant to display
> - Store variant preferences locally
> - Implement any adaptation logic
> - Override backend recommendations

Always use the `adaptive` object from the backend response.

---

## 9. Error Handling & UX Guidelines

### HTTP Error Codes

| Status Code | Error Type        | Meaning                                   |
|-------------|-------------------|------------------------------------------|
| 400         | Bad Request       | Malformed request body                    |
| 401         | Unauthorized      | Token missing, invalid, or expired        |
| 403         | Forbidden         | User role lacks permission                |
| 404         | Not Found         | Resource doesn't exist                    |
| 422         | Validation Error  | Request body failed validation            |
| 429         | Rate Limited      | Too many requests                         |
| 500         | Server Error      | Unexpected backend error                  |
| 503         | Service Unavailable | Backend service issue                   |

### Authentication Errors (401)

**When:** Token expired, invalid, or revoked

**Action:**
1. Clear cached token
2. Show login prompt
3. Redirect to login page

```typescript
if (response.status === 401) {
  await auth.signOut();
  router.push('/login?redirect=' + currentPath);
}
```

### Authorization Errors (403)

**When:** User role doesn't have permission

**Action:**
1. Show friendly error message
2. Do NOT redirect to login (user IS authenticated)
3. Navigate back or to allowed area

```typescript
if (response.status === 403) {
  toast.error('You don\'t have permission to access this feature');
  router.back();
}
```

### Learning-Related Errors

| Error                    | Recovery Strategy                           |
|-------------------------|---------------------------------------------|
| Concept not found (404) | Show "content not available" message         |
| Flow not generated (404)| Hide concept or show "coming soon"           |
| Validation error (422)  | Fix request format (shouldn't happen in prod)|

### Network & Timeout Handling

```typescript
try {
  const response = await fetchWithTimeout(url, options, 10000);
  // Handle response
} catch (error) {
  if (error.name === 'AbortError') {
    toast.error('Request timed out. Please try again.');
  } else if (!navigator.onLine) {
    toast.error('No internet connection.');
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

### Rate Limiting (429)

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After') || '60';
  toast.error(`Too many requests. Please wait ${retryAfter} seconds.`);
}
```

### UX Recommendations

#### Loading States

| State             | UI Pattern                              |
|-------------------|----------------------------------------|
| Starting concept  | Full-screen skeleton loader + spinner   |
| Recording failure | Subtle inline spinner                   |
| Completing concept| Button disabled + spinner               |

#### Retry Behavior

| Error Type        | Retry                  | User Action               |
|-------------------|------------------------|---------------------------|
| Network timeout   | Auto-retry 1x          | Manual "Try again" button |
| 500 errors        | Auto-retry 1x after 2s | Manual retry              |
| 401 errors        | Never                  | Re-authenticate           |
| 422 errors        | Never                  | Fix input (shouldn't happen)|

#### Error Messaging

| Technical Error              | User-Friendly Message                        |
|------------------------------|---------------------------------------------|
| "Token has expired..."       | "Your session has expired. Please sign in again." |
| "Learning flow not found"    | "This lesson isn't ready yet. Try another!"  |
| "rate_limit_exceeded"        | "Slow down! Take a moment before continuing." |
| "Network error"              | "Connection lost. Check your internet and try again." |

---

## 10. Security & Frontend Responsibilities

### What the Frontend Must NOT Do

| ❌ Never Do This                           | ✅ Do This Instead                        |
|--------------------------------------------|------------------------------------------|
| Store role in localStorage/client state    | Always check role from token claims       |
| Implement adaptation/variant logic         | Use `adaptive` object from backend        |
| Trust user ID from URL params              | Use authenticated user's UID              |
| Cache sensitive data indefinitely          | Clear on logout; refresh on session       |
| Skip token on "public" endpoints           | All curriculum endpoints require auth     |
| Modify learning progress locally           | All progress is server-side only          |

### Why Roles Cannot Be Trusted Client-Side

1. **Tokens can be forged** if you trust client-provided roles
2. **Backend always verifies** the token and extracts claims itself
3. **UI-only role checks are for UX**, not security
4. **Admin routes must still fail** even if hidden from non-admin UI

### Token Storage Best Practices

| ✅ Do                                        | ❌ Don't                                   |
|---------------------------------------------|------------------------------------------|
| Let Firebase SDK manage token in memory      | Store token in localStorage              |
| Call `getIdToken()` before each request      | Cache token for extended periods         |
| Refresh token silently when needed           | Ignore token expiration                  |
| Clear state on logout                        | Keep any auth data after signout         |

### Backend Logic Must Never Be Duplicated

The frontend should render what the backend provides. Never:

- Calculate which variant to show
- Determine adaptation based on failure count
- Validate whether a concept is "complete"
- Compute XP or rewards

---

## 11. Environment Variables (Next.js)

### Required Environment Variables

Create a `.env.local` file in your Next.js project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Example `.env.local` File

```bash
# ===========================================
# Learning Platform - Frontend Configuration
# ===========================================

# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration
# Get these from Firebase Console > Project Settings > Your Apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC_your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Public vs Private Variables

| Variable                              | Prefix              | Exposed to Browser? |
|---------------------------------------|---------------------|---------------------|
| `NEXT_PUBLIC_API_URL`                 | `NEXT_PUBLIC_`      | ✅ Yes               |
| `NEXT_PUBLIC_FIREBASE_*`              | `NEXT_PUBLIC_`      | ✅ Yes               |
| Server-only secrets                   | No prefix           | ❌ No                |

> [!WARNING]
> All `NEXT_PUBLIC_` variables are exposed to the browser. Never put API keys, database credentials, or other secrets in public variables.

---

## 12. Example Frontend Integration Snippets

### 12.1 Firebase Auth Setup

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
```

### 12.2 Authenticated Fetch Wrapper

```typescript
// lib/api.ts
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new ApiError(401, 'Not authenticated');
  }
  
  // Always get fresh token
  const token = await user.getIdToken(true);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail);
  }

  return response.json();
}
```

### 12.3 Start Learning a Concept

```typescript
// hooks/useLearning.ts
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface LearningSession {
  flow: LearningFlow;
  progress: Progress;
  adaptive: AdaptiveRecommendation;
}

export function useLearning() {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConcept = async (conceptId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch<LearningSession>('/runtime/learn/start', {
        method: 'POST',
        body: JSON.stringify({ concept_id: conceptId }),
      });
      
      setSession(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start learning';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { session, isLoading, error, startConcept };
}
```

### 12.4 Record a Failure

```typescript
// hooks/useLearning.ts (continued)

type Step = 'hook' | 'dose' | 'experiment' | 'why' | 'exit_challenge';

const recordFailure = async (conceptId: string, step: Step) => {
  try {
    await apiFetch('/runtime/learn/fail', {
      method: 'POST',
      body: JSON.stringify({ 
        concept_id: conceptId, 
        step: step 
      }),
    });
    
    // After recording failure, refresh session to get updated adaptive content
    const updatedSession = await apiFetch<LearningSession>('/runtime/learn/start', {
      method: 'POST',
      body: JSON.stringify({ concept_id: conceptId }),
    });
    
    setSession(updatedSession);
    return updatedSession;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record attempt';
    setError(message);
    throw err;
  }
};
```

### 12.5 Complete a Concept

```typescript
// hooks/useLearning.ts (continued)

const completeConcept = async (conceptId: string) => {
  setIsLoading(true);
  
  try {
    const response = await apiFetch<{ status: string }>('/runtime/learn/complete', {
      method: 'POST',
      body: JSON.stringify({ concept_id: conceptId }),
    });
    
    // Clear session after completion
    setSession(null);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to complete concept';
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

### 12.6 Full Learning Hook Example

```typescript
// hooks/useLearning.ts (complete)
import { useState, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/api';

interface Hook {
  type: string;
  content: string;
}

interface AdaptiveRecommendation {
  action: string;
  message: string | null;
  show: string | null;
  hook_index: number;
  current_hook: Hook;
  bonus_xp?: number;
  suggest_chat?: boolean;
}

interface LearningFlow {
  concept_id: string;
  hooks: Hook[];
  dose: { text: string; media: null | { type: string; url: string } };
  experiment: {
    type: string;
    question: string;
    options: string[];
    correct_index: number;
  };
  why: { prompt: string };
  exit_challenge: { question: string; answer: string };
  reward: { xp: number };
}

interface Progress {
  status: string;
  failed_attempts: number;
  last_step: string;
}

interface LearningSession {
  flow: LearningFlow;
  progress: Progress;
  adaptive: AdaptiveRecommendation;
}

type Step = 'hook' | 'dose' | 'experiment' | 'why' | 'exit_challenge';

export function useLearning() {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConcept = useCallback(async (conceptId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch<LearningSession>('/runtime/learn/start', {
        method: 'POST',
        body: JSON.stringify({ concept_id: conceptId }),
      });
      setSession(response);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to start learning');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordFailure = useCallback(async (conceptId: string, step: Step) => {
    try {
      await apiFetch('/runtime/learn/fail', {
        method: 'POST',
        body: JSON.stringify({ concept_id: conceptId, step }),
      });
      
      // Refresh to get updated adaptive content
      const updated = await apiFetch<LearningSession>('/runtime/learn/start', {
        method: 'POST',
        body: JSON.stringify({ concept_id: conceptId }),
      });
      setSession(updated);
      return updated;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      }
      throw err;
    }
  }, []);

  const completeConcept = useCallback(async (conceptId: string) => {
    setIsLoading(true);
    try {
      const response = await apiFetch<{ status: string }>('/runtime/learn/complete', {
        method: 'POST',
        body: JSON.stringify({ concept_id: conceptId }),
      });
      setSession(null);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    session,
    isLoading,
    error,
    startConcept,
    recordFailure,
    completeConcept,
    clearError,
  };
}
```

### 12.7 Usage in a Component

```tsx
// app/learn/[conceptId]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLearning } from '@/hooks/useLearning';

export default function LearnConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const router = useRouter();
  const { 
    session, 
    isLoading, 
    error, 
    startConcept, 
    recordFailure, 
    completeConcept 
  } = useLearning();

  useEffect(() => {
    if (conceptId) {
      startConcept(conceptId);
    }
  }, [conceptId, startConcept]);

  const handleWrongAnswer = async () => {
    await recordFailure(conceptId, 'experiment');
    // UI will update with session.adaptive.show and session.adaptive.message
  };

  const handleComplete = async () => {
    await completeConcept(conceptId);
    router.push('/lesson-complete');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!session) return null;

  return (
    <div>
      {/* Display hook */}
      <HookSection hook={session.adaptive.current_hook} />
      
      {/* Display adaptive message if present */}
      {session.adaptive.message && (
        <AdaptiveMessage 
          message={session.adaptive.message}
          show={session.adaptive.show}
        />
      )}
      
      {/* Main content */}
      <DoseSection dose={session.flow.dose} />
      
      {/* Interactive experiment */}
      <ExperimentSection 
        experiment={session.flow.experiment}
        onWrongAnswer={handleWrongAnswer}
        onCorrectAnswer={() => { /* proceed to why section */ }}
      />
      
      {/* Exit challenge */}
      <ExitChallenge 
        challenge={session.flow.exit_challenge}
        onComplete={handleComplete}
      />
    </div>
  );
}
```

---

## Quick Reference Card

### API Endpoints Summary

| Purpose               | Method | Endpoint                                | Auth |
|-----------------------|--------|-----------------------------------------|------|
| List subjects         | GET    | `/curriculum/subjects`                  | ✅    |
| List lessons          | GET    | `/curriculum/subjects/{id}/lessons`     | ✅    |
| List concepts         | GET    | `/curriculum/lessons/{id}/concepts`     | ✅    |
| Start learning        | POST   | `/runtime/learn/start`                  | ✅    |
| Record failure        | POST   | `/runtime/learn/fail`                   | ✅    |
| Complete concept      | POST   | `/runtime/learn/complete`               | ✅    |

### Request Template

```bash
curl -X POST https://api.example.com/runtime/learn/start \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"concept_id": "7_science_lesson1_001"}'
```

### Error Response Status Codes

| Code | Meaning                 | Action                    |
|------|-------------------------|---------------------------|
| 401  | Unauthenticated         | Re-login                  |
| 403  | Unauthorized            | Show permission error     |
| 404  | Not found               | Show "not available"      |
| 422  | Validation failed       | Fix request format        |
| 429  | Rate limited            | Wait and retry            |
| 500  | Server error            | Retry or report           |

---

*End of Document*
