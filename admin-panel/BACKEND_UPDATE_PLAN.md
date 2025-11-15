# 🔧 Backend & Admin Portal Update Plan

## 📋 Overview
This document outlines all changes needed to align the backend API with frontend expectations.

---

## ✅ Current Status Analysis

### What's Working ✅
- ✅ Response format structure (`success`, `data`, `error`)
- ✅ Basic CRUD operations for all endpoints
- ✅ Query parameter filtering (isActive, type, level)
- ✅ Error handling structure
- ✅ MongoDB connection and models

### What Needs Fixing ❌

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. **Model Schema Issues**

#### **Course Model** (`lib/db/models/Course.ts`)
- ❌ **Type enum mismatch**: 
  - Current: `'simple' | 'mastery-path' | 'challenge' | 'prompt-suggested'`
  - Frontend expects: `'simple' | 'challenge' | 'mastery'`
  - **Fix**: Remove `'mastery-path'` and `'prompt-suggested'`, add `'mastery'` (but mastery courses use AICourse model)

#### **AICourse Model** (`lib/db/models/AICourse.ts`)
- ❌ **Type enum mismatch**:
  - Current: `'mastery-path'`
  - Frontend expects: `'mastery'`
  - **Fix**: Change to `'mastery'`

#### **Challenge Model** (`lib/db/models/Challenge.ts`)
- ❌ **Missing `explanation` field in questions**:
  - Current: `IInteractiveQuestion` has no `explanation`
  - Frontend expects: `explanation?: string` in questions
  - **Fix**: Add `explanation` field to question schema

#### **Lesson Model** (`lib/db/models/Lesson.ts`)
- ❌ **Missing `updatedAt` field**:
  - Current: Only has `createdAt` (timestamps: `{ createdAt: true, updatedAt: false }`)
  - Frontend expects: Both `createdAt` and `updatedAt`
  - **Fix**: Enable `updatedAt` in timestamps

- ❌ **Missing `explanation` field in questions**:
  - Current: `IQuestion` has no `explanation`
  - Frontend expects: `explanation?: string` in questions
  - **Fix**: Add `explanation` field to question schema

#### **Prompt Model** (`lib/db/models/Prompt.ts`)
- ❌ **Category enum completely wrong**:
  - Current: `'Life' | 'Business' | 'Creativity' | 'Work'`
  - Frontend expects: `'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education'`
  - **Fix**: Replace entire category enum

- ❌ **Wrong reference for relatedCourseId**:
  - Current: `ref: 'AICourse'`
  - Frontend expects: Can reference any course (should be `ref: 'Course'` or both)
  - **Fix**: Change to `ref: 'Course'` or make it flexible

---

### 2. **API Route Issues**

#### **GET /api/courses** (`app/api/courses/route.ts`)
- ❌ **Missing query parameters**:
  - Missing: `category` filter
  - Missing: `search` parameter
  - Missing: `pagination` support (page, limit)
  - **Fix**: Add all missing query parameters

#### **GET /api/aiCourses** (`app/api/aiCourses/route.ts`)
- ❌ **Missing query parameters**:
  - Missing: `isActive` filter
  - Missing: `aiTool` filter
  - Missing: `category` filter
  - Missing: `search` parameter
  - Missing: `pagination` support
  - **Fix**: Add all missing query parameters

#### **GET /api/challenges** (`app/api/challenges/route.ts`)
- ❌ **Missing query parameters**:
  - Missing: `search` parameter
  - Missing: `pagination` support
- ❌ **Missing population**:
  - `interactiveQuestions.lessonId` is not populated
  - **Fix**: Add `.populate('interactiveQuestions.lessonId')`

#### **GET /api/lessons/:id** (`app/api/lessons/[id]/route.ts`)
- ❌ **Missing population**:
  - `courseId` is not populated
  - **Fix**: Add `.populate('courseId')`

#### **GET /api/prompts** (`app/api/prompts/route.ts`)
- ❌ **Missing query parameters**:
  - Missing: `search` parameter
  - Missing: `pagination` support
- ❌ **Missing population**:
  - `relatedCourseId` is not populated
  - **Fix**: Add `.populate('relatedCourseId')`

#### **GET /api/lessons** (`app/api/lessons/route.ts`)
- ⚠️ **Pagination field name**:
  - Current: `pages: Math.ceil(total / limit)`
  - Frontend expects: `totalPages: Math.ceil(total / limit)`
  - **Fix**: Change `pages` to `totalPages`

---

## 📝 DETAILED FIX PLAN

### Phase 1: Model Schema Fixes (Critical)

#### 1.1 Fix Course Model
```typescript
// Change type enum from:
type: 'simple' | 'mastery-path' | 'challenge' | 'prompt-suggested'
// To:
type: 'simple' | 'challenge'  // mastery courses use AICourse model
```

#### 1.2 Fix AICourse Model
```typescript
// Change type enum from:
type: 'mastery-path'
// To:
type: 'mastery'
```

#### 1.3 Fix Challenge Model
```typescript
// Add explanation to IInteractiveQuestion:
export interface IInteractiveQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;  // ADD THIS
}
```

#### 1.4 Fix Lesson Model
```typescript
// 1. Enable updatedAt:
timestamps: { createdAt: true, updatedAt: true }  // Change from false to true

// 2. Add explanation to IQuestion:
export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;  // ADD THIS
}
```

#### 1.5 Fix Prompt Model
```typescript
// 1. Change category enum:
category: {
  type: String,
  enum: [
    'basic_applications',
    'productivity',
    'sales',
    'ecommerce',
    'investing',
    'web_dev',
    'customer_support',
    'cro',
    'daily_life',
    'tech',
    'education'
  ],
  required: true,
}

// 2. Change relatedCourseId ref:
relatedCourseId: {
  type: Schema.Types.ObjectId,
  ref: 'Course',  // Change from 'AICourse' to 'Course'
}
```

---

### Phase 2: API Route Updates

#### 2.1 Update GET /api/courses
```typescript
// Add query parameters:
const category = searchParams.get('category');
const search = searchParams.get('search');
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');

// Add to query:
if (category) query.category = category;

// Add search:
if (search) {
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { heading: { $regex: search, $options: 'i' } }
  ];
}

// Add pagination:
const skip = (page - 1) * limit;
const total = await Course.countDocuments(query);
const courses = await Course.find(query)
  .populate('lessons')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

// Add pagination to response:
return NextResponse.json({
  success: true,
  data: courses,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});
```

#### 2.2 Update GET /api/aiCourses
```typescript
// Add all query parameters:
const { searchParams } = new URL(request.url);
const isActive = searchParams.get('isActive');
const aiTool = searchParams.get('aiTool');
const category = searchParams.get('category');
const search = searchParams.get('search');
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');

// Build query and add pagination (similar to courses)
```

#### 2.3 Update GET /api/challenges
```typescript
// Add search parameter and pagination
// Add population for interactiveQuestions.lessonId:
.populate('interactiveQuestions.lessonId')
```

#### 2.4 Update GET /api/lessons/:id
```typescript
// Add population:
const lesson = await Lesson.findById(id).populate('courseId');
```

#### 2.5 Update GET /api/prompts
```typescript
// Add search parameter and pagination
// Add population:
.populate('relatedCourseId')
```

#### 2.6 Fix GET /api/lessons pagination
```typescript
// Change:
pages: Math.ceil(total / limit)
// To:
totalPages: Math.ceil(total / limit)
```

---

## 🎯 Implementation Order

1. **First**: Fix all Model Schemas (Phase 1)
   - This ensures data structure is correct
   - Models are the foundation

2. **Second**: Update API Routes (Phase 2)
   - Add missing query parameters
   - Add missing population
   - Fix pagination field names

3. **Third**: Test each endpoint
   - Verify response format
   - Verify all fields are present
   - Verify query parameters work

---

## ⚠️ Important Notes

### Data Migration Considerations
- **AICourse type change**: Existing documents with `type: 'mastery-path'` need to be migrated to `type: 'mastery'`
- **Prompt category change**: Existing prompts with old categories need to be migrated to new categories
- **Lesson updatedAt**: Existing lessons without `updatedAt` will get it automatically on next update

### Backward Compatibility
- Some changes might break existing admin panel functionality
- Need to update admin panel forms/dropdowns to match new enums

---

## 📊 Summary

### Files to Modify:
1. `lib/db/models/Course.ts` - Fix type enum
2. `lib/db/models/AICourse.ts` - Fix type enum
3. `lib/db/models/Challenge.ts` - Add explanation field
4. `lib/db/models/Lesson.ts` - Add updatedAt, add explanation field
5. `lib/db/models/Prompt.ts` - Fix category enum, fix ref
6. `app/api/courses/route.ts` - Add query params, pagination
7. `app/api/aiCourses/route.ts` - Add query params, pagination
8. `app/api/challenges/route.ts` - Add search, pagination, populate
9. `app/api/lessons/[id]/route.ts` - Add populate
10. `app/api/prompts/route.ts` - Add search, pagination, populate
11. `app/api/lessons/route.ts` - Fix pagination field name

### Total Changes: 11 files

---

## ✅ Ready to Proceed?

Once you approve this plan, I will:
1. Fix all model schemas first
2. Update all API routes
3. Ensure everything matches frontend expectations
4. Test response formats

**Should I proceed with implementation?**

