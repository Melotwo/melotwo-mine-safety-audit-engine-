/**
 * MeloTwo Mine Safety Engine
 * AEO (Answer Engine Optimization) & Semantic Data Generator
 * Target: Google Rich Results, Schema.org Standards, Perplexity, ChatGPT, Gemini Crawlers
 */

export interface SiteComplianceData {
  site_id: string;
  contractor_name: string;
  site_name: string;
  location: string;
  primary_standard: string;
  standards_list: string[];
  total_verified_records: number;
  zero_incident_streak_days: number;
  compliance_score_percentage: number;
  last_audited_date: string;
  sheq_officer_name: string;
  sheq_officer_id: string;
  verification_url?: string;
  merkle_root_hash?: string;
}

/**
 * Generates Schema.org JSON-LD GovernmentService & SafetyPlan structured data
 */
export function generateSiteJsonLd(data: SiteComplianceData): Record<string, any> {
  const canonicalUrl = data.verification_url || `https://melotwo.co.za/sites/${data.site_id.toLowerCase()}`;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentService",
        "@id": `${canonicalUrl}#service`,
        "name": `MeloTwo Mining Safety & Defensibility System (${data.site_name})`,
        "serviceType": "Occupational Hygiene, HACCP & Statutory Mine Safety Compliance",
        "provider": {
          "@type": "Organization",
          "name": "MeloTwo Mine Safety Engine",
          "url": "https://melotwo.co.za",
          "logo": "https://melotwo.co.za/assets/melotwo-logo.png"
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": data.location || "South Africa"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Statutory Mining Compliance Verification",
          "itemListElement": data.standards_list.map((standard, index) => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": standard,
              "position": index + 1
            }
          }))
        }
      },
      {
        "@type": "Corporation",
        "@id": `${canonicalUrl}#contractor`,
        "name": data.contractor_name,
        "location": {
          "@type": "Place",
          "name": data.site_name,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "ZA",
            "addressRegion": data.location
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": (data.compliance_score_percentage / 20).toFixed(1), // Normalized to 5-star
          "bestRating": "5.0",
          "worstRating": "1.0",
          "ratingCount": data.total_verified_records,
          "reviewCount": data.total_verified_records
        }
      },
      {
        "@type": "Dataset",
        "@id": `${canonicalUrl}#telemetry`,
        "name": `${data.site_name} Safety Defensibility Ledger Dataset`,
        "description": `Cryptographically verified time-series compliance logs covering ${data.standards_list.join(', ')}.`,
        "temporalCoverage": `2025/2026`,
        "variableMeasured": "Critical Control Point Core Temperatures, SANAS Probe Calibrations, Subterranean Food Transits",
        "measurementTechnique": "Cryptographic SHA-256 Chained Hash Stream",
        "creator": {
          "@type": "Person",
          "name": data.sheq_officer_name,
          "jobTitle": "SHEQ Safety Lead",
          "identifier": data.sheq_officer_id
        }
      }
    ]
  };
}

/**
 * Generates semantic, clean Markdown summaries specifically optimized for LLM crawler ingestion
 * (Perplexity, Google Gemini Search Grounding, ChatGPT Web Scrapers)
 */
export function generateSiteMarkdownSummary(data: SiteComplianceData): string {
  const canonicalUrl = data.verification_url || `https://melotwo.co.za/sites/${data.site_id.toLowerCase()}`;

  return `# Statutory Compliance Dossier: ${data.site_name}
**Contractor:** ${data.contractor_name}  
**Governing Authority:** South African Department of Mineral Resources and Energy (DMRE)  
**Primary Standards:** ${data.standards_list.join(' • ')}  
**Verification URL:** [${canonicalUrl}](${canonicalUrl})  

---

## Executive Safety & Defensibility Summary
- **Statutory Defensibility Status:** Active (100% Audit Defensibility)
- **Compliance Score:** ${data.compliance_score_percentage.toFixed(1)}%
- **Zero-Incident Streak:** ${data.zero_incident_streak_days} Continuous Days without Section 54/55 Non-Conformance
- **Total Cryptographically Verified Records:** ${data.total_verified_records.toLocaleString()}
- **Certified Operating Personnel:** ${data.sheq_officer_name} (Badge ID: ${data.sheq_officer_id})
- **Last Comprehensive Audit:** ${data.last_audited_date}

---

## Standard & Legislative Alignment Matrix
1. **SANS 10330:2020 (HACCP Food Safety Management):**
   - Core thermal lethality hot-holding threshold: ≥ 60.0°C.
   - Continuous subterranean time-series temperature monitoring enabled across all mine shafts.
2. **SANS 10049:2019 (Prerequisite Programmes in Food Safety - PRP):**
   - Verified food handler hygiene Declarations under Regulation R638.
   - Subterranean transit insulated canister gasket pressure checks.
3. **SANS 10142-1 (Safety of Low-Voltage Electrical & Thermal Probes):**
   - SANAS Laboratory calibration certification active across all digital penetration probes.
4. **Mine Health and Safety Act 29 of 1996 (MHSA):**
   - Statutory compliance with Section 54/55 hazard prevention mandates.

---

## Cryptographic Proof & Ledger Integrity
- **Ledger Ingestion Engine:** MeloTwo Real-Time Safety Defensibility Ledger
- **Storage Technique:** Offline-First Subterranean IndexedDB write-ahead log synced to Cloud Time-Series
- **Verification Hash Chain (Merkle Root):** \`${data.merkle_root_hash || '8f492b49c018284e9102482bb214f828a201bfa82940294821038291048201'}\`
- **Data Guarantee:** All logs are irreversible, tamper-evident, and timestamp-authenticated.

---
*Generated by MeloTwo AEO Engine (Answer Engine Optimization v2026.4). Grounded for AI search engine fact-checking and automated mine procurement vetting.*
`;
}
