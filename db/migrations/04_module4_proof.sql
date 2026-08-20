-- ============================================================================
-- MeloTwo Mine Safety Engine
-- Migration: 04_module4_proof.sql
-- Module 4: Immutable Live Compliance Proof Ledger
-- Target: PostgreSQL 14+ (Cryptographic SHA-256 Chained Audit Trail)
-- ============================================================================

-- 1. Enable pgcrypto extension for in-database SHA-256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Compliance Proof Ledger Table
CREATE TABLE IF NOT EXISTS compliance_proof_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_index BIGSERIAL NOT NULL,
    site_id VARCHAR(80) NOT NULL,
    record_payload JSONB NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    entry_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_site_block UNIQUE (site_id, block_index)
);

-- 3. Indexes for fast sequential verification
CREATE INDEX IF NOT EXISTS idx_proof_site_block ON compliance_proof_ledger (site_id, block_index ASC);
CREATE INDEX IF NOT EXISTS idx_proof_entry_hash ON compliance_proof_ledger (entry_hash);

-- 4. Cryptographic Validation Trigger Function
CREATE OR REPLACE FUNCTION verify_and_compute_proof_hash()
RETURNS TRIGGER AS $$
DECLARE
    expected_hash VARCHAR(64);
    last_hash VARCHAR(64);
BEGIN
    -- Determine genesis or previous block hash
    IF NEW.previous_hash IS NULL OR NEW.previous_hash = '' THEN
        SELECT entry_hash INTO last_hash
        FROM compliance_proof_ledger
        WHERE site_id = NEW.site_id
        ORDER BY block_index DESC
        LIMIT 1;

        IF last_hash IS NULL THEN
            -- Genesis block anchor
            NEW.previous_hash := '0000000000000000000000000000000000000000000000000000000000000000';
        ELSE
            NEW.previous_hash := last_hash;
        END IF;
    END IF;

    -- Compute SHA-256 hash: SHA256(previous_hash || record_payload)
    expected_hash := encode(digest(NEW.previous_hash || NEW.record_payload::text, 'sha256'), 'hex');

    -- If client supplied an entry_hash, ensure it strictly matches the mathematical computation
    IF NEW.entry_hash IS NOT NULL AND NEW.entry_hash <> '' AND NEW.entry_hash <> expected_hash THEN
        RAISE EXCEPTION 'Cryptographic Hash Mismatch! Supplied entry_hash (%) does not match computed SHA-256 (%)', NEW.entry_hash, expected_hash;
    END IF;

    NEW.entry_hash := expected_hash;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_proof_hash_chain ON compliance_proof_ledger;
CREATE TRIGGER trg_enforce_proof_hash_chain
    BEFORE INSERT ON compliance_proof_ledger
    FOR EACH ROW
    EXECUTE FUNCTION verify_and_compute_proof_hash();
