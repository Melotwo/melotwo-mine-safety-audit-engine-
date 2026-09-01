-- ====================================================================================================
-- MELOTWO CORE RELATIONAL SCHEMA SPECIFICATION (POSTGRESQL / CLOUD SQL DDL)
-- MODULE: MULTI-TENANT ISOLATION, SITE BINDING, OHSA AUDIT MATRIX™ & AUTO-CAPA LEDGER
-- GOVERNANCE: MHSA (ACT 29 OF 1996) | OHS ACT (ACT 85 OF 1993) | POPIA ACT (ACT 4 OF 2013)
-- COMPLIANCE PROFILE: SUBTERRANEAN OFFLINE-FIRST SYNC & DMRE STATUTORY AUDIT NON-REPUDIATION
-- ====================================================================================================

-- Enable cryptographic extension for UUID generation and hash-based integrity sealing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------------------------------
-- 1. TENANTS & MULTI-ORGANIZATION COMPLIANCE ISOLATION
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    csd_maaa_number VARCHAR(50) UNIQUE NOT NULL, -- National Treasury CSD Master Supplier Number
    cipc_registration_number VARCHAR(50) UNIQUE,
    coida_registration_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tenants IS 'Multi-tenant client master records mapped to verified CSD and CIPC entities.';
COMMENT ON COLUMN tenants.csd_maaa_number IS 'National Treasury Central Supplier Database identification code.';

-- ----------------------------------------------------------------------------------------------------
-- 2. SITE CONTEXT BINDING (Anchor for Shafts, Plants, Sections & Operations)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
    site_id VARCHAR(50) PRIMARY KEY, -- e.g., 'SITE-101', 'SITE-204', 'SITE-509'
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    site_name VARCHAR(255) NOT NULL,
    commodity_type VARCHAR(100) NOT NULL, -- 'Coal', 'Platinum', 'Gold', 'Iron Ore', 'Civils'
    mining_method VARCHAR(100) NOT NULL,  -- 'Underground Fiery', 'Underground Hardrock', 'Surface Opencast'
    region VARCHAR(100) NOT NULL,         -- 'Mpumalanga', 'Limpopo', 'North West', 'Gauteng', 'Northern Cape'
    dmre_inspectorate_office VARCHAR(100) NOT NULL, -- e.g., 'eMalahleni / Witbank Region'
    appointed_manager_section_31a VARCHAR(255),    -- Legal appointee under MHSA Section 3.1(a)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_commodity_method ON sites(commodity_type, mining_method);

COMMENT ON TABLE sites IS 'Statutory site context anchoring all assessments, logbooks, and CAPA remediations.';

-- ----------------------------------------------------------------------------------------------------
-- 3. OHSA AUDIT MATRIX™ & BASELINE HIRA REGISTERS
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hira_records (
    hira_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id VARCHAR(50) NOT NULL REFERENCES sites(site_id) ON DELETE RESTRICT,
    task_name VARCHAR(255) NOT NULL,
    hazard_description TEXT NOT NULL,
    initial_severity INT NOT NULL CHECK (initial_severity BETWEEN 1 AND 5),
    initial_likelihood INT NOT NULL CHECK (initial_likelihood BETWEEN 1 AND 5),
    initial_risk_score INT GENERATED ALWAYS AS (initial_severity * initial_likelihood) STORED,
    conflict_protocol_applied VARCHAR(255), -- e.g., 'SANS 10108 Gas Limit Override SANS 10142-1'
    engineered_controls TEXT NOT NULL,
    residual_severity INT NOT NULL CHECK (residual_severity BETWEEN 1 AND 5),
    residual_likelihood INT NOT NULL CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_risk_score INT GENERATED ALWAYS AS (residual_severity * residual_likelihood) STORED,
    assessor_name VARCHAR(255) NOT NULL,
    sacpcmp_registration_number VARCHAR(50),
    is_offline_sync BOOLEAN DEFAULT FALSE,
    device_captured_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hira_site_created ON hira_records(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hira_risk_evaluation ON hira_records(initial_risk_score DESC, residual_risk_score);

COMMENT ON TABLE hira_records IS 'Continuous hazard evaluation ledger generated under OHSA Audit Matrix™ standards.';

-- ----------------------------------------------------------------------------------------------------
-- 4. AUTO-CAPA INCIDENT REMEDIATION & ROOT CAUSE LOGS
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capa_logs (
    capa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id VARCHAR(50) NOT NULL REFERENCES sites(site_id) ON DELETE RESTRICT,
    hira_ref_id UUID REFERENCES hira_records(hira_id) ON DELETE SET NULL,
    trigger_event TEXT NOT NULL,
    severity_level VARCHAR(50) NOT NULL DEFAULT 'HIGH_RISK', -- 'CRITICAL', 'HIGH_RISK', 'SECTION_54_ALERT'
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN_0H' 
        CHECK (status IN ('OPEN_0H', 'CONTAINED_24H', 'CLOSED_48H', 'ESCALATED_DMRE')),
    action_1h_immediate TEXT NOT NULL,
    action_24h_root_cause TEXT,
    action_48h_signoff TEXT,
    signed_by_engineer VARCHAR(255),
    engineer_registration_number VARCHAR(50), -- ECSA / DMRE Competency Certificate Ref
    signoff_timestamp TIMESTAMP WITH TIME ZONE,
    sha256_audit_seal VARCHAR(64), -- Non-repudiation hash calculated on signoff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capa_site_status ON capa_logs(site_id, status);
CREATE INDEX IF NOT EXISTS idx_capa_created ON capa_logs(created_at DESC);

COMMENT ON TABLE capa_logs IS 'Statutory 0-1h, 24h, 48h remediation timelines for automated deficit resolution.';

-- ----------------------------------------------------------------------------------------------------
-- 5. SUBTERRANEAN OFFLINE-FIRST SYNCHRONIZATION QUEUE
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id VARCHAR(50) NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    payload_type VARCHAR(50) NOT NULL, -- 'HIRA_CAPTURE', 'CAPA_UPDATE', 'PRE_SHIFT_LOG', 'TENDER_FILE'
    payload_json JSONB NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' 
        CHECK (sync_status IN ('QUEUED', 'PROCESSED', 'CONFLICT_DETECTED', 'RECONCILED')),
    reconciliation_notes TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON offline_sync_queue(sync_status, client_timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_sync_device ON offline_sync_queue(device_id, site_id);

COMMENT ON TABLE offline_sync_queue IS 'Subterranean batch staging ledger for devices operating with zero underground connectivity.';

-- ----------------------------------------------------------------------------------------------------
-- 6. STATUTORY INTEGRITY AUDIT TRIGGER (AUTO-HASH & TIMESTAMP ON SIGN-OFF)
-- ----------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_seal_capa_audit_record()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- When transitioned to CLOSED_48H, calculate immutable SHA256 cryptographic seal
    IF NEW.status = 'CLOSED_48H' AND (OLD.status IS DISTINCT FROM 'CLOSED_48H') THEN
        NEW.signoff_timestamp = CURRENT_TIMESTAMP;
        NEW.sha256_audit_seal = encode(
            digest(
                NEW.capa_id::text || 
                NEW.site_id || 
                NEW.trigger_event || 
                COALESCE(NEW.action_48h_signoff, '') || 
                COALESCE(NEW.signed_by_engineer, '') || 
                NEW.signoff_timestamp::text, 
                'sha256'
            ), 
            'hex'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seal_capa ON capa_logs;
CREATE TRIGGER trg_seal_capa
BEFORE UPDATE ON capa_logs
FOR EACH ROW
EXECUTE FUNCTION fn_seal_capa_audit_record();
