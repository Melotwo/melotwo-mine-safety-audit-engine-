# Melotwo AI Safety Inspector

Melotwo provides cutting-edge tools to analyze, test, and ensure Large Language Models (LLMs) operate within ethical and regulatory guardrails. This application features a **Safety Inspector** powered by Google Gemini to simulate adversarial prompts and edge-case scenarios.

## ✨ Features

*   **AI Safety Inspector**: Test specific scenarios and system prompts against an AI safety guardrail.
*   **Risk Analysis**: Automatically scores potential output for safety risks (Negligible, Low, Medium, High).
*   **Template Library**: Pre-loaded adversarial templates (Jailbreak, Phishing, Bias) for quick testing.
*   **Inspection History**: Automatically saves your testing history locally.
*   **Draft Auto-Save**: Never lose your work; inputs are saved as you type.

## 🇿🇦 South African Mining Health & Safety (MHSA) Compliance Architecture

Melotwo Mine Safety Audit Engine provides specialized compliance auditing and digital safety file management aligned with South African mining regulations:

- **MHSA Act 29 of 1996:** Automated Section 2 & Section 11 Risk Assessments (HIRA / JSA).
- **DMRE Inspection Readiness:** Statutory reporting and digital audit trail generation for Inspector of Mines audits.
- **SANS Regulatory Verification:**
  - `SANS 10108`: Hazardous Locations & Explosion-Proof Zoning
  - `SANS 10142-1`: Industrial & Underground Electrical Isolation
  - `SANS 10049`: Occupational Hygiene & PPE Degradation Metrics
  - `SANS 10330`: HACCP Food Safety in Mining Canteens
- **Offline Operational Resilience:** Zero-latency underground audit capture with automatic cloud sync.

## 🚀 Deployment to GitHub Pages

This project is configured to deploy automatically to **GitHub Pages** using GitHub Actions.

### 1. Prerequisites

*   A GitHub repository.
*   A Google Gemini API Key.

### 2. Configure GitHub Secrets

To enable the application to talk to Google Gemini, you must add your API Key to the repository secrets.

1.  Go to your GitHub repository.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  **Name**: `API_KEY`
5.  **Value**: Paste your actual Google Gemini API Key.
6.  Click **Add secret**.

### 3. Enable GitHub Pages

1.  Go to **Settings** > **Pages**.
2.  Under **Build and deployment** > **Source**, select **GitHub Actions**.
3.  The deployment workflow will run automatically on the next push to `main`, or you can manually trigger it from the **Actions** tab.

## 🛠️ Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file in the root directory for local testing:
    ```env
    API_KEY=your_actual_api_key_here
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

## 🏗️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash)
*   **Hosting**: GitHub Pages
