-- Local seminar persistence. Existing historical tables and records are left untouched.
CREATE TABLE IF NOT EXISTS workspaces (
 id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guest_sessions (
 token_hash text PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id), expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS seminar_sessions(id uuid PRIMARY KEY,code text UNIQUE NOT NULL,owner_id uuid NOT NULL REFERENCES workspaces(id),data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS seminar_participants(session_id uuid NOT NULL REFERENCES seminar_sessions(id),workspace_id uuid NOT NULL REFERENCES workspaces(id),data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(session_id,workspace_id));
ALTER TABLE seminar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_participants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seminar_participant_owner ON seminar_participants;
CREATE POLICY seminar_participant_owner ON seminar_participants USING(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid OR EXISTS(SELECT 1 FROM seminar_sessions s WHERE s.id=session_id AND s.owner_id=nullif(current_setting('app.workspace_id',true),'')::uuid)) WITH CHECK(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid);
