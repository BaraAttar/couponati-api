# Couponati API 🏷️

A bilingual (Arabic/English) Backend system for managing stores, coupons, and real-time engagement analytics. Built with **Node.js**, **TypeScript**, and **MongoDB**.

## 🚀 Key Features
*   **Bilingual Content:** Full support for AR/EN names and descriptions with automatic language detection via headers.
*   **Analytics Engine:** Tracks store views and coupon usage (clicks/copies) with daily reporting.
*   **Security First:** Integrated XSS sanitization, Rate Limiting, and strict Zod validation.
*   **Authentication:** Dual-gate system: Google OAuth for Users and Secure Login for Admins.
*   **Admin Dashboard:** Comprehensive KPIs and chart data for store performance and active coupons.

## 🛠️ Tech Stack
*   **Backend:** Node.js, Express, TypeScript.
*   **Database:** MongoDB + Mongoose.
*   **Validation:** Zod (Request & Data integrity).
*   **Auth:** JWT & Google Auth Library.

## ⚙️ Quick Setup

1.  **Install:** `npm install`
2.  **Environment:** Create a `.env` file:
    ```env
    PORT=3000
    MONGODB_URI=your_mongo_url
    JWT_SECRET=your_secret
    GOOGLE_WEB_CLIENT_ID=...
    GOOGLE_ANDROID_CLIENT_ID=...
    GOOGLE_IOS_CLIENT_ID=...
    ```
3.  **Run:** `npm run dev` (Development) or `npm start` (Production).

## 📂 API Architecture (Endpoints)
*   **Auth:** `/auth` (User Google login) & `/admin/auth` (Admin login).
*   **Public:** `/store`, `/coupon`, `/category`, `/banner` (General access).
*   **User:** `/user/store` (Protected favorites management).
*   **Admin:** `/admin/store`, `/admin/coupon`, `/admin/category`, `/admin/report`.
*   **Analytics:** `/analytics/track` (Event tracking).

## 🛡️ Security Highlights
*   **Rate Limiting:** General API (200 req/min) | Auth (5 attempts/5 mins).
*   **XSS Protection:** Custom Zod middleware sanitizes all incoming text data.
*   **Data Integrity:** Automated display ordering and linked-entity deletion protection.

---
**Couponati API - Efficient. Secure. Bilingual.**
