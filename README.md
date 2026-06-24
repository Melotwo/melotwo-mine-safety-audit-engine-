# Melotwo Mine Safety Compliance & PPE Audit Engine

The **Melotwo Mine Safety Compliance & PPE Audit Engine** is a full-stack engineering solution designed to evaluate and verify underground personnel protective wear against South African National Standards (SANS) and Department of Mineral Resources and Energy (DMRE) guidelines.

---

## 🚀 14-Day Free Beta Trial Architecture

The platform includes a premium "14-Day Free Beta Trial" onboarding and registration system to lock in early-bird corporate access for the **2026 South African Industry Beta**.

### 1. Client-Side Access Control & Overlay Shield
- **Protected Features**:
  - **Tender Specification Blueprint Generator**: Converts complex audit metrics into structured, copyable procurement tender documents.
  - **Official Certificate Print Portal**: Allows the extraction of legally defensible, physical PDF/Paper print audits for DMRE inspections.
- **Visual State**:
  - Locked premium cards are wrapped with a sleek, high-contrast, blurred overlay (`backdrop-blur-sm` & Slate backgrounds `#1e293b`).
  - An animated **SANS Compliance Score Gauge** remains fully interactive and visible to all users.
- **Onboarding Modal**:
  - Displays high-converting B2B copy.
  - Collects Enterprise Name, Primary Operation Type (Mining / Construction), and Workforce Size.

### 2. Paystack Subscription Pipeline Integration (`/api/paystack/initialize-trial`)
- **Deferred Billing**:
  - The API route processes corporate signups by preparing a subscription request targeting the future.
  - Deferral is structured using a `start_date` calculated precisely **14 days in the future**.
  - Payload structure passed to Paystack:
    ```json
    {
      "email": "user@enterprise.co.za",
      "amount": "0",
      "plan": "SANS_ENTERPRISE_BETA_2026",
      "start_date": "2026-07-08T00:37:03.000Z",
      "metadata": {
        "enterpriseName": "Anglo American Platinum",
        "operationType": "Mining",
        "workforceSize": "1500 personnel",
        "trial_duration": "14 days",
        "compliance_shield_active": true
      }
    }
    ```

---

## 🛠️ Project Structure & Architecture

- **`server.ts`**: Express backend executing SANS regulatory rules & proxying the Paystack trial initialization.
- **`src/components/AuditReport.tsx`**: Presents audit conclusions, gauges, and the premium overlay shield with the onboarding modal form.
- **`src/components/AuditForm.tsx`**: Dynamic input capturing current clothing, footwear, depth levels, and environmental threats.
- **`src/components/WashCycleSimulator.tsx`**: Demonstrates degradation of Treated FR coatings vs. Inherent atomic-level FR blends.
- **`src/components/SANSReferenceTable.tsx`**: Interactive reference library for SANS regulatory codes.
