import {
  Bot, Boxes, CheckCircle2, CloudCog, GitBranch,
  Network, PackageCheck, Play, Search, Server, ShieldCheck, Sparkles, TestTube2,
  UserRound, WandSparkles,
} from "lucide-react";
import {
  siDocker, siGithub, siGithubactions, siNodedotjs, siOpenrouter,
  siReact, siThreedotjs, siTypescript, siVite, type SimpleIcon,
} from "simple-icons";
import { Reveal } from "./motion";

function BrandIcon({ icon, size = 22, label }: { icon: SimpleIcon; size?: number; label?: string }) {
  return <svg className="brand-icon" width={size} height={size} viewBox="0 0 24 24" role={label ? "img" : undefined} aria-label={label}><path d={icon.path} fill="currentColor" /></svg>;
}

const agents = [
  { icon: Search, name: "SCOUT", task: "Map repository" },
  { icon: Sparkles, name: "RESEARCHER", task: "Verify sources + APIs" },
  { icon: Boxes, name: "WORKER", task: "Build isolated lanes" },
  { icon: ShieldCheck, name: "REVIEWER", task: "Fresh-context review" },
];

const delivery = [
  { brand: siGithub, name: "GITHUB", meta: "main branch", state: "SOURCE" },
  { brand: siGithubactions, name: "GITHUB ACTIONS", meta: "workflow trigger", state: "AUTOMATED" },
  { icon: TestTube2, name: "CI TEST GATE", meta: "typecheck · build · e2e", state: "PASS" },
  { brand: siDocker, name: "DOCKER IMAGE", meta: "versioned artifact", state: "PACKAGED" },
  { icon: Server, name: "REMOTE VPS", meta: "production runtime", state: "ONLINE" },
];

const skills = [
  { name: "THREE.JS BUILDER", use: "WebGL systems" },
  { name: "WEB ACCESS", use: "Live source research" },
  { name: "GLOBE BUILDER", use: "Portfolio domain rules" },
  { name: "PLAYWRIGHT", use: "Browser verification" },
];

export function DeploymentCanvas() {
  return (
    <section className="deployment-section" aria-labelledby="deployment-title">
      <Reveal from="left" className="deployment-heading">
        <div>
          <div className="micro-label">[ 01_TARGET_ARCHITECTURE ]</div>
          <h3 id="deployment-title">One intent. An agent workforce. A verified path to production.</h3>
        </div>
        <div className="simulation-badge"><span /> TARGET-STATE SIMULATION</div>
      </Reveal>

      <Reveal from="scale">
        <div className="deployment-canvas">
          <div className="canvas-grid" aria-hidden="true" />
          <div className="canvas-scan" aria-hidden="true" />

          <header className="canvas-toolbar">
            <div><Network size={13} /> DELIVERY CONTROL PLANE</div>
            <div className="canvas-telemetry">
              <span><i /> AGENTS 06</span><span><i /> TESTS PASS</span><span><i /> VPS ONLINE</span>
            </div>
          </header>

          <div className="environment-foundation">
            <div className="foundation-title"><PackageCheck size={14} /> REPRODUCIBLE ENVIRONMENT BOOT</div>
            <div className="foundation-flow">
              <span><b>01</b> SETUP.SH</span><i />
              <span><BrandIcon icon={siNodedotjs} size={11} /><b>02</b> NODE 20+</span><i />
              <span><b>03</b> HERDR SESSION</span><i />
              <span><BrandIcon icon={siOpenrouter} size={11} /><b>04</b> PI + OPENROUTER</span><i />
              <span><b>05</b> SKILLS + GRAPHIFY</span><i />
              <span><b>06</b> AUDIT / DRIFT CHECK</span>
            </div>
          </div>

          <div className="architecture-flow">
            <div className="orchestration-lane">
              <div className="lane-label">AGENT ENVIRONMENT <small>REPRODUCIBLE / PERSISTENT</small></div>
              <div className="intent-row">
                <article className="system-node intent-node">
                  <div className="node-icon"><UserRound size={18} /></div>
                  <div><b>HUMAN INTENT</b><span>Outcome + direction</span></div>
                  <em>INPUT</em>
                </article>
                <div className="flow-link horizontal"><span /></div>
                <article className="system-node lead-node">
                  <div className="node-icon"><Bot size={20} /></div>
                  <div><b>LEAD AGENT</b><span>Plan · coordinate · integrate</span></div>
                  <em>HERDR + PI</em>
                </article>
                <div className="flow-link horizontal"><span /></div>
                <article className="system-node context-node">
                  <div className="node-icon"><CloudCog size={19} /></div>
                  <div><b>GRAPHIFY CONTEXT</b><span>Architecture + dependencies</span></div>
                  <em>MEMORY</em>
                </article>
              </div>

              <div className="agent-bus"><span className="bus-pulse" /></div>
              <div className="agent-grid">
                {agents.map(({ icon: Icon, name, task }, index) => (
                  <article className="agent-node" key={name} style={{ "--agent-delay": `${index * 0.32}s` } as React.CSSProperties}>
                    <Icon size={15} /><div><b>{name}</b><span>{task}</span></div><i />
                  </article>
                ))}
              </div>

              <div className="skills-console">
                <div className="skills-console-title"><WandSparkles size={13} /><span>SKILL ROUTER</span><small>Agents load task-specific operating instructions</small></div>
                <div className="skills-grid">
                  {skills.map((skill, index) => <div key={skill.name} style={{ "--skill-delay": `${index * .25}s` } as React.CSSProperties}><i /><b>{skill.name}</b><span>{skill.use}</span></div>)}
                </div>
              </div>

              <div className="merge-path"><span /></div>
              <article className="verified-output">
                <CheckCircle2 size={17} /><div><b>VERIFIED CHANGESET</b><span>React · TypeScript · Vite · Three.js</span></div>
                <div className="changeset-brands" aria-label="React, TypeScript, Vite and Three.js"><BrandIcon icon={siReact} size={14} /><BrandIcon icon={siTypescript} size={14} /><BrandIcon icon={siVite} size={14} /><BrandIcon icon={siThreedotjs} size={14} /></div>
                <strong>READY TO SHIP</strong>
              </article>
            </div>

            <div className="handoff-bridge"><GitBranch size={14} /><span>COMMIT + PUSH</span><i /></div>

            <div className="delivery-lane">
              <div className="lane-label">AUTOMATED DELIVERY <small>SIMULATED FINISHED STATE</small></div>
              <div className="delivery-track">
                {delivery.map(({ icon: Icon, brand, name, meta, state }, index) => (
                  <div className="delivery-step-wrap" key={name}>
                    <article className="delivery-node">
                      <div className="delivery-index">0{index + 1}</div>
                      {brand ? <BrandIcon icon={brand} size={25} label={`${name} logo`} /> : Icon ? <Icon size={22} /> : null}
                      <b>{name}</b><span>{meta}</span><em>{state}</em>
                    </article>
                    {index < delivery.length - 1 && <div className="delivery-link"><span style={{ animationDelay: `${index * .45}s` }} /></div>}
                  </div>
                ))}
              </div>
              <div className="runtime-strip">
                <span><i /> HTTPS HEALTHY</span><span>CONTAINER 01/01</span><span>DEPLOY 00:42</span><span>ROLLBACK READY</span>
              </div>
            </div>
          </div>

          <footer className="canvas-footer">
            <span><Play size={11} fill="currentColor" /> LIVE FLOW SIMULATION</span>
            <p>The environment and agent workflow are operational. GitHub Actions, Docker packaging and VPS delivery are shown as the simulated finished deployment state.</p>
          </footer>
        </div>
      </Reveal>
    </section>
  );
}
