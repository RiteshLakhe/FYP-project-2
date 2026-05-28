# RentEase — Viva & Defense Preparation Guide

## Quick Summary (memorise this)
RentEase is a full-stack rental property marketplace built with the MERN stack (MongoDB, Express, React, Node.js). It supports dual-role users (tenant + landlord), JWT authentication, Cloudinary image uploads with local fallback, email enquiries, saved properties, property status management, and an admin dashboard.

---

## 1. Killer Pitch Lines

### On the dual-role system
> "Unlike Hamrobazar where a person is either a buyer or a seller, RentEase allows a single user to be both a tenant and a landlord simultaneously. When a tenant posts a property, the system automatically upgrades their role — no second account needed."

### On image quality enforcement
> "A core problem with general classifieds is low-quality listings with one blurry photo. RentEase enforces a minimum of five images at both the frontend and backend level — this cannot be bypassed."

### On security architecture
> "Authentication uses JWT tokens, bcrypt password hashing, CORS restricted to known origins, and HTTPOnly cookies. The combination addresses broken authentication, XSS, and insecure direct object references from the OWASP top threats."

### On system resilience
> "If Cloudinary is unavailable, image uploads automatically fall back to local disk storage with no interruption. If email is not configured, reset tokens are returned in the API response during development — so testing is never blocked."

### On Nepal-specific design
> "The property schema includes municipality, ward number, road type, property face, and furnishing status — fields specifically designed for how properties are described and searched in the Nepali rental market."

---

## 2. Competitor Comparison

| Feature | RentEase | Hamrobazar | Bhetghat | Realestate.com.np |
|---|---|---|---|---|
| Dual role (tenant + landlord) | ✓ | ✗ | ✗ | ✗ |
| Auto role elevation on posting | ✓ | ✗ | ✗ | ✗ |
| JWT auth + remember me | ✓ | ~ | ~ | ~ |
| Min. 5 image validation | ✓ | ✗ | ~ | ~ |
| Direct email enquiry | ✓ | ✗ | ~ | ~ |
| Save / favourite properties | ✓ | ✗ | ✗ | ✗ |
| Admin dashboard | ✓ | ~ | ✗ | ✗ |
| Property status lifecycle | ✓ | ✗ | ✗ | ✗ |
| Cloud + local image fallback | ✓ | ✗ | ✗ | ✗ |
| Password reset via email | ✓ | ~ | ✗ | ✗ |
| Nepal-specific fields (ward, municipality) | ✓ | ✗ | ~ | ~ |
| Rental-only focus | ✓ | ✗ | ~ | ~ |

✓ = supported | ✗ = not supported | ~ = partial/limited

---

## 3. Technical Q&A

### Why MongoDB over PostgreSQL?
Properties have variable attributes — residential units need bedroom counts while commercial spaces need floor load. MongoDB's flexible schema handles this without migrations. Mongoose provides validation where structure is needed.

### How does JWT authentication work?
Login → backend generates JWT with user ID, email, and role → frontend stores in HTTPOnly cookie → Axios interceptor adds Bearer token to every request header → auth middleware verifies and attaches user to req.

### How does image upload work?
Multer (memory storage) → buffer → base64 via datauri → Cloudinary upload. If `isCloudinaryConfigured` is false → save to local `/uploads/` → return local URL.

### What validation is applied?
- Frontend: 5-image check before form submission
- Backend: Multer file count check in controller
- Mongoose schema: enum validation for category/type/status, custom array validator requiring 5+ image URLs

### How does role switching work?
Backend: check if role in `user.roles[]` → if not, add it → update `currentRole` → frontend updates UserContext and rewrites cookies. Auto-elevation: createProperty controller adds 'landlord' to roles if not present.

### How does password reset work?
forgotPassword → random token → store hash + 1hr expiry on user doc → email reset link with plain token → user submits new password → verify hash + expiry → bcrypt new password → clear token fields.

### Why cookies over localStorage?
HTTPOnly cookies are inaccessible to JavaScript, preventing XSS token theft. localStorage is readable by any script on the page. Cookies also send automatically on every request; localStorage requires manual header injection.

### IDOR protection on saved properties?
getSavedProperties uses `req.user.id` from the verified JWT — not a URL parameter — so an attacker cannot substitute another user's ID.

### NoSQL injection protection?
Mongoose casts inputs to declared schema types, rejecting unexpected operator objects. Queries use specific field lookups, not raw body pass-through.

---

## 4. Architecture Talking Points

### Separation of concerns
Backend = data + business logic. Frontend = UI + user interaction. Enables independent deployment, testing, and future mobile clients consuming the same REST API.

### Why MERN?
- MongoDB: flexible schema for variable property attributes
- Express: lightweight, unopinionated REST API
- React + TypeScript: compile-time safety, component reusability
- Node.js: JavaScript across the full stack, shared knowledge

### Why React Context over Redux?
One primary shared state concern (logged-in user). Context is sufficient. Redux would be premature optimisation. Would reconsider for real-time features or complex state machines.

---

## 5. Scalability Roadmap

When examiners ask "does this scale?":

1. Add pagination on `getAllProperties` — currently returns all records
2. Redis caching for property listing queries
3. Cloudinary already externalised — scales independently
4. MongoDB Atlas supports horizontal sharding
5. REST API means mobile app (React Native) can reuse all endpoints with zero backend changes
6. WebSockets for real-time enquiry notifications

---

## 6. Biggest Challenges (have one ready)

**Image upload pipeline** — handling multipart form data in memory, converting to base64, uploading to Cloudinary asynchronously, and building the local fallback. Solved with multer memory storage + datauri parser + conditional Cloudinary check. Made the system deployable without cloud credentials.

---

## 7. Future Enhancements (have exactly 3 ready)

1. Real-time notifications via WebSockets — instant landlord alerts on enquiries
2. Payment integration — premium listing placement (monetisation path)
3. Property analytics for landlords — view counts, enquiry rates, time-on-market

---

## 8. API Endpoints Cheat Sheet

### Auth
- POST `/auth/login`
- POST `/auth/forgot-password`
- POST `/auth/reset-password/:token`

### User
- POST `/user/registerUser`
- PUT `/user/updateUser/:id` (protected)
- POST `/user/switch-role` (protected)
- POST `/user/save-properties` (protected)
- GET `/user/get-saved-properties` (protected)
- DELETE `/user/unsave-property/:propertyId` (protected)
- POST `/user/send-enquiry` (protected)

### Property
- POST `/property/postProperty/:id`
- GET `/property/getAllProperty`
- GET `/property/propertyById/:id`
- GET `/property/owner/:userId`
- PUT `/property/updateProperty/:id`
- DELETE `/property/deleteProperty/:id`
- PATCH `/property/updateStatus/:id` (protected)

---

*Good luck with your defense, Ngawashi! You built something genuinely solid.*
