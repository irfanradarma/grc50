-- Hosted validation: synthetic identities and all fixture data roll back.
BEGIN;
SELECT set_config('hori.test_a',gen_random_uuid()::text,true),set_config('hori.test_b',gen_random_uuid()::text,true);
INSERT INTO auth.users(id,is_anonymous) VALUES(current_setting('hori.test_a')::uuid,true),(current_setting('hori.test_b')::uuid,true);
SELECT set_config('request.jwt.claim.sub',current_setting('hori.test_a'),true);
SET LOCAL ROLE authenticated;
INSERT INTO public.hori_workspaces(id) VALUES(auth.uid());
INSERT INTO public.hori_profiles(workspace_id,data) VALUES(auth.uid(),'{"name":"Synthetic RLS test","sector":"Public sector"}');
WITH saved AS(INSERT INTO public.hori_objectives(workspace_id,year,data) VALUES(auth.uid(),2026,'{"title":"Synthetic objective","target":"95%","owner":"QA"}') RETURNING id) SELECT set_config('hori.objective',id::text,true) FROM saved;
WITH saved AS(INSERT INTO public.hori_risks(workspace_id,objective_id,data) VALUES(auth.uid(),current_setting('hori.objective')::uuid,'{"title":"Synthetic risk","cause":"Test cause","event":"Test event","impact":"Test impact","owner":"QA","likelihood":3,"impactScore":3,"category":"Operational","status":"Draft"}') RETURNING id) SELECT set_config('hori.risk',id::text,true) FROM saved;
WITH saved AS(INSERT INTO public.hori_kris(workspace_id,risk_id,data) VALUES(auth.uid(),current_setting('hori.risk')::uuid,'{"name":"Synthetic indicator","unit":"%","owner":"QA","frequency":"Monthly","direction":"Above","warning":5,"critical":10}') RETURNING id) SELECT set_config('hori.kri',id::text,true) FROM saved;
INSERT INTO public.hori_readings(workspace_id,kri_id,data) VALUES(auth.uid(),current_setting('hori.kri')::uuid,'{"value":12,"observedAt":"2026-10-11","notes":"Synthetic breach"}');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.hori_signals WHERE data->>'status'='Open')<>1 THEN RAISE EXCEPTION 'KRI breach did not generate a signal'; END IF;
 IF (SELECT data->>'objective' FROM public.hori_risks LIMIT 1)<>'Synthetic objective - 95%' THEN RAISE EXCEPTION 'Objective snapshot failed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub',current_setting('hori.test_b'),true);
INSERT INTO public.hori_workspaces(id) VALUES(auth.uid());
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.hori_profiles) OR EXISTS(SELECT 1 FROM public.hori_risks) OR EXISTS(SELECT 1 FROM public.hori_kris) OR EXISTS(SELECT 1 FROM public.hori_readings) OR EXISTS(SELECT 1 FROM public.hori_signals) THEN RAISE EXCEPTION 'Cross-guest rows leaked'; END IF;
 BEGIN INSERT INTO public.hori_profiles(workspace_id,data) VALUES(current_setting('hori.test_a')::uuid,'{"name":"Forbidden","sector":"QA"}'); RAISE EXCEPTION 'Foreign workspace write succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.hori_kris(workspace_id,risk_id,data) VALUES(auth.uid(),current_setting('hori.risk')::uuid,'{"name":"Forbidden","unit":"%","owner":"QA","frequency":"Monthly","direction":"Above","warning":5,"critical":10}'); RAISE EXCEPTION 'Foreign risk reference succeeded'; EXCEPTION WHEN foreign_key_violation THEN NULL; END;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.hori_risks; RAISE EXCEPTION 'Unauthenticated access succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'PASS: hosted RLS, foreign writes/references, objective links, and automatic KRI signals' AS result;
ROLLBACK;
