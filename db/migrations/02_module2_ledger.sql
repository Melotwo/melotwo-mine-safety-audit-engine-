-- ============================================================================
-- MeloTwo Mine Safety Engine
-- Migration: 02_module2_ledger.sql
-- Module 2: Real-Time Safety Defensibility Ledger
-- Target: PostgreSQL 14+ (Continuous Time-Series Compliance & Subterranean Log Sync)
-- ============================================================================

-- 1. Create Severity Enum for Defensibility Events
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ledger_severity_level') THEN
        CREATE TYPE ledger_severity_level AS ENUM (
            'NORMAL',           -- Critical control parameters within regulatory threshold
            'ADVISORY',         -- Minor drift, approaching warning limit
            'DEVIATION',        -- Parameter breach with immediate operational correction
            'CRITICAL_BREACH'   -- Uncontrolled breach (e.g. food holding <60°C >2 hrs, DMRE Sec 54 risk)
        );
    END IF;
END $$;

-- 2. Compliance Defensibility Ledger Table
CREATE TABLE IF NOT EXISTS compliance_defensibility_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_uuid VARCHAR(100) NOT NULL UNIQUE,       -- Client-generated UUID for deduplication / idempotent sync
    site_id VARCHAR(80) NOT NULL,                   -- e.g. 'SITE-WIT-01'
    terminal_id VARCHAR(80) NOT NULL,               -- e.g. 'TAB-SHAFT-3-UNDERGROUND'
    operator_user_id VARCHAR(80) NOT NULL,          -- Operator ID / Badge ID e.g. 'TS-981'
    operator_name VARCHAR(120),                     -- Human-readable name for instant audit trail
    
    taxonomy_tag_id VARCHAR(80) NOT NULL,           -- Tag / standard reference
    asset_serial_number VARCHAR(120),               -- Optional linked equipment serial number
    
    recorded_at_local TIMESTAMP WITHOUT TIME ZONE NOT NULL, -- Exact timestamp captured on subterranean terminal
    synced_at_cloud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Server arrival timestamp
    
    measurement_key VARCHAR(80) NOT NULL,           -- e.g. 'core_temperature_celsius', 'ambient_chiller_temp'
    measurement_value NUMERIC(8, 2) NOT NULL,       -- e.g. 68.50
    min_threshold NUMERIC(8, 2) NOT NULL,           -- e.g. 60.00 (SANS 10330 minimum)
    max_threshold NUMERIC(8, 2),                    -- e.g. 95.00
    unit VARCHAR(20) DEFAULT '°C',                  -- e.g. '°C', 'ppm', 'pH', 'lux'
    
    severity ledger_severity_level NOT NULL DEFAULT 'NORMAL',
    latitude NUMERIC(10, 7),                        -- Geo coordinate
    longitude NUMERIC(10, 7),
    location_description VARCHAR(160),              -- e.g. "Shaft 3 Level 42 Mess Station"
    photo_evidence_url TEXT,
    digital_signature_hash VARCHAR(128) NOT NULL,   -- SHA-256 integrity hash of payload
    is_offline_captured BOOLEAN DEFAULT FALSE,      -- Captured while disconnected underground
    capa_action_taken TEXT,                         -- Corrective action note if severity != NORMAL
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. High-Performance Time-Series and Audit Indexes
CREATE INDEX IF NOT EXISTS idx_ledger_site_local_time ON compliance_defensibility_ledger (site_id, recorded_at_local DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_client_uuid ON compliance_defensibility_ledger (client_uuid);
CREATE INDEX IF NOT EXISTS idx_ledger_terminal ON compliance_defensibility_ledger (terminal_id, recorded_at_local DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_severity_alerts ON compliance_defensibility_ledger (site_id, severity) WHERE severity IN ('DEVIATION', 'CRITICAL_BREACH');
CREATE INDEX IF NOT EXISTS idx_ledger_tag_time ON compliance_defensibility_ledger (taxonomy_tag_id, recorded_at_local DESC);
