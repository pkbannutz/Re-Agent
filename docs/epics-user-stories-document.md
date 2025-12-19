# 📋 EPICS & USER STORIES DOCUMENT
## Real Estate AI Visual Engine: Product Development Roadmap
**Version: 1.0 (Final)**  
**Date: December 2025**

----

## EPIC 1: User Onboarding & Access
**Goal:** Enable frictionless signup and access for both anonymous guests and authenticated users with a single-tab experience.

### User Stories:
**US-001: Anonymous Guest Payment Flow**
•  Guests can upload images and pay via Stripe without creating an account.
•  After payment, system auto-creates an account using payment email and sends magic link for first access.
•  The project appears in their dashboard instantly via Supabase Realtime upon first login.
•  No page refreshes or redirects—everything happens inline.

**US-002: Free Trial Provision**
•  Every new user receives exactly one free Starter project (6 images, €50 value, no video) upon signup.
•  Free trial appears automatically in dashboard with "Free Trial" badge.
•  After using the free trial, Starter becomes the only option until upgrade.

**US-003: Magic Link Authentication**
•  Users log in via email magic link (no passwords).
•  Magic link redirects to dashboard with active session.
•  Sidebar shows real-time project list from Supabase Realtime subscription.

----

## EPIC 2: Project Creation & Upload
**Goal:** Allow users to easily upload property images, add instructions, and complete payment without leaving the current view.

### User Stories:
**US-004: Persistent Upload Interface**
•  When currentView === 'project-upload', show the upload form inline (not modal or new page).
•  Include Property Name field, Address field, large drop zone (full width), global instruction chat box.
•  Image preview grid appears instantly after drop below the drop zone.
•  All interactions happen inline without page reload.

**US-005: Property Details Collection**
•  Property Name: Required text field, max 100 characters.
•  Property Address: Optional text field, placeholder: "Optional: 123 Main St, London".
•  All data binds to React state in real-time—no save button needed until payment.

**US-006: Global Instructions Chat Box**
•  Full-width chat-style input above image grid.
•  Placeholder: "Describe the style for all images: e.g., Make it sunny, Scandinavian furniture, luxury kitchen".
•  Press Enter to submit—appears as pinned message above grid, editable inline.
•  Character limit: 500.

**US-007: Per-Image Instruction Forms**
•  Text field under each image for specific instructions.
•  Placeholder: "e.g., Remove dog, make daytime".
•  Instructions saved to project_images table per image.
•  Appears after images are uploaded and grid is generated.

**US-008: AI-Generated Property Description**
•  After 3 images uploaded, AI analyzes images + prompts + address to generate listing description.
•  Description appears in user's language below address field, fully editable.
•  Character limit: 2,000.
•  "Regenerate Description" button triggers new AI call with same context.

**US-009: Stripe Embedded Checkout**
•  Package selector buttons: Starter (€50, 6 images), Pro (€250, 30 images + video), Unlimited banner.
•  Clicking payment button opens Stripe Checkout in iframe overlay covering upload view.
•  On success, overlay closes, shows "Payment successful! Processing..." banner inline.
•  User never leaves the upload view—no redirects.

**US-010: Real-Time Status Updates**
•  After payment, project status updates to 'paid' in Supabase.
•  Supabase Realtime subscription in sidebar updates badge instantly.
•  Upload view shows processing spinner with status: "Processing images (0/30)".
•  Status progress updates in real-time as N8N workflows process images.

----

## EPIC 3: AI Image Processing & Review
**Goal:** Enable users to review AI-processed images and refine them through controlled tweaks with instant visual feedback.

### User Stories:
**US-011: Masonry Grid Review View**
•  Images display in 5-column masonry grid on desktop, responsive on mobile.
•  Click image toggles between original and processed view with smooth transition.
•  No page reload—view switches instantly via React state.

**US-012: List View for Tweaking**
•  Toggle button switches grid to list view: original image (left) + five generation boxes (right).
•  Box 1 shows current generation, Boxes 2-5 are empty dashed boxes labeled "Attempt 2", "Attempt 3", etc.
•  Each box clickable to view full-size image in overlay (not new page).

**US-013: Inline Tweak Forms (No Modals)**
•  Instruction box, "Generate" button, and attempt counter appear directly under each image row in list view.
•  No popups or modals—everything happens inline.
•  "Tweaks remaining: X/5" counter updates in real-time after each generation.

**US-014: Tweak Limit Enforcement**
•  Each image can be regenerated maximum 5 times.
•  At 5/5, "Generate" button disables and shows "No tweaks remaining".
•  Counter turns red when only 1 tweak left.

**US-015: Real-Time Generation Updates**
•  When tweak completes, new generation appears instantly in next empty box via Supabase Realtime.
•  Green "Updated!" toast appears for 2 seconds at top of view.
•  Frontend subscribes to project_images changes—no manual refresh.

**US-016: Background Tweak Processing**
•  User clicks "Generate" → Frontend shows spinner immediately.
•  N8N workflow triggers asynchronously (doesn't wait for response).
•  When Supabase Realtime receives new processed_url, spinner stops.
•  No HTTP timeout risk—works on slow connections.

----

## EPIC 4: Cinematic Video Generation
**Goal:** Create high-quality videos from selected images with proper validation, auto-cropping, and automated delivery.

### User Stories:
**US-017: Aspect Ratio Detection & Validation**
•  System auto-detects each image as 9:16 (portrait) or 16:9 (landscape) on upload.
•  User can only select exactly 12 images of identical aspect ratio.
•  When 12 selected, mismatched images gray out with tooltip: "Different orientation".
•  Error message appears inline: "All 12 images must be portrait or landscape. Current selection mixes both."

**US-018: Auto-Cropping to Uniform Ratio**
•  When 12 images of same aspect ratio selected, system center-crops them automatically.
•  Cropping happens server-side via N8N before sending to Veo.
•  Users cannot manually adjust crop boxes—simplified UX.

**US-019: Video Generation Confirmation**
•  Button "Generate Cinematic Video" disabled until exactly 12 valid images selected.
•  Clicking shows inline confirmation banner: "Generate 1-minute video using 12 clips? This uses 1 video credit. Estimated cost: €180 for overage projects."
•  Confirm button triggers workflow—no redirect.

**US-020: Slow Motion Dolly-In Clips**
•  Each of 12 images becomes 5-second clip with ultra-slow-motion dolly-in movement only.
•  No pan, orbit, or zoom movements—strictly dolly-in.
•  Resolution: 1080p, 24fps, photorealistic quality.

**US-021: Video Stitching with Music & Logo**
•  12 clips stitched with cross-dissolve transitions.
•  60-second lounge chill music auto-generated via Suno AI.
•  User logo appears bottom-right in final 5 seconds.
•  All orchestrated by N8N Video Director workflow.

**US-022: Webhook-Based Video Completion**
•  Frontend shows "Filming your masterpiece..." spinner after generation starts.
•  N8N uses Webhook Wait node (not polling) for Creatomate completion.
•  When video ready, Supabase Realtime updates project status to 'completed'.
•  View auto-switches to delivery page with video player—no refresh needed.

----

## EPIC 5: Final Delivery & Distribution
**Goal:** Provide seamless access to final deliverables with download and sharing options.

### User Stories:
**US-023: Video Delivery Page**
•  Video player occupies 80vh height on desktop, 50vh on mobile.
•  Black background, orientation-aware (9:16 or 16:9).
•  Controls: play, pause, fullscreen, download.
•  Quality: 4K if available, else 1080p.
•  All handled inline in same tab.

**US-024: Bulk Image Download**
•  Gallery grid: 30 processed images in 6-column grid.
•  "Download All Images (ZIP)" button at top.
•  Individual download buttons appear on hover over each image.
•  Downloads start without leaving the page.

**US-025: Shareable Video Link**
•  "Copy Video Link" button generates public view-only link valid 30 days.
•  Link format: https://yourdomain.com/share/{projectId}/{token}.
•  Opens in new tab but main app stays in user's current session.

----

## EPIC 6: Subscription & Billing Management
**Goal:** Manage subscriptions, track usage, and handle overage charges seamlessly using Stripe's free built-in tools.

### User Stories:
**US-026: Stripe Customer Portal Integration**
•  Users click "Manage Subscription" → Redirected to Stripe's built-in portal.
•  Portal handles: cancellations, payment updates, invoice downloads.
•  No custom billing UI built—Stripe provides everything.
•  Portal session generated via N8N workflow.

**US-027: Unlimited Plan Overage Billing**
•  After 30 projects/year, each additional project triggers €180 charge.
•  N8N Overage Manager workflow runs hourly, batches all overages.
•  Creates Stripe metered billing records automatically.
•  Stripe auto-generates invoice and emails user—no manual work.

**US-028: Usage Tracking Dashboard**
•  Dashboard shows: "12/30 projects used this year" with progress bar.
•  Visual warning at 25 projects: "5 projects remaining."
•  Real-time updates via Supabase Realtime subscription.

----

## EPIC 7: Failure Recovery & Refund
**Goal:** Handle AI failures gracefully with automatic refunds and clear user communication.

### User Stories:
**US-029: Automatic Refund for Complete Failures**
•  If video fails after 3 retries, system automatically triggers refund.
•  Image-only failure on Pro plan: partial refund (€70 kept for images).
•  Full failure on Starter: 100% refund (€50).
•  On Unlimited: restores project credit.
•  Refunds processed via Stripe API instantly—no manual review.

**US-030: Failure Notifications**
•  Image processing failure: Email after 10 min with retry status: "1 image failed, retrying automatically."
•  Video generation failure: Email with apology and refund confirmation.
•  All refunds appear automatically in user's Stripe Customer Portal within 30 seconds.

**US-031: Error State Handling**
•  Project status shows 'failed' with reason in dashboard.
•  User can still access successfully generated assets (images or partial video).
•  Support email linked directly in failure notification.
•  Admin receives PagerDuty alert for investigation.

----

**Document Version:** 1.0  
**Total Epics:** 7  
**Total User Stories:** 31  
**Distribution:** Product Team, Engineering Team, QA, Lovable.dev AI Builder
