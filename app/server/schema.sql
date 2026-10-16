CREATE TABLE IF NOT EXISTS workspaces (
 id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guest_sessions (
 token_hash text PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS organization_contexts (
 workspace_id uuid PRIMARY KEY REFERENCES workspaces(id), data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS risks (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS risks_workspace_idx ON risks(workspace_id);
CREATE TABLE IF NOT EXISTS annual_objectives (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), year integer NOT NULL CHECK(year BETWEEN 2000 AND 2100), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS objectives_workspace_year_idx ON annual_objectives(workspace_id,year);
ALTER TABLE annual_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_objectives FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_objectives ON annual_objectives;
CREATE POLICY tenant_objectives ON annual_objectives USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
ALTER TABLE organization_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_contexts FORCE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_context ON organization_contexts;
CREATE POLICY tenant_context ON organization_contexts USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
DROP POLICY IF EXISTS tenant_risks ON risks;
CREATE POLICY tenant_risks ON risks USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);

CREATE TABLE IF NOT EXISTS risk_kris(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), risk_id uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS kri_readings(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), kri_id uuid NOT NULL REFERENCES risk_kris(id) ON DELETE CASCADE, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS trigger_sources(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS risk_signals(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), data jsonb NOT NULL, dedupe_key text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(workspace_id,dedupe_key));
CREATE TABLE IF NOT EXISTS risk_reviews(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), risk_id uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE risk_kris ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_kris FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_risk_kris ON risk_kris;
CREATE POLICY tenant_risk_kris ON risk_kris USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE INDEX IF NOT EXISTS risk_kris_workspace_idx ON risk_kris(workspace_id);
ALTER TABLE kri_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kri_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_kri_readings ON kri_readings;
CREATE POLICY tenant_kri_readings ON kri_readings USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE INDEX IF NOT EXISTS kri_readings_workspace_idx ON kri_readings(workspace_id);
ALTER TABLE trigger_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_sources FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_trigger_sources ON trigger_sources;
CREATE POLICY tenant_trigger_sources ON trigger_sources USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE INDEX IF NOT EXISTS trigger_sources_workspace_idx ON trigger_sources(workspace_id);
ALTER TABLE risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_signals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_risk_signals ON risk_signals;
CREATE POLICY tenant_risk_signals ON risk_signals USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE INDEX IF NOT EXISTS risk_signals_workspace_idx ON risk_signals(workspace_id);
ALTER TABLE risk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_reviews FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_risk_reviews ON risk_reviews;
CREATE POLICY tenant_risk_reviews ON risk_reviews USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE INDEX IF NOT EXISTS risk_reviews_workspace_idx ON risk_reviews(workspace_id);

CREATE TABLE IF NOT EXISTS suite_records(id uuid PRIMARY KEY,workspace_id uuid NOT NULL REFERENCES workspaces(id),kind text NOT NULL,data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS suite_records_workspace_idx ON suite_records(workspace_id,kind);
ALTER TABLE suite_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suite_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_suite ON suite_records;
CREATE POLICY tenant_suite ON suite_records USING (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id',true),'')::uuid);

CREATE UNIQUE INDEX IF NOT EXISTS annual_objectives_workspace_id_key ON annual_objectives(workspace_id,id);
CREATE TABLE IF NOT EXISTS organization_departments(id uuid PRIMARY KEY,workspace_id uuid NOT NULL REFERENCES workspaces(id),parent_id uuid,data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(workspace_id,id),FOREIGN KEY(workspace_id,parent_id) REFERENCES organization_departments(workspace_id,id));
CREATE TABLE IF NOT EXISTS objective_kpis(id uuid PRIMARY KEY,workspace_id uuid NOT NULL REFERENCES workspaces(id),objective_id uuid NOT NULL,department_id uuid NOT NULL,data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(workspace_id,objective_id) REFERENCES annual_objectives(workspace_id,id),FOREIGN KEY(workspace_id,department_id) REFERENCES organization_departments(workspace_id,id));
ALTER TABLE organization_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_departments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_departments ON organization_departments;
CREATE POLICY tenant_departments ON organization_departments USING(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid);
ALTER TABLE objective_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_kpis FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_objective_kpis ON objective_kpis;
CREATE POLICY tenant_objective_kpis ON objective_kpis USING(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid) WITH CHECK(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid);
CREATE TABLE IF NOT EXISTS seminar_sessions(id uuid PRIMARY KEY,code text UNIQUE NOT NULL,owner_id uuid NOT NULL REFERENCES workspaces(id),data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS seminar_participants(session_id uuid NOT NULL REFERENCES seminar_sessions(id),workspace_id uuid NOT NULL REFERENCES workspaces(id),data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(session_id,workspace_id));
ALTER TABLE seminar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_participants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seminar_participant_owner ON seminar_participants;
CREATE POLICY seminar_participant_owner ON seminar_participants USING(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid OR EXISTS(SELECT 1 FROM seminar_sessions s WHERE s.id=session_id AND s.owner_id=nullif(current_setting('app.workspace_id',true),'')::uuid)) WITH CHECK(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid);
