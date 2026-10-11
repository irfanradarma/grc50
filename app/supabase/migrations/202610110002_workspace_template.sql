BEGIN;
CREATE OR REPLACE FUNCTION public.hori_seed_template(bundle jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE w uuid:=auth.uid(); e jsonb; d jsonb; o jsonb; k jsonb; s jsonb; rid uuid; oid uuid; kid uuid; sid uuid; ids jsonb:='{}';
BEGIN
 IF w IS NULL THEN RAISE EXCEPTION 'Enter a guest workspace first'; END IF;
 IF bundle->>'id' IS DISTINCT FROM 'public-service-v1' OR octet_length(bundle::text)>64000 THEN RAISE EXCEPTION 'Unknown or oversized template'; END IF;
 PERFORM 1 FROM public.hori_workspaces WHERE id=w FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Workspace not found'; END IF;
 IF EXISTS(SELECT 1 FROM public.hori_profiles WHERE workspace_id=w) OR EXISTS(SELECT 1 FROM public.hori_objectives WHERE workspace_id=w) OR EXISTS(SELECT 1 FROM public.hori_risks WHERE workspace_id=w) THEN RAISE EXCEPTION 'Templates can only be applied to an empty workspace. Existing data was preserved.'; END IF;
 INSERT INTO public.hori_profiles(workspace_id,data) VALUES(w,bundle->'profile');
 UPDATE public.hori_workspaces SET name=bundle->'profile'->>'name' WHERE id=w;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'objectives') LOOP
  oid:=gen_random_uuid();ids:=ids || jsonb_build_object('objective:'||(e->>'key'),oid);
  INSERT INTO public.hori_objectives(id,workspace_id,year,data) VALUES(oid,w,(e->>'year')::integer,e-'key'-'year');
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'risks') LOOP
  rid:=gen_random_uuid();ids:=ids || jsonb_build_object('risk:'||(e->>'key'),rid);oid:=(ids->>('objective:'||(e->>'objectiveKey')))::uuid;
  INSERT INTO public.hori_risks(id,workspace_id,objective_id,data) VALUES(rid,w,oid,e-'key'-'objectiveKey');
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'kris') LOOP
  kid:=gen_random_uuid();ids:=ids || jsonb_build_object('kri:'||(e->>'key'),kid);rid:=(ids->>('risk:'||(e->>'riskKey')))::uuid;
  INSERT INTO public.hori_kris(id,workspace_id,risk_id,data) VALUES(kid,w,rid,e-'key'-'riskKey');
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'readings') LOOP
  kid:=(ids->>('kri:'||(e->>'kriKey')))::uuid;
  INSERT INTO public.hori_readings(workspace_id,kri_id,data) VALUES(w,kid,e-'kriKey');
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'sources') LOOP
  sid:=gen_random_uuid();ids:=ids || jsonb_build_object('source:'||(e->>'key'),sid);oid:=(ids->>('objective:'||(e->>'objectiveKey')))::uuid;rid:=(ids->>('risk:'||(e->>'riskKey')))::uuid;
  INSERT INTO public.hori_sources(id,workspace_id,objective_id,risk_id,data) VALUES(sid,w,oid,rid,e-'key'-'objectiveKey'-'riskKey');
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'reports') LOOP
  sid:=(ids->>('source:'||(e->>'sourceKey')))::uuid;SELECT to_jsonb(src) INTO STRICT s FROM public.hori_sources src WHERE workspace_id=w AND id=sid;
  d:=(e-'sourceKey') || jsonb_build_object('kind',s->'data'->>'kind','action',CASE WHEN s->>'risk_id' IS NULL THEN 'Identify' ELSE 'Reassess' END,'status',CASE WHEN e->>'outcome'='Issue' THEN 'Open' ELSE 'Information' END);
  INSERT INTO public.hori_signals(workspace_id,objective_id,risk_id,source_id,data) VALUES(w,(s->>'objective_id')::uuid,(s->>'risk_id')::uuid,sid,d);
 END LOOP;
 FOR e IN SELECT value FROM jsonb_array_elements(bundle->'reviews') LOOP
  rid:=(ids->>('risk:'||(e->>'riskKey')))::uuid;INSERT INTO public.hori_reviews(workspace_id,risk_id,data) VALUES(w,rid,e-'riskKey');
 END LOOP;
 RETURN jsonb_build_object('saved',true,'templateId',bundle->>'id');
END $$;
REVOKE ALL ON FUNCTION public.hori_seed_template(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hori_seed_template(jsonb) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
