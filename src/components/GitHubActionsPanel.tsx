import { useEffect, useState } from "react";
import {
  CheckCircle2, CircleDot, Clock3, ExternalLink, GitCommitHorizontal,
  GitBranch, LoaderCircle, Rocket, XCircle,
} from "lucide-react";

const ACTIONS_API = "https://api.github.com/repos/aroshak/Portfolio-Globe/actions/runs?per_page=8";
const ACTIONS_URL = "https://github.com/aroshak/Portfolio-Globe/actions";

type WorkflowRun = {
  id: number;
  name: string;
  display_title: string;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null | string;
  head_sha: string;
  html_url: string;
  run_number: number;
  event: string;
  created_at: string;
  updated_at: string;
};

function relativeTime(value: string) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000], ["month", 2_592_000], ["day", 86_400],
    ["hour", 3_600], ["minute", 60], ["second", 1],
  ];
  const [unit, size] = units.find(([, size]) => seconds >= size) ?? units[units.length - 1];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-Math.floor(seconds / size), unit);
}

function duration(run: WorkflowRun) {
  const elapsed = Math.max(0, new Date(run.updated_at).getTime() - new Date(run.created_at).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1000);
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function stateFor(run: WorkflowRun) {
  if (run.status !== "completed") return { label: run.status.replace("_", " "), kind: "running", Icon: LoaderCircle };
  if (run.conclusion === "success") return { label: "deployed", kind: "success", Icon: CheckCircle2 };
  if (run.conclusion === "failure") return { label: "failed", kind: "failure", Icon: XCircle };
  return { label: run.conclusion ?? "completed", kind: "neutral", Icon: CircleDot };
}

export function GitHubActionsPanel() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(ACTIONS_API, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        return response.json();
      })
      .then((data) => setRuns(Array.isArray(data.workflow_runs) ? data.workflow_runs : []))
      .catch((reason) => { if (reason?.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const successful = runs.filter((run) => run.conclusion === "success").length;
  const latest = runs[0];

  return (
    <div className="actions-console" aria-live="polite">
      <div className="actions-console-head">
        <div>
          <span className="actions-live"><i /> LIVE REPOSITORY TELEMETRY</span>
          <h3>GitHub Actions → Docker → VPS</h3>
          <p>Every push is compiled, browser-tested, packaged as a container and promoted to the production host.</p>
        </div>
        <a href={ACTIONS_URL} target="_blank" rel="noreferrer">OPEN ACTIONS <ExternalLink size={12}/></a>
      </div>

      {loading && <div className="actions-loading"><LoaderCircle size={18}/><span>SYNCING WORKFLOW RUNS</span></div>}
      {error && <div className="actions-loading actions-error"><XCircle size={18}/><span>LIVE HISTORY UNAVAILABLE · VIEW ON GITHUB</span></div>}

      {!loading && !error && <>
        <div className="actions-metrics">
          <div><GitBranch size={15}/><span>WORKFLOW</span><strong>{latest?.name ?? "Deploy VPS"}</strong></div>
          <div><Rocket size={15}/><span>SUCCESS / VISIBLE</span><strong>{successful} / {runs.length}</strong></div>
          <div><GitCommitHorizontal size={15}/><span>HEAD COMMIT</span><strong>{latest?.head_sha.slice(0, 7) ?? "—"}</strong></div>
          <div><Clock3 size={15}/><span>LAST DELIVERY</span><strong>{latest ? relativeTime(latest.updated_at) : "—"}</strong></div>
        </div>

        <div className="actions-run-list">
          {runs.map((run, index) => {
            const state = stateFor(run);
            return <a className="actions-run" href={run.html_url} target="_blank" rel="noreferrer" key={run.id}>
              <span className="actions-rail"><i className={state.kind}/>{index < runs.length - 1 && <b/>}</span>
              <span className={`actions-state ${state.kind}`}><state.Icon size={13}/>{state.label}</span>
              <span className="actions-run-copy"><strong>{run.display_title}</strong><small>RUN #{run.run_number} · {run.event.toUpperCase()} · {run.head_sha.slice(0, 7)}</small></span>
              <span className="actions-run-time"><strong>{relativeTime(run.created_at)}</strong><small>{duration(run)}</small></span>
              <ExternalLink className="actions-open" size={12}/>
            </a>;
          })}
        </div>
      </>}
    </div>
  );
}
