# SkillBridge Project Modifications Summary

This document details all the enhancements and updates implemented in the SkillBridge application today. The changes cover database schemas, authentication configuration, backend API routes, and modern glassmorphic dashboard views.

---

## 1. Advanced DSA Tracker Module

### 📂 Created Files:
* **Mongoose Schema**: [DsaTracker.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/models/DsaTracker.ts)
* **Backend API Route (Get/Put/Post)**: [route.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/api/dsa-tracker/route.ts)
* **Backend API Route (CRUD Problems)**: [route.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/api/dsa-tracker/problems/%5Bid%5D/route.ts)
* **Frontend Dashboard**: [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/dsa-tracker/page.tsx)

### 💡 Details:
1. **Schema Design**: Built a comprehensive DSA tracking schema to monitor user progress. It houses platform ratings (LeetCode, CodeChef, Codeforces, HackerRank, GeeksforGeeks), daily streaks, target company tiers (Tier 1: Google/MS/Amazon, etc.), solved count metrics (Easy, Medium, Hard), and problem logs.
2. **REST Endpoints**: Implemented API handlers to fetch, update, and manage DSA stats, as well as a full set of CRUD endpoints to add, edit, or delete solved problem practice logs.
3. **Interactive UI**: Added a state-of-the-art dark glassmorphic dashboard inside the dashboard menu. The view includes statistics cards, platform metrics modifiers, search-by-name problem log filters, and interactive SVG charts representing platform achievements.

---

## 2. Google & GitHub Social Login Integration

### 📂 Created/Modified Files:
* **NextAuth Configurations**: [route.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/api/auth/%5B...nextauth%5D/route.ts)
* **Login UI Form**: [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/login/page.tsx)
* **Environment variables**: [env.download](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/env.download)

### 💡 Details:
1. **OAuth Providers**: Added `GoogleProvider` and `GithubProvider` to the NextAuth handler.
2. **Auto-Registration Database Hooks**: Added a custom `signIn` handler callback. When a student signs in via Google or GitHub for the first time, the callback automatically registers a new User document in MongoDB using secure random passwords and default fields to comply with Mongoose validations.
3. **Buttons & Branding**: Added inline vector icon buttons styled with brand matching colors to the existing login card.

---

## 3. Career Target Roles Expansion

### 📂 Modified Files:
* **Profile Schema**: [Profile.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/models/Profile.ts)
* **Profile Dropdown UI**: [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/profile/page.tsx)
* **Dashboard Skills Mapping & Points Calculations**:
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/page.tsx) (overview)
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/readiness/page.tsx) (readiness points)
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/skill-gap/page.tsx) (gap resources)
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/roadmap/page.tsx) (study plans)
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/analytics/page.tsx) (charts)
  * [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/(admin-dashboard)/admin/page.tsx) (KPIs)

### 💡 Details:
1. **New Job Profiles**: Added validation options to support **Machine Learning Engineer**, **DevOps Engineer**, **Cloud Architect**, **Cybersecurity Analyst**, and **Mobile Developer**.
2. **Point Sync**: Synchronized the target skills mapping (`ROLE_SKILLS`, `SKILL_RESOURCES`) and learning paths across all six calculation and visualization routes so new profiles get fully-functional analytics.

---

## 4. Hackathons Directory

### 📂 Created/Modified Files:
* **Profile Schema**: [Profile.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/models/Profile.ts) (added `registeredHackathons: [String]`)
* **Profile REST Handler**: [route.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/api/profile/route.ts)
* **Sidebar Layout**: [layout.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/layout.tsx)
* **Hackathons Page**: [page.tsx](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/dashboard/hackathons/page.tsx)

### 💡 Details:
1. **Missing Module Fix**: Delivered the dashboard page showing active/upcoming contests (SIH 2026, Google Hash Code, MS Imagine Cup, etc.).
2. **MongoDB State Synchronization**: Added registered/interested markers that dynamically save to the user's profile schema inside MongoDB.
3. **Class Team Finder**: Implemented a classmate team finder recruitment panel to allow students to connect for team registration.

---

## 5. Study Resources Link Corrections

### 📂 Modified Files:
* **Resources Seeder & GET Route**: [route.ts](file:///c:/Users/pjha9/Documents/ALL%20Coding/Projects/SkillBridge/src/app/api/resources/route.ts)

### 💡 Details:
1. **Correct Links**: Updated Striver's DSA video playlist and sheet resources:
   * **Striver's A2Z DSA Sheet** (Website): `https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z`
   * **Striver's A2Z DSA Video Playlist** (Video): `https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&si=T3HY7x_SDhCQrLXJ`
2. **Active Database Migration**: Added logic to verify and overwrite preexisting database documents dynamically upon fetching the `/api/resources` endpoint, ensuring existing databases get patched.
