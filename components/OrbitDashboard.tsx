"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_W = 760;
const CANVAS_H = 524;
const CENTER_X = CANVAS_W / 2;
const CENTER_Y = CANVAS_H / 2;
const ORBIT_RX = 300;
const ORBIT_RY = 190;

const DEFAULT_ACTIVITY_FEED = [
  "Scheduler booked a call with Verve Audio",
  "Initial Outreach drafted a pitch for Northbound Coffee",
  "Research found 3 new brands in your niche",
];

export interface OrbitAgentData {
  id: string;
  name: string;
  initials: string;
  icon: string;
  status: "working" | "idle" | "paused";
  task: string;
  score: number;
}

function agentPosition(index: number, count: number) {
  const angle = -Math.PI / 2 + index * ((2 * Math.PI) / count);
  return {
    x: CENTER_X + ORBIT_RX * Math.cos(angle),
    y: CENTER_Y + ORBIT_RY * Math.sin(angle),
  };
}

export default function OrbitDashboard({
  agents,
  activityFeed = DEFAULT_ACTIVITY_FEED,
  centerNumber = "12",
  centerLabel = "brands this month",
  centerImageUrl,
}: {
  agents: OrbitAgentData[];
  activityFeed?: string[];
  centerNumber?: string | number;
  centerLabel?: string;
  centerImageUrl?: string | null;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const resize = () => {
      const w = el.clientWidth;
      setScale(Math.min(1, w / CANVAS_W));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!activityFeed.length) return;
    const id = setInterval(() => {
      setFeedIndex((i) => (i + 1) % activityFeed.length);
    }, 4000);
    return () => clearInterval(id);
  }, [activityFeed]);

  const anyWorking = agents.some((a) => a.status === "working");
  const feedLines = activityFeed.length
    ? [
        activityFeed[feedIndex % activityFeed.length],
        activityFeed[(feedIndex + 1) % activityFeed.length],
      ]
    : [];

  return (
    <div className="orbit-card">
      <div className="orbit-topbar">
        <div className="orbit-pills">
          <span className="pill pill-active">Everyone</span>
          <span className="pill">Deal Team</span>
        </div>
        {anyWorking && (
          <div className="orbit-badge">
            <span className="dot dot-pulse" />
            Working now
          </div>
        )}
      </div>

      <div
        className="orbit-stage-wrapper"
        ref={wrapperRef}
        style={{ height: CANVAS_H * scale }}
      >
        <div
          className="orbit-stage"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <div className="orbit-ring orbit-ring-outer" />
          <div className="orbit-ring orbit-ring-inner" />

          <div className="orbit-particles" aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="rise-particle"
                style={{
                  left: `${(i * 97) % 100}%`,
                  animationDelay: `${i * 0.9}s`,
                }}
              />
            ))}
          </div>

          <svg
            className="orbit-connectors"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            aria-hidden
          >
            {agents.map((agent, i) => {
              const pos = agentPosition(i, agents.length);
              const pathId = `orbit-path-${agent.id}`;
              return (
                <g key={agent.id}>
                  <path
                    id={pathId}
                    d={`M ${pos.x} ${pos.y} L ${CENTER_X} ${CENTER_Y}`}
                    className="connector-line"
                  />
                  <circle r="2.5" className="connector-particle">
                    <animateMotion
                      dur="2.6s"
                      repeatCount="indefinite"
                      begin={`${i * 0.4}s`}
                    >
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                </g>
              );
            })}
          </svg>

          <div className="orbit-center">
            <div className="orbit-center-ring">
              <div className="orbit-center-pulse" />
              <div className="orbit-center-pulse orbit-center-pulse-delay" />
              <div className="orbit-center-core">
                {centerImageUrl ? (
                  <img src={centerImageUrl} alt="" className="orbit-center-photo" />
                ) : (
                  <>
                    <span className="orbit-center-number">{centerNumber}</span>
                    <span className="orbit-center-label">{centerLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {agents.map((agent, i) => {
            const pos = agentPosition(i, agents.length);
            return (
              <div
                key={agent.id}
                className="orbit-agent-pos"
                style={{ left: pos.x, top: pos.y }}
              >
                <div
                  className="orbit-agent-float"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="orbit-agent-avatar">
                    <span>{agent.initials}</span>
                    <span className="orbit-agent-badge">{agent.icon}</span>
                  </div>
                  <div className="orbit-agent-name">
                    <span
                      className={`dot ${
                        agent.status === "working" ? "dot-pulse" : ""
                      }`}
                    />
                    {agent.name}
                  </div>
                  <div className="orbit-agent-bar">
                    <div
                      className="orbit-agent-bar-fill"
                      style={{ width: `${agent.score}%` }}
                    />
                  </div>
                  <div className="orbit-agent-chip">{agent.task}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {feedLines.length > 0 && (
        <div className="orbit-feed" aria-live="polite">
          {feedLines.map((line, i) => (
            <div key={`${line}-${i}`} className="orbit-feed-line">
              ✓ {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
