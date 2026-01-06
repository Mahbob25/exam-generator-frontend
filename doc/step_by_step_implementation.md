# ALP Frontend – Step-by-Step Implementation Plan

> **Version:** 1.0  
> **Date:** January 6, 2026  
> **Reference:** [alp_frontend_architecture.md](./alp_frontend_architecture.md)

---

## Overview

This document breaks down the ALP frontend architecture into **implementable stages**. Each stage is self-contained, testable, and builds upon the previous one. Follow these stages sequentially for smooth implementation.

---

## Stage 1: Project Foundation & Folder Structure

**Goal:** Establish the scalable folder structure without breaking existing functionality.

### Tasks

#### 1.1 Create New Directory Structure
```
frontend/
├── features/           # NEW: Feature modules
│   ├── auth/
│   ├── curriculum/
│   ├── learning/
│   ├── exam-generator/
│   └── progress/
├── components/
│   ├── ui/             # NEW: Primitive UI components
│   ├── layout/         # NEW: Layout components
│   └── shared/         # NEW: Shared utilities
├── lib/
│   ├── api/            # NEW: Modular API layer
│   ├── firebase/       # NEW: Firebase config
│   ├── store/          # NEW: Zustand stores
│   ├── types/          # NEW: TypeScript types
│   └── utils/          # EXISTING: Move existing utils here
├── hooks/              # NEW: Global custom hooks
├── styles/             # NEW: CSS variables & animations
└── config/             # NEW: App configuration
```

#### 1.2 Files to Create (Empty Placeholders)
- [ ] `components/ui/index.ts`
- [ ] `components/layout/index.ts`
- [ ] `components/shared/index.ts`
- [ ] `features/auth/.gitkeep`
- [ ] `features/curriculum/.gitkeep`
- [ ] `features/learning/.gitkeep`
- [ ] `features/exam-generator/.gitkeep`
- [ ] `features/progress/.gitkeep`
- [ ] `lib/api/client.ts`
- [ ] `lib/firebase/config.ts`
- [ ] `lib/store/.gitkeep`
- [ ] `lib/types/api.ts`
- [ ] `lib/types/common.ts`
- [ ] `hooks/.gitkeep`
- [ ] `styles/variables.css`
- [ ] `styles/animations.css`
- [ ] `config/constants.ts`

#### 1.3 Verification
- [ ] `npm run dev` still works
- [ ] No existing functionality is broken

---

## Stage 2: Design System & UI Primitives

**Goal:** Create reusable UI components that will be used across the platform.

### Tasks

#### 2.1 CSS Design Tokens
Create `styles/variables.css`:
- [ ] Color palette (light/dark themes)
- [ ] Spacing scale
- [ ] Border radius tokens
- [ ] Shadow tokens
- [ ] Typography scale

#### 2.2 Primitive UI Components
Create in `components/ui/`:
- [ ] `Button.tsx` – Primary, secondary, ghost variants
- [ ] `Card.tsx` – Container with shadow & radius
- [ ] `Input.tsx` – Text input with labels & error states
- [ ] `Select.tsx` – Dropdown (adapt from existing `CustomSelect`)
- [ ] `Modal.tsx` – Dialog with backdrop
- [ ] `Skeleton.tsx` – Loading placeholder
- [ ] `Toast.tsx` – Notification component (adapt existing)
- [ ] `Spinner.tsx` – Loading spinner
- [ ] `index.ts` – Barrel export

#### 2.3 Layout Components
Create in `components/layout/`:
- [ ] `Header.tsx` – Adapt from existing
- [ ] `Footer.tsx` – Adapt from existing
- [ ] `Sidebar.tsx` – New navigation sidebar
- [ ] `PageContainer.tsx` – Consistent page wrapper
- [ ] `index.ts` – Barrel export

#### 2.4 Shared Components
Create in `components/shared/`:
- [ ] `LoadingOverlay.tsx` – Adapt from existing
- [ ] `ErrorBoundary.tsx` – React error boundary
- [ ] `ProtectedRoute.tsx` – Auth guard wrapper
- [ ] `index.ts` – Barrel export

#### 2.5 Verification
- [ ] All components render correctly in isolation
- [ ] Dark/light theme works on primitives
- [ ] Components are accessible (keyboard nav, focus states)

---

## Stage 3: State Management Setup

**Goal:** Set up centralized state management with Zustand.

### Tasks

#### 3.1 Install Dependencies
```bash
npm install zustand @tanstack/react-query
```

#### 3.2 Create Zustand Stores
Create in `lib/store/`:
- [ ] `useAuthStore.ts` – User & role state
- [ ] `useUIStore.ts` – Theme, sidebar open/close
- [ ] `useLearningStore.ts` – Current learning session

#### 3.3 React Query Setup
- [ ] Create `lib/query/queryClient.ts`
- [ ] Add `QueryClientProvider` to root layout

#### 3.4 Verification
- [ ] Stores work in dev tools
- [ ] React Query DevTools accessible (dev mode)

---

## Stage 4: API Layer Refactoring

**Goal:** Create modular, type-safe API client.

### Tasks

#### 4.1 TypeScript Types
Create in `lib/types/api.ts`:
- [ ] `Subject` interface
- [ ] `Lesson` interface
- [ ] `Concept` interface
- [ ] `LearningSession` interface
- [ ] `LearningFlow` interface
- [ ] `AdaptiveRecommendation` interface
- [ ] `Progress` interface
- [ ] `ApiError` type

#### 4.2 Base API Client
Create `lib/api/client.ts`:
- [ ] `ApiError` class
- [ ] `apiClient<T>()` generic fetch wrapper
- [ ] Auth token injection
- [ ] Error response parsing
- [ ] Rate limit handling

#### 4.3 Feature-Specific API Modules
Create in `lib/api/`:
- [ ] `curriculum.ts` – getSubjects, getLessons, getConcepts
- [ ] `learning.ts` – startConcept, recordFailure, completeConcept
- [ ] `exam.ts` – Migrate existing exam generation API calls
- [ ] `index.ts` – Barrel export

#### 4.4 Migrate Existing API Code
- [ ] Extract exam generation logic from `lib/api.ts` → `lib/api/exam.ts`
- [ ] Update imports in existing components

#### 4.5 Verification
- [ ] API calls work correctly
- [ ] Error handling displays user-friendly messages
- [ ] No regressions in exam generator

---

## Stage 5: Firebase Authentication

**Goal:** Set up Firebase auth with role-based access.

### Tasks

#### 5.1 Firebase Configuration
Create `lib/firebase/config.ts`:
- [ ] Firebase app initialization (singleton)
- [ ] Export `auth` instance

#### 5.2 Auth Store Integration
Update `lib/store/useAuthStore.ts`:
- [ ] Subscribe to `onAuthStateChanged`
- [ ] Extract role from token claims
- [ ] Handle loading state

#### 5.3 Auth Provider
Create `features/auth/AuthProvider.tsx`:
- [ ] Wrap app with auth listener
- [ ] Manage session persistence

#### 5.4 Auth Components
Create in `features/auth/components/`:
- [ ] `LoginForm.tsx` – Email/password login
- [ ] `SignupForm.tsx` – Registration form
- [ ] `LogoutButton.tsx` – Sign out action

#### 5.5 Auth Pages
Create in `app/(auth)/`:
- [ ] `login/page.tsx`
- [ ] `signup/page.tsx`

#### 5.6 Route Protection
- [ ] Implement `ProtectedRoute` wrapper
- [ ] Add to dashboard layout

#### 5.7 Verification
- [ ] Login/signup flow works
- [ ] Protected routes redirect unauthenticated users
- [ ] Token refresh happens automatically

---

## Stage 6: Curriculum Browsing Feature

**Goal:** Enable students to browse subjects, lessons, and concepts.

### Tasks

#### 6.1 Curriculum Types
Create `features/curriculum/types.ts`:
- [ ] Re-export from `lib/types/api.ts`

#### 6.2 Curriculum Hooks
Create `features/curriculum/hooks/useCurriculum.ts`:
- [ ] `useSubjects()` – Fetch all subjects
- [ ] `useLessons(subjectId)` – Fetch lessons for subject
- [ ] `useConcepts(lessonId)` – Fetch concepts for lesson

#### 6.3 Curriculum Components
Create in `features/curriculum/components/`:
- [ ] `SubjectCard.tsx` – Subject display card with icon
- [ ] `SubjectGrid.tsx` – Grid of subject cards
- [ ] `LessonList.tsx` – Ordered list of lessons
- [ ] `LessonCard.tsx` – Lesson display card
- [ ] `ConceptList.tsx` – List of concepts with status
- [ ] `ConceptCard.tsx` – Concept display with progress indicator
- [ ] `Breadcrumbs.tsx` – Navigation breadcrumbs

#### 6.4 Curriculum Pages
Create in `app/(dashboard)/learn/`:
- [ ] `page.tsx` – Subject browser (main learn page)
- [ ] `[subjectId]/page.tsx` – Lesson list
- [ ] `[subjectId]/[lessonId]/page.tsx` – Concept list

#### 6.5 Verification
- [ ] Can browse subjects → lessons → concepts
- [ ] Loading states display correctly
- [ ] Empty states handled gracefully
- [ ] RTL Arabic content displays correctly

---

## Stage 7: Learning Runtime Feature (Core ALP)

**Goal:** Implement the 5-stage learning flow with adaptive support.

### Tasks

#### 7.1 Learning Types
Create `features/learning/types.ts`:
- [ ] Import types from `lib/types/api.ts`
- [ ] Define component-specific types

#### 7.2 Learning Hooks
Create in `features/learning/hooks/`:
- [ ] `useLearning.ts` – API calls (start, fail, complete)
- [ ] `useLearningProgress.ts` – Local step navigation

#### 7.3 Learning Session Components
Create in `features/learning/components/`:
- [ ] `LearningSession.tsx` – Main orchestrator
- [ ] `StepIndicator.tsx` – Progress through 5 stages
- [ ] `HookSection.tsx` – Display hook content
- [ ] `DoseSection.tsx` – Main content with media
- [ ] `ExperimentSection.tsx` – MCQ / interactive quiz
- [ ] `WhySection.tsx` – Reflection prompt
- [ ] `ExitChallenge.tsx` – Final assessment
- [ ] `AdaptiveMessage.tsx` – Failure support UI
- [ ] `CelebrationScreen.tsx` – Success animation + XP

#### 7.4 Learning Page
Create `app/(dashboard)/learn/[subjectId]/[lessonId]/[conceptId]/page.tsx`:
- [ ] Initialize learning session on mount
- [ ] Orchestrate step transitions
- [ ] Handle experiment answers
- [ ] Record failures and fetch adaptive content
- [ ] Complete concept and show celebration

#### 7.5 Verification
- [ ] Full learning flow works end-to-end
- [ ] Failure triggers adaptive content
- [ ] Completion marks concept as done
- [ ] XP/rewards display correctly
- [ ] Arabic content displays RTL

---

## Stage 8: Migrate Exam Generator Feature

**Goal:** Move existing exam generator into the feature-based structure.

### Tasks

#### 8.1 Move Components
Move from `components/` to `features/exam-generator/components/`:
- [ ] `GenerationForm.tsx`
- [ ] `QuestionCard.tsx`
- [ ] `QuestionList.tsx`
- [ ] `TopicSelector.tsx`
- [ ] `FeedbackButton.tsx`
- [ ] `FeedbackModal.tsx`
- [ ] `GeneralFeedbackModal.tsx`
- [ ] `ResultsModal.tsx`

#### 8.2 Create Feature Structure
Create in `features/exam-generator/`:
- [ ] `hooks/useExamGeneration.ts` – Extract logic from components
- [ ] `types.ts` – Question, Option, etc.
- [ ] `index.ts` – Barrel export

#### 8.3 Update Page Routes
Update `app/(dashboard)/exam-generator/`:
- [ ] `page.tsx` → Use feature components
- [ ] `history/page.tsx` → Use feature components

#### 8.4 Update Imports
- [ ] Update all import paths across the app
- [ ] Remove old component locations

#### 8.5 Verification
- [ ] Exam generation works as before
- [ ] History/feedback features work
- [ ] No broken imports

---

## Stage 9: Dashboard & Navigation

**Goal:** Create unified dashboard experience with sidebar navigation.

### Tasks

#### 9.1 Dashboard Layout
Create `app/(dashboard)/layout.tsx`:
- [ ] Sidebar navigation
- [ ] Header with user info
- [ ] Main content area
- [ ] Mobile-responsive drawer

#### 9.2 Dashboard Home
Create `app/(dashboard)/page.tsx`:
- [ ] Welcome message
- [ ] Quick actions (Continue Learning, Generate Exam)
- [ ] Recent activity (future: progress stats)

#### 9.3 Navigation Components
Update `components/layout/`:
- [ ] `Sidebar.tsx` – Navigation links
- [ ] `Header.tsx` – User avatar, logout, theme toggle

#### 9.4 Settings Page
Create `app/(dashboard)/settings/page.tsx`:
- [ ] Theme preference
- [ ] Account settings (placeholder)

#### 9.5 Verification
- [ ] Navigation works between all features
- [ ] Active link highlighting
- [ ] Mobile sidebar works (hamburger menu)
- [ ] Theme toggle persists

---

## Stage 10: Polish & Accessibility

**Goal:** Final polish, accessibility audit, and performance optimization.

### Tasks

#### 10.1 Accessibility Audit
- [ ] Keyboard navigation on all interactive elements
- [ ] ARIA labels on custom components
- [ ] Color contrast check (WCAG 2.1 AA)
- [ ] Focus indicators visible
- [ ] Screen reader testing

#### 10.2 RTL Arabic Support
- [ ] Verify all content sections support RTL
- [ ] Test mixed LTR/RTL content
- [ ] Icon mirroring for RTL

#### 10.3 Performance Optimization
- [ ] Implement dynamic imports for heavy components
- [ ] Add Skeleton loaders to all async views
- [ ] Verify no unnecessary re-renders (React DevTools)
- [ ] Bundle size analysis

#### 10.4 Error Handling
- [ ] Error boundaries on all feature modules
- [ ] User-friendly error messages
- [ ] Retry mechanisms for failed requests

#### 10.5 Loading States
- [ ] Consistent loading UI across all pages
- [ ] Skeleton loaders match content shape

#### 10.6 Final Testing
- [ ] End-to-end user flow testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing

---

## Implementation Order Summary

| Stage | Name                        | Estimated Time | Dependencies |
|-------|-----------------------------|----------------|--------------|
| 1     | Project Foundation          | 1 day          | None         |
| 2     | Design System & UI          | 2-3 days       | Stage 1      |
| 3     | State Management            | 1 day          | Stage 1      |
| 4     | API Layer Refactoring       | 1-2 days       | Stage 3      |
| 5     | Firebase Authentication     | 2 days         | Stage 3, 4   |
| 6     | Curriculum Browsing         | 2-3 days       | Stage 5      |
| 7     | Learning Runtime (Core)     | 3-4 days       | Stage 6      |
| 8     | Migrate Exam Generator      | 1-2 days       | Stage 2, 4   |
| 9     | Dashboard & Navigation      | 2 days         | Stage 6, 7, 8|
| 10    | Polish & Accessibility      | 2-3 days       | All stages   |

**Total Estimated Time:** 17-22 days (3-4 weeks with buffer)

---

## Notes for Implementation

### Stage Checkpoints
After each stage, verify:
1. ✅ `npm run build` succeeds
2. ✅ `npm run dev` works
3. ✅ Existing features not broken
4. ✅ New features work as expected

### Parallel Work Opportunities
- Stages 2 & 3 can be done in parallel
- Stage 8 (Exam Generator migration) can start after Stage 4

### Risk Areas
1. **Stage 7 (Learning Runtime)** – Most complex, requires careful testing
2. **Stage 8 (Migration)** – Risk of breaking existing functionality
3. **RTL Support** – May require adjustments throughout

---

*Ready to begin? Confirm which stage to start with!*
