-- Additive HORI schema for the existing atlas project. No changes to other apps.
BEGIN;
CREATE OR REPLACE FUNCTION public.hori_fields_valid(doc jsonb,fields text[]) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT jsonb_typeof(doc)='object' AND NOT EXISTS(SELECT 1 FROM unnest(fields) f WHERE jsonb_typeof(doc->f) IS DISTINCT FROM 'string' OR length(btrim(doc->>f)) NOT BETWEEN 1 AND 3000)
$$;
REVOKE ALL ON FUNCTION public.hori_fields_valid(jsonb,text[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hori_fields_valid(jsonb,text[]) TO authenticated;
CREATE TABLE public.hori_workspaces(id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, name text NOT NULL DEFAULT 'My private workspace', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.hori_profiles(workspace_id uuid PRIMARY KEY REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['name','sector'])),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.hori_objectives(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,year integer NOT NULL CHECK(year BETWEEN 2000 AND 2100),data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['title','target','owner'])),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(workspace_id,id));
CREATE TABLE public.hori_risks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,objective_id uuid NOT NULL,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['title','cause','event','impact','owner'])),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(workspace_id,id),FOREIGN KEY(workspace_id,objective_id) REFERENCES public.hori_objectives(workspace_id,id),CHECK((data->>'likelihood')::integer BETWEEN 1 AND 5 AND (data->>'impactScore')::integer BETWEEN 1 AND 5 AND data ?& ARRAY['likelihood','impactScore']),CHECK(data->>'status' IN ('Draft','Active','Monitoring') AND data ? 'status'),CHECK(data->>'category' IN ('Operational','Strategic','Technology','Compliance','Financial') AND data ? 'category'));
CREATE TABLE public.hori_kris(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,risk_id uuid NOT NULL,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['name','unit','owner','direction','frequency'])),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(workspace_id,id),FOREIGN KEY(workspace_id,risk_id) REFERENCES public.hori_risks(workspace_id,id) ON DELETE CASCADE,CHECK(data ?& ARRAY['warning','critical'] AND jsonb_typeof(data->'warning')='number' AND jsonb_typeof(data->'critical')='number'),CHECK((data->>'direction'='Above' AND (data->>'critical')::numeric>=(data->>'warning')::numeric) OR (data->>'direction'='Below' AND (data->>'critical')::numeric<=(data->>'warning')::numeric)),CHECK(data->>'frequency' IN ('Daily','Weekly','Monthly','Quarterly')));
CREATE TABLE public.hori_readings(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,kri_id uuid NOT NULL,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['observedAt'])),created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(workspace_id,kri_id) REFERENCES public.hori_kris(workspace_id,id) ON DELETE CASCADE,CHECK(data ? 'value' AND jsonb_typeof(data->'value')='number'));
CREATE TABLE public.hori_sources(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,objective_id uuid NOT NULL,risk_id uuid,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['name','kind'])),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(workspace_id,id),FOREIGN KEY(workspace_id,objective_id) REFERENCES public.hori_objectives(workspace_id,id),FOREIGN KEY(workspace_id,risk_id) REFERENCES public.hori_risks(workspace_id,id),CHECK(data->>'kind' IN ('news','manual_periodic','manual_incident','assurance')),CHECK(data->>'kind'<>'assurance' OR public.hori_fields_valid(data,ARRAY['rule'])),CHECK(data->>'kind'<>'news' OR (data->>'format' IN ('rss','json','reference') AND public.hori_fields_valid(data,ARRAY['endpoint']))));
CREATE TABLE public.hori_signals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,objective_id uuid NOT NULL,risk_id uuid,source_id uuid,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['title','details','observedAt','status'])),dedupe_key text,created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(workspace_id,objective_id) REFERENCES public.hori_objectives(workspace_id,id),FOREIGN KEY(workspace_id,risk_id) REFERENCES public.hori_risks(workspace_id,id),FOREIGN KEY(workspace_id,source_id) REFERENCES public.hori_sources(workspace_id,id),UNIQUE(workspace_id,dedupe_key),CHECK(data->>'status' IN ('Open','Reviewed','Information')));
CREATE TABLE public.hori_reviews(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.hori_workspaces(id) ON DELETE CASCADE,risk_id uuid NOT NULL,data jsonb NOT NULL CHECK(public.hori_fields_valid(data,ARRAY['notes','decision'])),created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(workspace_id,risk_id) REFERENCES public.hori_risks(workspace_id,id) ON DELETE CASCADE,CHECK(data->>'decision' IN ('No change required','Risk updated','Further investigation')));

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['hori_workspaces','hori_profiles','hori_objectives','hori_risks','hori_kris','hori_readings','hori_sources','hori_signals','hori_reviews'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE ON public.%I TO authenticated',t);
  IF t='hori_workspaces' THEN
   EXECUTE format('CREATE POLICY hori_owner ON public.%I TO authenticated USING(id=(SELECT auth.uid())) WITH CHECK(id=(SELECT auth.uid()))',t);
  ELSE
   EXECUTE format('CREATE POLICY hori_owner ON public.%I TO authenticated USING(workspace_id=(SELECT auth.uid())) WITH CHECK(workspace_id=(SELECT auth.uid()))',t);
   EXECUTE format('CREATE INDEX ON public.%I(workspace_id)',t);
  END IF;
 END LOOP;
END $$;
-- Readings and review evidence are append-only from the browser.
REVOKE UPDATE ON public.hori_readings,public.hori_reviews FROM authenticated;

CREATE OR REPLACE FUNCTION public.hori_bind_record() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE objective record; risk record; kri record; v numeric; state text;
BEGIN
 IF TG_TABLE_NAME='hori_risks' THEN
  SELECT * INTO STRICT objective FROM public.hori_objectives WHERE workspace_id=NEW.workspace_id AND id=NEW.objective_id;
  NEW.data:=NEW.data || jsonb_build_object('objectiveId',NEW.objective_id,'objectiveYear',objective.year,'objective',(objective.data->>'title')||' - '||(objective.data->>'target'));
 ELSIF TG_TABLE_NAME='hori_sources' OR TG_TABLE_NAME='hori_signals' THEN
  IF NEW.risk_id IS NOT NULL THEN
   SELECT * INTO STRICT risk FROM public.hori_risks WHERE workspace_id=NEW.workspace_id AND id=NEW.risk_id;
   IF risk.objective_id<>NEW.objective_id THEN RAISE EXCEPTION 'Risk must belong to the selected objective'; END IF;
  END IF;
  NEW.data:=NEW.data || jsonb_build_object('objectiveId',NEW.objective_id,'riskId',NEW.risk_id);
  IF TG_TABLE_NAME='hori_signals' THEN
   PERFORM (NEW.data->>'observedAt')::date;
   NEW.data:=NEW.data || jsonb_build_object('sourceId',NEW.source_id);
  END IF;
 ELSIF TG_TABLE_NAME='hori_kris' OR TG_TABLE_NAME='hori_reviews' THEN
  NEW.data:=NEW.data || jsonb_build_object('riskId',NEW.risk_id);
  IF TG_TABLE_NAME='hori_reviews' THEN NEW.data:=NEW.data || jsonb_build_object('reviewedAt',now()); END IF;
 ELSIF TG_TABLE_NAME='hori_readings' THEN
  SELECT * INTO STRICT kri FROM public.hori_kris WHERE workspace_id=NEW.workspace_id AND id=NEW.kri_id;
  PERFORM (NEW.data->>'observedAt')::date;
  v:=((NEW.data->>'value'))::numeric;
  state:=CASE WHEN (kri.data->>'direction'='Above' AND v >= (kri.data->>'critical')::numeric) OR (kri.data->>'direction'='Below' AND v <= (kri.data->>'critical')::numeric) THEN 'Critical' WHEN (kri.data->>'direction'='Above' AND v >= (kri.data->>'warning')::numeric) OR (kri.data->>'direction'='Below' AND v <= (kri.data->>'warning')::numeric) THEN 'Warning' ELSE 'Normal' END;
  NEW.data:=NEW.data || jsonb_build_object('kriId',NEW.kri_id,'status',state);
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.hori_bind_record() FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['hori_risks','hori_sources','hori_signals','hori_kris','hori_readings','hori_reviews'] LOOP
  EXECUTE format('CREATE TRIGGER hori_bind BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.hori_bind_record()',t);
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.hori_reading_signal() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE kri record; risk record;
BEGIN
 IF NEW.data->>'status'='Normal' THEN RETURN NEW; END IF;
 SELECT * INTO STRICT kri FROM public.hori_kris WHERE workspace_id=NEW.workspace_id AND id=NEW.kri_id;
 SELECT * INTO STRICT risk FROM public.hori_risks WHERE workspace_id=NEW.workspace_id AND id=kri.risk_id;
 INSERT INTO public.hori_signals(workspace_id,objective_id,risk_id,dedupe_key,data) VALUES(NEW.workspace_id,risk.objective_id,risk.id,'kri:'||NEW.id,jsonb_build_object('title',(kri.data->>'name')||': '||lower(NEW.data->>'status')||' threshold breached','details',(NEW.data->>'value')||' '||(kri.data->>'unit')||'. '||coalesce(NEW.data->>'notes',''),'observedAt',NEW.data->>'observedAt','kind','kri','action','Reassess','status','Open','kriId',kri.id,'readingId',NEW.id));
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.hori_reading_signal() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER hori_reading_signal AFTER INSERT ON public.hori_readings FOR EACH ROW EXECUTE FUNCTION public.hori_reading_signal();
CREATE OR REPLACE FUNCTION public.hori_objective_refresh() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN UPDATE public.hori_risks SET data=data || jsonb_build_object('objective',(NEW.data->>'title')||' - '||(NEW.data->>'target'),'objectiveYear',NEW.year) WHERE workspace_id=NEW.workspace_id AND objective_id=NEW.id; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.hori_objective_refresh() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER hori_objective_refresh AFTER UPDATE ON public.hori_objectives FOR EACH ROW EXECUTE FUNCTION public.hori_objective_refresh();
NOTIFY pgrst,'reload schema';
COMMIT;
