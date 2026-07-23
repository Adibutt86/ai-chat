# Service Costs, Product Overview & Google AI Studio Setup Guide

## 1. Main Product Overview
Our platform (**AI Chatbot Platform**) is a white-label, multi-tenant AI-driven customer engagement and automated appointment scheduling solution built for modern businesses, agencies, and WordPress site owners.

### Key Features & What the Product Offers:
* **Custom AI Chatbot Widget**: Embeddable floating chat widget designed for websites, WordPress blogs, and SaaS platforms.
* **Google Gemini AI Engine Integration**: Built on `@google/genai` to provide natural, context-aware customer support and Q&A.
* **Automated Calendar & Appointment Scheduling**: Integrated with Google Calendar API for direct booking, slot checking, and meeting management.
* **White-Label & Reseller Dashboard**: Master control panel allowing agency owners/resellers to create, manage, and brand separate client accounts.
* **SaaS Subscription & Billing Engine**: Fully integrated with Stripe for tiered monthly/yearly subscriptions and pay-as-you-go usage.
* **PostgreSQL & Prisma Data Architecture**: Persistent storage for conversation logs, user roles, chatbot configurations, and booking records.

---

## 2. Phase-by-Phase Cost Breakdown & Purchase Links

### A. Testing Phase Costs
During the testing phase, low-cost or free-tier resources are prioritized to minimize expenditure.

| Service / Tool | Purpose | Testing Phase Cost | Service Purchase / Access Link |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** | AI Model Execution (`gemini-2.5-flash` / `gemini-1.5-flash`) | **$0.00** (Free Tier available in Google AI Studio) | [Google AI Studio Console](https://aistudio.google.com/) |
| **Database (Supabase / Neon)** | Cloud PostgreSQL Database hosting | **$0.00** (Free Tier available) | [Supabase Pricing](https://supabase.com/pricing) / [Neon Pricing](https://neon.tech/pricing) |
| **Hosting & Deployment (Vercel)** | Next.js Application Hosting | **$0.00** (Hobby Plan) | [Vercel Pricing](https://vercel.com/pricing) |
| **Google Cloud Console** | Google Calendar API & OAuth Credentials | **$0.00** (Free Tier) | [Google Cloud Console](https://console.cloud.google.com/) |
| **Stripe Payments** | Payment Gateway Testing | **$0.00** (Sandbox / Test Mode) | [Stripe Pricing](https://stripe.com/pricing) |
| **Domain Name (Optional for Testing)** | Custom domain / SSL | **$0.00 - $10.00/yr** | [Namecheap](https://www.namecheap.com/) / [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) |

> **Total Estimated Testing Cost:** **$0.00 – $10.00**

---

### B. Production & Reseller Phase Costs (Infrastructure Upgrades)
When transitioning to production or selling to end-clients, services transition to paid usage tiers.

| Service / Tool | Purpose | Upgrade / Production Cost | Purchase / Plan Upgrade Link |
| :--- | :--- | :--- | :--- |
| **Google Gemini API (Pay-As-You-Go)** | Paid Tier for higher rate limits & commercial SLA | **~$0.075 / 1M input tokens**<br>**~$0.30 / 1M output tokens** | [Google AI Studio Pricing](https://ai.google.dev/pricing) |
| **Supabase Pro / Database** | Production PostgreSQL with automatic backups & higher connections | **$25.00 / month** | [Supabase Billing](https://supabase.com/dashboard/org/_/billing) |
| **Vercel Pro (Hosting)** | Production hosting, custom domain, team collaboration | **$20.00 / user / month** | [Vercel Pro Upgrade](https://vercel.com/pricing) |
| **Stripe Processing Fees** | Payment gateway transaction fees | **2.9% + $0.30** per successful charge | [Stripe Dashboard](https://dashboard.stripe.com/) |

---

## 3. Reseller Phase & Client Pricing Guidelines

### Expected Upgrade Costs for Resellers:
* **Base Infrastructure Maintenance:** ~$45.00/month (Vercel Pro + Supabase Pro).
* **Variable AI Usage:** Scaled based on user message volume via Google Gemini API.

### Minimum Recommended Client Billing Structure:
To ensure healthy profit margins while accounting for hosting and AI token costs:

* **Starter Tier (Small Business):** **$29.00 / month per account** (Includes up to 1,000 chat messages/mo).
* **Professional Tier (Growth):** **$59.00 – $79.00 / month per account** (Includes custom system prompts, Google Calendar synchronization, up to 5,000 messages/mo).
* **Agency / Unlimited Tier:** **$149.00 – $199.00 / month per account** (Dedicated support, white-label branding, high-volume message allowances).

---

## 4. How to Create a Gemini API Key with Billing in Google AI Studio (For Testing & Production)

To configure the chatbot's AI functionality using Google AI Studio, follow these step-by-step instructions:

### Step 1: Sign In to Google AI Studio
1. Open your web browser and navigate to **[Google AI Studio](https://aistudio.google.com/)**.
2. Log in using your primary Google / Workspace Account.

### Step 2: Set Up a Billing Account (Google Cloud Console)
1. Go to the **[Google Cloud Billing Console](https://console.cloud.google.com/billing)**.
2. If you do not have a billing account, click **Create Account**.
3. Enter your business details, address, and credit/debit card details. 
   *(Note: Google provides free trial credits for new accounts, and Gemini offers free-tier usage before charging).*

### Step 3: Create & Link a Google Cloud Project
1. Navigate back to **[Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)**.
2. Click on the button labeled **"Create API key"**.
3. Select **"Create API key in new project"** or attach it to an existing Google Cloud Billing Project.

### Step 4: Copy the API Key to Environment Setup
1. Copy the generated string (starts with `AIzaSy...`).
2. Open your project's `.env` file on the root directory (`C:\chatbot\.env`).
3. Add or update the key as follows:
   ```env
   GEMINI_API_KEY="AIzaSyYourCopiedKeyHere"
   ```
4. Save the file and restart your development server (`npm run dev`).
