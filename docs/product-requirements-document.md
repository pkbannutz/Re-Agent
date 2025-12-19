# 📋 PRODUCT REQUIREMENTS DOCUMENT
## Real Estate AI Visual Engine: Two-Stop Luxury Platform
**Version: 2.0 (Updated for Current Stack)**  
**Date: December 2025**

----
**VISION:** The world's first AI-powered real estate marketing platform where agents upload raw property photos from any device and receive publication-ready visuals plus a cinematic video—all with human-in-the-loop creative control before final generation.

**SUCCESS METRIC:** 85% of users download their video within 24 hours without requesting support.

----

## 1. CORE USER JOURNEY

### Stop 1: Upload & Payment (5 minutes)
An agent—logged in or anonymous—creates a property project by uploading 6-30 images into a single drop zone. They add a global instruction for all images and individual instructions per image. They pay via one-time payment or subscription, then leave the platform. The system processes all images asynchronously and emails them when ready.

### Stop 2: Review & Video Generation (10 minutes)
The agent receives an email, returns to the platform, and reviews processed images in a list view where each original image appears alongside five generation slots showing tweak history and remaining attempts. They can regenerate any image up to 5 times with natural language instructions. When satisfied, they select exactly 12 images of identical aspect ratio for video generation, click "Generate Cinematic Video," and leave again. The system auto-crops the 12 images to a uniform aspect ratio (9:16 or 16:9), creates twelve 5-second slow-motion dolly-in video clips, stitches them with music and logo, and emails the final video in the detected orientation.

### Stop 3: Delivery (Instant)
The agent receives a final email with a link to a delivery page featuring a large video player and a downloadable ZIP of all 30 high-resolution images.

----

## 2. USER ACCESS MODES

### Anonymous Guest Flow
•  Guests can upload images and pay without creating an account.
•  After payment, the system auto-creates an account using the payment email and sends a magic link for first-time access.
•  The project appears in their dashboard upon first login.

### Authenticated User Flow
•  Users have a persistent dashboard showing all projects with status badges.
•  Users can manage subscription settings, view usage limits, and access billing.

### Free Trial
•  Every new user who signs up receives exactly one free Starter project (6 images, €50 value, no video).
•  The free project appears automatically in their dashboard with a "Free Trial" badge.
•  After using the free project, the Starter package becomes the only option until they upgrade.

----

## 3. PROJECT CREATION PAGE SPECIFICATIONS

### Project Details Section
•  **Property Name:** Required text field, max 100 characters.
•  **Property Address:** Optional text field, placeholder: "Optional: 123 Main St, London"
•  **Property Description:** Auto-generated text area that appears after at least 3 images are uploaded. AI analyzes uploaded images, property name, address, and instructions to generate a ready-to-use listing description in the same language as the user's prompts. Character limit: 2,000. Includes "Regenerate Description" button and inline tweak form. Fully editable.

### Upload Zone
•  **Single Drop Zone:** One large, prominent drop area at the top of the view.
•  **Batch Upload:** Users can drag 6-30 images at once or click to browse files.
•  **Auto-Rename:** Upon upload, all files are renamed to {property_name}_{sequence}.{ext} (e.g., Landbrook_1.jpg, Landbrook_2.jpg). Sequences are zero-padded 2-digit numbers (01, 02, 03...). Property name is sanitized (special characters removed, spaces converted to underscores).
•  **Progress Indicator:** Show upload progress for each image as they process.
•  **Validation:** Reject files larger than 10MB or non-image formats with inline error messages.
•  **Grid Generation:** After upload completes, images appear in a grid below with individual forms.

### Global Instructions Chat Box
•  **Position:** Above the image grid, full width, like a chat interface.
•  **Placeholder:** "Describe the style for all images: e.g., Make it sunny, Scandinavian furniture, luxury kitchen"
•  **Character Limit:** 500
•  **Behavior:** Press Enter to submit; appears as a "pinned" message above grid. Editable inline.

### Image Grid Layout
•  **Default View:** Masonry grid of processed images after generation.
•  **During Tweaking:** Grid converts to list view where each row shows Original image (left) followed by Five generation boxes (right).
•  **Box 1 (closest to original):** Shows current generation.
•  **Boxes 2-5:** Empty boxes with dashed borders, labeled "Attempt 2," "Attempt 3," etc., showing remaining tweaks.
•  **Each box is clickable to view full-size image.**

### Per-Image Tweak Forms
•  **Position:** Directly under each image row in list view.
•  **Form Fields:**
•  Instruction input box (placeholder: "e.g., Remove dog, make daytime")
•  "Generate" button (primary action)
•  "Use This Version" button (selects a specific generation as final)
•  "Reset to Original" button (reverts to original upload)
•  **No Modals:** All interactions happen inline in the list view.
•  **Tweak Flow:** User types instruction → Clicks "Generate" → New generation appears in next available box → "Tweaks remaining: X/5" updates.

----

## 4. REVIEW & VIDEO GENERATION PAGE SPECIFICATIONS

### Video Selection Logic
•  **Aspect Ratio Detection:** System analyzes all uploaded images and tags each as 9:16 (portrait) or 16:9 (landscape).
•  **Selection Constraint:** User can only select exactly 12 images that share the same aspect ratio.
•  **Visual Indicator:** Gray out images with mismatched aspect ratios when 12 are selected.
•  **Error Message:** "All 12 images must have the same orientation. Selected images are mixed."

### Auto-Cropping
•  When 12 images of the same aspect ratio are selected, system automatically crops them to a uniform center-crop matching that ratio.
•  Cropping is done before sending to Veo to prevent black bars or stretching.
•  Users cannot manually adjust crop boxes (simplified UX).

### Video Generation Trigger
•  **Button:** "Generate Cinematic Video" (disabled until 12 valid images selected).
•  **Click Action:**
•  Shows confirmation: "Generate 1-minute cinematic video using 12 clips? This uses 1 video credit."
•  Confirmation shows estimated cost: "€180 will be charged for overage projects."
•  On confirm: Update project status to 'filming', show "Filming your masterpiece..." screen.

### Settings Panel (Collapsible)
•  **Video Style:** Locked to "Slow Motion Dolly In Only" (no other options).
•  **Resolution:** Auto-detected from selected images (9:16 or 16:9).
•  **Logo:** Dropdown to select uploaded logo (if any).
•  **Music Genre:** Locked to "Lounge Chill Instrumental."

----

## 5. FINAL DELIVERABLE PAGE SPECIFICATIONS

### Video Player
•  **Orientation:** Video automatically plays in landscape (16:9) or portrait (9:16) mode based on source images.
•  **Player Size:** 80vh height on desktop, 50vh on mobile.
•  **Controls:** Play, pause, fullscreen, download.
•  **Quality:** 4K if available, falls back to 1080p.
•  **All images have alt text:** "Processed view of {property_name} - Image {number}"

### Image Download
•  **Gallery Grid:** 30 processed images in 6-column grid.
•  **Bulk Download:** "Download All Images (ZIP)" button at top.
•  **Individual Download:** Hover over image → "Download" button appears.

### Share Link
•  **Button:** "Copy Video Link" → Generates a public view-only link valid for 30 days.
•  **Link format:** https://yourdomain.com/share/{projectId}/{token}

----

## 6. DASHBOARD SPECIFICATIONS

### Stats Row
Shows three metrics: Projects Completed, Images Generated, Videos Generated.

### Projects Table
•  **Columns:** Property Name (clickable), Package, Status, Created Date, Actions
•  **Status Badges:**
•  draft: Gray
•  paid: Yellow
•  reviewing: Blue
•  filming: Purple
•  completed: Green
•  failed: Red
•  **Actions:** Context-aware buttons based on status.

### Subscription Management
•  **Billing Portal:** Users click "Manage Subscription" → Redirected to Stripe's hosted Customer Portal. In the portal they can cancel, update payment methods, view invoices, and request refunds. Stripe handles everything automatically.
•  **Unlimited Plan:** Shows "30 projects included, €180 per additional project."
•  **Overage Alert:** At 25 projects, show warning: "5 projects remaining. Additional projects €180 each."

----

## 7. PRICING & PACKAGES

### Starter: €50
•  6 images
•  No video
•  One-time payment
•  Free Trial: Every new user gets one Starter project free upon signup.

### Pro: €250
•  30 images
•  1 video (12 clips × 5 seconds)
•  One-time payment
•  Requires minimum 12 images uploaded to enable video option.

### Unlimited: €2,500/year
•  30 projects per year (30 images + 1 video each)
•  Overage: €180 per additional project (billed automatically via Stripe metered billing)
•  Video enabled on all projects with ≥12 images.
•  Dashboard shows real-time usage: "23/30 projects used."

----

## 8. AI PROMPT SPECIFICATIONS

### Nano Banana Pro (Image Processing)
•  **Default Prompt:** "Professional real estate photography, bright natural light, clean modern furniture, 2K resolution, architectural photography style."
•  **User Override:** Per-image instruction field replaces default for that image only.
•  **Global Override:** Global chat box instruction prepends to all image prompts.

### Veo 3.1 Fast (Video Generation)
•  **Prompt:** "Professional real estate walkthrough, ultra slow motion dolly in movement, steady camera, photorealistic, 24fps, interior architectural photography, smooth parallax."
•  **Duration:** 5 seconds per clip.
•  **Resolution:** 1080p.
•  **Aspect Ratio:** Matches detected image orientation (9:16 or 16:9).
•  **Movement:** Strictly dolly-in only, no pan, no orbit, no zoom.

### Property Description AI
•  **Input:** Property name, address, all uploaded images, global instructions.
•  **Output:** 1,000-2,000 character listing description in user's language.
•  **Style:** Optimized for real estate portals (Rightmove, Zoopla, etc.).
•  **Tweak:** User can edit description or regenerate with new instructions.

----

## 9. FILE MANAGEMENT & STORAGE

### Renaming Convention
•  Upon upload: OriginalFilename.jpg → {property_name}_{sequence}.{ext}
•  Sequence: Zero-padded 2-digit number (01, 02, 03...).
•  Property name: Sanitized (remove special characters, spaces → underscores).

### Storage Lifecycle
•  Active Projects: 90 days from completion.
•  Archived: Moved to cold storage after 90 days.
•  Permanent Delete: After 365 days of inactivity (user notified 30 days prior).

### Bandwidth Estimates
•  Average project: 400MB (300MB images + 100MB video).
•  100 projects/month: 40GB storage, 200GB bandwidth (downloads).

----

## 10. ERROR HANDLING & USER COMMUNICATION

### Processing Failures
•  **Image Failure:** Email after 10 minutes: "⚠️ 1 image failed. We're retrying automatically."
•  **Video Clip Failure:** Auto-retry 2× with adjusted prompt. If still fails, use static 5-second image version.
•  **Complete Video Failure:** After 3 attempts, mark project as failed, refund video credit, send apology email with manual assistance offer.

### Payment Failures
•  **At Checkout:** Inline error message from Stripe (e.g., "Card declined").
•  **After Upload:** Retain uploaded images for 24 hours; allow payment retry via link.

### User Errors
•  **Wrong Aspect Ratio:** Inline toast: "All 12 images must be portrait or landscape. Current selection mixes both."
•  **Tweak Limit:** Disable "Generate" button after 5 tweaks, show "No tweaks remaining" text.
•  **Insufficient Images:** Disable video button, show "Upload at least 12 images to enable video."

----

## 11. INTERNATIONALIZATION

### Language Support
•  Detect browser language on first visit.
•  Allow manual language switch in settings.
•  AI-generated descriptions use the same language as user's prompts.
•  Email templates translated for: English, French, German, Spanish, Italian.

### Currency
•  Default: Euro (€).
•  Stripe handles currency conversion for non-EU cards.
•  Display prices always in EUR.

----

## 12. ACCESSIBILITY

### WCAG 2.1 AA Compliance
•  All images have alt text: "Processed view of {property_name} - Image {number}"
•  All buttons have ARIA labels.
•  Keyboard navigation: Tab order follows visual flow.
•  Color contrast: Cyan on white/black passes AA (4.5:1).
•  Video player supports captions (auto-generated via Veo).

----

## 🏗️ ARCHITECTURE DOCUMENT
## Real Estate AI Visual Engine: System Architecture & Integration Map
**Version: 2.0 (Updated for Current Stack)**  
**Date: December 2025**

### Current Tech Stack (December 2025)
Built with modern Next.js 16 and TypeScript, utilizing Supabase for backend services:

### Current Service Status:
•  **Next.js 16:** App Router with Server Components, custom API Routes for backend logic
•  **React 19:** Latest React with modern hooks and concurrent features
•  **Supabase:** Managed PostgreSQL with Row Level Security, Auth, and Storage
•  **Stripe:** Full payment processing with Payment Intents and Customer Portal
•  **Tailwind CSS:** Utility-first CSS framework for styling
•  **TypeScript:** Type-safe development throughout the application
•  **Vercel:** Deployment platform with automatic scaling

### Architecture Overview:
•  **Frontend:** Next.js React application with client-side components for upload and review flows
•  **Backend:** Custom API routes handling business logic, payments, and project management
•  **Database:** Supabase PostgreSQL with custom schema and RLS policies
•  **Storage:** Supabase Storage for user uploads and processed assets
•  **Auth:** Supabase Auth with email/password and social providers
•  **Payments:** Stripe integration with webhook handling for payment confirmation

### What We're Building:
•  Custom API endpoints for project creation, payment processing, and user management
•  Client-side file upload with validation and progress tracking
•  Image processing pipeline (to be integrated with AI services)
•  Video generation workflow (to be implemented)
•  User dashboard and project management interface

### SYSTEM COMPONENTS

#### Frontend Application
•  **Next.js 16:** React application with App Router for modern routing and server components
•  **Deployment:** Vercel with auto-deploy from GitHub
•  **Custom Domain:** app.yourdomain.com
•  **Environments:** Production, Staging, Preview branches

#### Backend & Database
•  **Supabase:** PostgreSQL database with Row-Level Security enabled
•  **Authentication:** Supabase Auth via magic link and Google OAuth
•  **Storage:** Three isolated buckets for project assets
•  **API Routes:** Custom Next.js API routes handling all backend logic

#### AI Service Layer (Planned Integration)
•  **Image Processing:** AI service for cleanup, lighting correction, and object removal
•  **Video Generation:** AI service for creating slow-motion dolly-in video clips
•  **Music Generation:** AI service for creating background music tracks
•  **Video Stitching:** Service for combining clips with transitions, music, and logo overlay

#### Payment & Billing
•  **Stripe Checkout:** Handles one-time payments and future subscription setup
•  **Stripe Customer Portal:** Hosted portal for subscription management
•  **Metered Billing:** Stripe automatically invoices overage fees based on usage
•  **Refund Processing:** Stripe handles money movement when triggered by API calls

----

## 📊 DATA FLOW ARCHITECTURE

### Flow 1: Upload → Project Creation
User uploads images → Client validates files → API creates project → Files stored in Supabase Storage.
•  Client-side validation: File type, size, and count limits enforced
•  Images converted to base64 and sent to /api/create-project endpoint
•  API validates user authentication and project ownership
•  Files uploaded to Supabase Storage with sanitized naming convention
•  Project record created in database with draft status
•  User redirected to payment page

### Flow 2: Payment → Processing Trigger
User completes payment → Stripe webhook confirms → Project status updated → Processing begins.
•  Stripe Payment Intent created via /api/create-payment-intent
•  Client processes payment using Stripe Elements
•  Payment confirmation triggers status update to 'paid'
•  Billing record logged to billing_log table
•  Project status changes trigger background processing (to be implemented)

### Flow 3: Image Processing Pipeline (Planned)
Project marked paid → Background job processes images → AI enhancement applied → Status updated to 'reviewing'.
•  Images retrieved from Supabase Storage
•  AI processing applied (to be integrated with image enhancement APIs)
•  Processed images stored back to Supabase Storage
•  Project status updated to 'reviewing'
•  User notified via email when ready

### Flow 4: Tweak Requests (Planned)
User submits tweak → API validates limits → AI reprocessing → Updated image returned.
•  Tweak request sent to /api/images/tweak endpoint
•  API validates user owns project and attempts remaining (< 5)
•  Original image retrieved and new instruction applied
•  AI reprocessing generates new version
•  Updated image stored and URL returned to frontend

### Flow 5: Video Generation (Planned)
User selects images → API validates selection → Video processing begins → Final delivery.
•  Selection sent to /api/video/start-generation endpoint
•  API validates exactly 12 images with matching aspect ratios
•  Background video generation process initiated
•  Project status updated to 'filming'
•  Upon completion, status changes to 'completed' and user notified

----

## 🔐 API CONTRACTS (Custom Next.js API Routes)

Built with Next.js 13+ App Router API routes, handling business logic and external integrations:

### POST /api/create-payment-intent
**Purpose:** Create secure Stripe payment intent for project.  
**Input:** Project ID, package type (starter/pro).  
**Output:** Client secret for Stripe Elements, payment intent ID.  
**Logic:** Validates project ownership, calculates package pricing, creates Stripe payment intent, logs billing record.

### POST /api/create-project
**Purpose:** Handle project creation with file upload.  
**Input:** Project name, address, global instructions, package, base64-encoded files, per-image instructions.  
**Output:** Project record with ID and file URLs.  
**Logic:** Validates files, uploads to Supabase Storage with naming convention, creates database records, ensures user profile exists.

### POST /api/create-checkout-session (Planned)
**Purpose:** Create Stripe Checkout session for subscriptions.  
**Input:** Price ID, customer email, success/cancel URLs.  
**Output:** Checkout session URL.  
**Logic:** Creates Stripe checkout session, handles subscription setup.

### POST /api/images/tweak (Planned)
**Purpose:** Regenerate image with new instructions.  
**Input:** Image ID, instruction text, attempt number.  
**Output:** New image URL, remaining attempts.  
**Constraints:** User must own image, attempt < 5, validates ownership.

### POST /api/video/start-generation (Planned)
**Purpose:** Validate image selection and initiate video generation.  
**Input:** Project ID, array of 12 image IDs.  
**Output:** Confirmation, estimated completion time.  
**Constraints:** Exactly 12 images, matching aspect ratios, user owns project.

### GET /api/portal-session (Planned)
**Purpose:** Generate Stripe Customer Portal redirect.  
**Input:** User ID (from session).  
**Output:** Portal session URL.  
**Logic:** Creates Stripe portal session for billing management.

### WORKFLOW ARCHITECTURE (Custom API-Based Processing)

Instead of external workflow orchestration tools, all processing is handled through custom Next.js API routes with built-in error handling and retry logic:

#### Payment Processing Workflow
**Trigger:** User completes payment via Stripe Elements
**Process:**
1.  Client-side validation ensures payment details are complete
2.  Stripe Payment Intent created via /api/create-payment-intent
3.  Payment confirmation updates project status to 'paid'
4.  Billing record logged to database with transaction details
5.  Email confirmation sent to user
6.  Background processing triggered for image enhancement

**Error Handling:** Payment failures return detailed error messages to frontend. Failed payments allow retry within 24 hours.

#### Image Processing Workflow (Planned)
**Trigger:** Project status changes to 'paid'
**Process:**
1.  Background job retrieves all uploaded images from Supabase Storage
2.  Images processed in batches through AI enhancement APIs
3.  Processed images stored back to Supabase Storage with version tracking
4.  Project status updated to 'reviewing' upon completion
5.  User notification email sent with review link

**Error Handling:** Individual image failures don't block project completion. Failed images marked for retry.

#### Tweak Processing Workflow (Planned)
**Trigger:** User submits tweak request via frontend
**Process:**
1.  API validates user owns image and attempts remaining (< 5)
2.  Original image retrieved from storage
3.  New instruction combined with existing processing history
4.  AI reprocessing generates updated version
5.  New image stored with incremented attempt number
6.  Frontend updated with new image URL and remaining attempts

**Error Handling:** Attempt limit exceeded returns 400 error. Processing failures offer retry option.

#### Video Generation Workflow (Planned)
**Trigger:** User selects 12 images and confirms video generation
**Process:**
1.  API validates exactly 12 images with matching aspect ratios
2.  Project status updated to 'filming'
3.  Images retrieved and auto-cropped to uniform dimensions
4.  Video clips generated in parallel through AI service
5.  Clips combined with music and transitions
6.  Final video stored to Supabase Storage
7.  Project status updated to 'completed'
8.  Delivery email sent with download links

**Error Handling:** If fewer than 8 clips succeed, project marked as failed and refund initiated.

#### Failure & Refund Workflow (Planned)
**Trigger:** Processing failures exceed retry thresholds
**Process:**
1.  Determine refund amount based on failure stage (image vs video processing)
2.  Stripe Refund API called with Payment Intent ID
3.  Project status updated to 'refunded'
4.  Refund confirmation email sent to user
5.  Admin notification for review

**Logic:** Refunds appear instantly in Stripe Customer Portal. No manual intervention required.

## 💾 STORAGE & ASSET MANAGEMENT

### Bucket: project-images
•  Originals stored at /projects/{projectId}/original/{property_name}_{sequence}.jpg
•  Processed versions stored at /projects/{projectId}/processed/{property_name}attempt{n}.jpg
•  Access: Private with signed URLs valid for 24 hours.
•  Lifecycle: Files auto-archive to cold storage after 90 days.

### Bucket: user-assets
**Purpose:** Store user-uploaded logos.  
•  Structure: /logos/{userId}.png
•  Limits: Maximum file size 2MB, PNG or JPG format only.

### Bucket: video-clips-temp
**Purpose:** Store intermediate video clips during generation.  
•  Structure: /temp/{projectId}/{clipId}attempt{n}.mp4
•  Lifecycle: Auto-delete after 7 days to save storage costs.

----



----

## 🔒 SECURITY & COMPLIANCE

### Supabase RLS Policies
All database tables enforce row-level security:
•  Users can only view, edit, or delete their own projects.
•  Users can only access images and video clips linked to their projects.
•  Admin service role bypasses RLS for automated workflows.

### API Key Management
All external service API keys are stored exclusively in Vercel environment variables. Direct API calls from Next.js API routes use these environment variables securely.

### Webhook Verification
All incoming webhooks from Stripe are verified using shared secrets to ensure authenticity. Requests with invalid signatures are rejected.

### Rate Limiting
•  Tweak endpoints: 10 requests per minute per user.
•  Video generation: 1 request per minute per user.
•  Upload endpoints: 50 requests per minute per user.

----

## ⚡ PERFORMANCE & SCALING

### Speed Targets
•  Image upload: Under 5 seconds per file.
•  Image processing: 95% of projects complete within 10 minutes.
•  Tweak response: Under 5 seconds end-to-end.
•  Video generation: 95% complete within 15 minutes.
•  Page load: Under 2 seconds (Lighthouse score above 90).

### Concurrency Limits
•  Per user: One active project processing at a time.
•  Per system: 100 images processing simultaneously across all users.
•  Vercel: Hobby plan limits (upgrade to Pro for higher limits).

### Cost Monitoring
Every AI API call is logged to a cost tracking table. Alerts triggered when:
•  Per-project AI cost exceeds €180 (overage threshold).
•  Monthly AI spend exceeds €500 (admin alert).

### Scaling Triggers
•  100 projects/day: Upgrade Supabase to Team plan.
•  500 projects/day: Add Vercel Pro plan.
•  1,000 projects/day: Implement regional sharding and read replicas.

----

## 📈 MONITORING & ALERTING

### Supabase Dashboards
Views created to show:
•  Daily project creation by package type.
•  Average processing time per project.
•  Failure rate by processing stage.
•  Subscription churn and overage revenue.

### Vercel & Supabase Monitoring
•  Vercel Analytics for performance monitoring and error tracking.
•  Supabase dashboards for database performance and query monitoring.
•  Custom alerts for API failures and payment processing issues.

### User-Facing Status
•  Projects table displays real-time progress: "Processing images (12/30 complete)."
•  Email updates sent at 50% and 100% completion for long-running video jobs.

### Status Page
Public status page at status.yourdomain.com using Vercel's built-in status dashboard.

## 📋 ANALYTICS & TRACKING

### Events to Track
•  Project created (package type)
•  Images uploaded (count)
•  Tweak requested (image number, attempt number)
•  Video generation started (aspect ratio, image count)
•  Download completed (video, images, zip)
•  Subscription started/canceled
•  Free trial claimed

### Privacy-First Analytics
•  Use Plausible Analytics (or similar - no cookies).
•  No personal data in analytics.
•  Dashboard shows conversion funnel: Upload → Pay → Review → Video → Download.

----

## 📚 SUPPORT & DOCUMENTATION

### In-App Help
•  Question mark icon next to each feature → Opens contextual help tooltip.
•  "Example prompts" link under global instruction box (shows 5 real examples).
•  Video tutorial link on first project creation.

### Knowledge Base
•  Article: "How to Write Good Image Instructions"
•  Article: "What Makes a Good Property Video"
•  FAQ: "Why do my images need the same aspect ratio?"

### Customer Support
•  Email support: support@yourdomain.com
•  Response SLA: 24 hours.
•  Priority support for Unlimited subscribers: 4 hours.

----

## ⚖️ LEGAL & COMPLIANCE

### GDPR
•  Data Processing Agreements signed with all subprocessors.
•  Users can export all personal data via dashboard.
•  Account deletion workflow: 30-day soft delete → permanent deletion.

### Terms of Service
•  Refund policy: Full refund within 7 days for unused projects.
•  Automatic refund if video fails after 3 retry attempts.
•  Subscription cancellation: prorated refund for unused time.

### AI Usage Disclosure
•  Clear statement that images are processed by third-party AI services.
•  User can opt-out of AI training data usage via settings toggle.

----

## 🔄 DISASTER RECOVERY

### Backup Strategy
•  Supabase: Daily backups retained for 7 days.
•  Storage: Cross-region replication enabled.
•  Codebase: Git version control with regular commits to main repository.

### Failure Scenarios
•  Nano Banana Downtime: Show delayed message, retry with exponential backoff, email apology after 30 minutes.
•  Veo Rate Limit: Queue requests, process at reduced rate, notify user of updated timeline.
•  Data Loss: Restore from latest backup and automatically re-queue active projects for reprocessing.

----

## 🗺️ FUTURE ROADMAP (V2+)

•  AI Image Selection: Auto-select 12 best images based on quality scores.
•  Manual Crop Tool: Allow users to adjust crop before video generation.
•  Multiple Styles: "Cinematic," "Fast-Paced," "Sunset Mood" presets.
•  Team Seats: Unlimited plan includes 3 sub-accounts.
•  API Access: REST API for partner integrations.
•  Mobile App: iOS/Android for on-site uploads.

----

**Document Version:** 2.0
**Distribution:** Product Team, Engineering Team, QA Team
