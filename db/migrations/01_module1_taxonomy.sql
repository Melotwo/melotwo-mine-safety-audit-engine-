-- ============================================================================
-- MeloTwo Mine Safety Engine
-- Migration: 01_module1_taxonomy.sql
-- Module 1: Audit vs. Certification Tagging (Compliance Taxonomy Engine)
-- Target: PostgreSQL 14+ (South African MHSA, SANS 10330:2020, SANS 10142)
-- ============================================================================

-- 1. Create Enums for Strict Compliance Taxonomy
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compliance_scope_type') THEN
        CREATE TYPE compliance_scope_type AS ENUM (
            'PROCESS_AUDIT_COMPLIANT',   -- Operational practices, shifts, hygiene, handovers
            'EQUIPMENT_CERTIFIED'        -- Hardware, probes, containers, PPE batch certs
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'regulatory_standard_code') THEN
        CREATE TYPE regulatory_standard_code AS ENUM (
            'SANS_10330_2020',           -- SANS 10330:2020 HACCP Food Hygiene
            'SANS_10049_2019',           -- Pre-requisite Programmes (PRP)
            'SANS_10142_1',              -- Low-voltage electrical & equipment safety
            'DMRE_MHSA_SEC_54',          -- Mine Health & Safety Act Statutory Stop Orders
            'R638_DOH'                   -- Regulation R638 Food Hygiene Premises
        );
    END IF;
END $$;

-- 2. Compliance Taxonomy Tags Table
CREATE TABLE IF NOT EXISTS compliance_taxonomy_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id VARCHAR(80) NOT NULL, -- Flexible site reference (e.g., 'SITE-WIT-01', 'SITE-MID-04')
    tag_name VARCHAR(120) NOT NULL,
    scope_type compliance_scope_type NOT NULL,
    standard_code regulatory_standard_code NOT NULL,
    clause_reference VARCHAR(60) NOT NULL, -- e.g. "Clause 7.4.2 (Thermal Lethality)"
    requires_accredited_lab BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_tag_site_standard UNIQUE (site_id, tag_name, standard_code)
);

-- 3. Certified Assets Registry (Equipment / Hardware with Laboratory Certifications)
CREATE TABLE IF NOT EXISTS certified_assets_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id VARCHAR(80) NOT NULL,
    taxonomy_tag_id UUID NOT NULL REFERENCES compliance_taxonomy_tags(id) ON DELETE RESTRICT,
    asset_serial_number VARCHAR(120) NOT NULL UNIQUE,
    equipment_name VARCHAR(140) NOT NULL,
    equipment_model VARCHAR(100),
    sanas_lab_accreditation_number VARCHAR(100), -- SANAS accredited calibration lab ID
    calibration_certificate_url TEXT,
    calibrated_on DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_calibration_dates CHECK (valid_until >= calibrated_on)
);

-- 4. Create Indexes for High-Performance Audit Queries
CREATE INDEX IF NOT EXISTS idx_tags_site_scope ON compliance_taxonomy_tags (site_id, scope_type);
CREATE INDEX IF NOT EXISTS idx_tags_standard ON compliance_taxonomy_tags (standard_code);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON certified_assets_registry (asset_serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_validity ON certified_assets_registry (valid_until) WHERE is_active = TRUE;

-- 5. Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_compliance_taxonomy_tags ON compliance_taxonomy_tags;
CREATE TRIGGER trg_update_compliance_taxonomy_tags
    BEFORE UPDATE ON compliance_taxonomy_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_certified_assets_registry ON certified_assets_registry;
CREATE TRIGGER trg_update_certified_assets_registry
    BEFORE UPDATE ON certified_assets_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
