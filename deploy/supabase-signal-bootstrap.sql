-- Run once in Atlas SQL Editor as postgres. Creates ONLY new SIGNAL objects.
-- No password is created here. Set the new signal_app password yourself afterwards.
-- No Atlas schemas, auth settings, publications, grants or data are changed.
BEGIN;
DO $$ BEGIN
 IF to_regnamespace('signal') IS NOT NULL OR EXISTS(SELECT FROM pg_roles WHERE rolname='signal_app') THEN
  RAISE EXCEPTION 'SIGNAL objects already exist; stop and inspect instead of replacing them';
 END IF;
END $$;
CREATE ROLE signal_app LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 3;
CREATE SCHEMA signal AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA signal FROM PUBLIC, anon, authenticated;
SET LOCAL search_path TO signal, pg_catalog;
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
CREATE POLICY seminar_participant_owner ON seminar_participants TO signal_app USING(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid OR EXISTS(SELECT 1 FROM seminar_sessions s WHERE s.id=session_id AND s.owner_id=nullif(current_setting('app.workspace_id',true),'')::uuid)) WITH CHECK(workspace_id=nullif(current_setting('app.workspace_id',true),'')::uuid);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY signal_backend_workspaces ON workspaces TO signal_app USING(true) WITH CHECK(true);
CREATE POLICY signal_backend_guests ON guest_sessions TO signal_app USING(true) WITH CHECK(true);
CREATE POLICY signal_backend_sessions ON seminar_sessions TO signal_app USING(true) WITH CHECK(true);
GRANT USAGE ON SCHEMA signal TO signal_app;
GRANT SELECT,INSERT,UPDATE,DELETE ON workspaces,guest_sessions,seminar_sessions,seminar_participants TO signal_app;
COMMIT;
