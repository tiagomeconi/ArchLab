import { useEffect, useState } from "react";
import { authEnabled, useAuth } from "../auth";
import { getAssessmentProfile, type AssessmentProfile } from "../assessments";
export function useAssessmentProfile(handle?: string) {
  const auth = useAuth();
  const [profile, setProfile] = useState<AssessmentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true; setLoading(true); setError(false); setProfile(null);
    if (!authEnabled || (!handle && auth.status !== "in")) { setLoading(false); return; }
    getAssessmentProfile(handle).then((p) => { if (alive) { setProfile(p); setLoading(false); setError(!p); } }).catch(() => { if (alive) { setLoading(false); setError(true); } });
    return () => { alive = false; };
  }, [handle, auth.user?.id, auth.status, revision]);
  return { profile, loading, error, reload: () => setRevision((v) => v + 1) };
}
