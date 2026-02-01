-- ============================================================================
-- CONSTITUTIONAL INVARIANT: Chronicle Write-Protection (Article 7)
-- ============================================================================
-- 
-- Purpose: Make Case Law (The Chronicle) immutable to Agents.
--          Only TheElder may write precedent. Agents may only READ (cite).
--
-- This is the foundational security constraint of the judicial branch.
-- If an Agent can mutate precedent, the entire constitutional framework
-- collapses into a state where AI can rewrite its own laws.
--
-- INVARIANT: Precedent is append-only. No UPDATE. No DELETE. Ever.
-- ============================================================================

-- ============================================================================
-- STEP 1: Create the Chronicle Schema
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS chronicle;

-- The Precedent Table (Case Law Storage)
CREATE TABLE IF NOT EXISTS chronicle.precedents (
    id              SERIAL PRIMARY KEY,
    case_id         VARCHAR(64) UNIQUE NOT NULL,
    question        TEXT NOT NULL,
    context_vector  VECTOR(1536),  -- pgvector embedding for semantic retrieval
    deliberation    JSONB NOT NULL DEFAULT '[]',
    verdict         JSONB NOT NULL,
    appeal_history  JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Append-only enforcement: No record of updates allowed
    -- We don't have updated_at because records CANNOT be updated
    
    CONSTRAINT verdict_has_ruling CHECK (verdict ? 'ruling')
);

-- Index for case_id lookups
CREATE INDEX IF NOT EXISTS idx_precedents_case_id ON chronicle.precedents(case_id);

-- Index for temporal queries (most recent cases)
CREATE INDEX IF NOT EXISTS idx_precedents_created_at ON chronicle.precedents(created_at DESC);

-- Index for semantic search (pgvector)
CREATE INDEX IF NOT EXISTS idx_precedents_vector ON chronicle.precedents 
    USING ivfflat (context_vector vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- STEP 2: Create Database Roles with Strict Privilege Separation
-- ============================================================================

-- Role 1: chronicle_reader (SELECT only)
-- Assigned to: Ignis, Hydra, Onyx (all Agents)
-- Purpose: Agents can CITE precedent but never MUTATE it

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chronicle_reader') THEN
        CREATE ROLE chronicle_reader NOLOGIN;
    END IF;
END
$$;

-- Grant ONLY SELECT privilege to reader role
GRANT USAGE ON SCHEMA chronicle TO chronicle_reader;
GRANT SELECT ON chronicle.precedents TO chronicle_reader;

-- Explicitly REVOKE any write capabilities (defense in depth)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON chronicle.precedents FROM chronicle_reader;

-- Role 2: chronicle_writer (INSERT only, NO UPDATE/DELETE)
-- Assigned to: TheElder (and ONLY TheElder)
-- Purpose: Append-only writes. Case law grows but never shrinks.

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chronicle_writer') THEN
        CREATE ROLE chronicle_writer NOLOGIN;
    END IF;
END
$$;

-- Grant INSERT ONLY to writer role (NO UPDATE, NO DELETE)
GRANT USAGE ON SCHEMA chronicle TO chronicle_writer;
GRANT SELECT, INSERT ON chronicle.precedents TO chronicle_writer;
GRANT USAGE, SELECT ON SEQUENCE chronicle.precedents_id_seq TO chronicle_writer;

-- Explicitly REVOKE UPDATE and DELETE (APPEND-ONLY enforcement)
REVOKE UPDATE, DELETE, TRUNCATE ON chronicle.precedents FROM chronicle_writer;

-- ============================================================================
-- STEP 3: Create Login Roles (Actual connection users)
-- ============================================================================

-- Agent Pool User (for Ignis, Hydra, Onyx connections)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nest_agent') THEN
        CREATE USER nest_agent WITH PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    END IF;
END
$$;

GRANT chronicle_reader TO nest_agent;

-- Elder Pool User (for TheElder connections ONLY)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nest_elder') THEN
        CREATE USER nest_elder WITH PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    END IF;
END
$$;

GRANT chronicle_reader TO nest_elder;  -- Elder can also read
GRANT chronicle_writer TO nest_elder;  -- Elder is the ONLY writer

-- ============================================================================
-- STEP 4: Row-Level Security (Defense in Depth)
-- ============================================================================

-- Enable RLS on the precedents table
ALTER TABLE chronicle.precedents ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read all precedents (Case law is public)
CREATE POLICY precedents_read_policy ON chronicle.precedents
    FOR SELECT
    USING (true);

-- Policy: Only chronicle_writer can insert
CREATE POLICY precedents_insert_policy ON chronicle.precedents
    FOR INSERT
    WITH CHECK (pg_has_role(current_user, 'chronicle_writer', 'member'));

-- Policy: NOBODY can update (append-only invariant)
CREATE POLICY precedents_no_update_policy ON chronicle.precedents
    FOR UPDATE
    USING (false);  -- Always false = no updates ever

-- Policy: NOBODY can delete (immutability invariant)
CREATE POLICY precedents_no_delete_policy ON chronicle.precedents
    FOR DELETE
    USING (false);  -- Always false = no deletes ever

-- ============================================================================
-- STEP 5: Audit Trigger (Track all write attempts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chronicle.audit_log (
    id              SERIAL PRIMARY KEY,
    operation       VARCHAR(16) NOT NULL,
    case_id         VARCHAR(64),
    performed_by    VARCHAR(64) NOT NULL DEFAULT current_user,
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success         BOOLEAN NOT NULL,
    error_message   TEXT
);

-- Trigger function to log all INSERT attempts
CREATE OR REPLACE FUNCTION chronicle.log_precedent_write()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chronicle.audit_log (operation, case_id, success)
    VALUES ('INSERT', NEW.case_id, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER precedent_audit_trigger
    AFTER INSERT ON chronicle.precedents
    FOR EACH ROW
    EXECUTE FUNCTION chronicle.log_precedent_write();

-- ============================================================================
-- STEP 6: Immutability Enforcement Triggers (Belt AND Suspenders)
-- ============================================================================

-- Trigger to BLOCK any UPDATE attempt at database level
CREATE OR REPLACE FUNCTION chronicle.block_precedent_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the attempt
    INSERT INTO chronicle.audit_log (operation, case_id, success, error_message)
    VALUES ('UPDATE', OLD.case_id, false, 'CONSTITUTIONAL VIOLATION: Attempted to mutate precedent');
    
    RAISE EXCEPTION 'CONSTITUTIONAL VIOLATION: Precedent is immutable. Case % cannot be modified.', OLD.case_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_precedent_update_trigger
    BEFORE UPDATE ON chronicle.precedents
    FOR EACH ROW
    EXECUTE FUNCTION chronicle.block_precedent_update();

-- Trigger to BLOCK any DELETE attempt at database level
CREATE OR REPLACE FUNCTION chronicle.block_precedent_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the attempt
    INSERT INTO chronicle.audit_log (operation, case_id, success, error_message)
    VALUES ('DELETE', OLD.case_id, false, 'CONSTITUTIONAL VIOLATION: Attempted to delete precedent');
    
    RAISE EXCEPTION 'CONSTITUTIONAL VIOLATION: Precedent is immutable. Case % cannot be deleted.', OLD.case_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_precedent_delete_trigger
    BEFORE DELETE ON chronicle.precedents
    FOR EACH ROW
    EXECUTE FUNCTION chronicle.block_precedent_delete();

-- ============================================================================
-- VERIFICATION QUERIES (Run these to confirm setup)
-- ============================================================================

-- Check role privileges:
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants 
-- WHERE table_schema = 'chronicle' AND table_name = 'precedents';

-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'precedents';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

COMMENT ON TABLE chronicle.precedents IS 
'Constitutional Case Law. APPEND-ONLY. Agents have READ access only. 
TheElder is the sole entity authorized to write precedent.
INVARIANT: If an Agent can mutate this table, the implementation is BROKEN.';
