"use client";

import { useState } from "react";

const RATE = 0.1;
const CLINICS_PRICE = 160;
const PLYO_PRICE = 65;

function currency(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

type Tab = "clinics" | "assessment" | "plyo";

export default function ProgramCalculator() {
  const [tab, setTab] = useState<Tab>("clinics");

  const [clinicsVolume, setClinicsVolume] = useState(48);
  const clinicsTotal = CLINICS_PRICE * clinicsVolume;

  const [assessmentPrice, setAssessmentPrice] = useState(40);
  const [assessmentVolume, setAssessmentVolume] = useState(12);
  const assessmentTotal = assessmentPrice * assessmentVolume;

  const [plyoVolume, setPlyoVolume] = useState(100);
  const plyoTotal = PLYO_PRICE * plyoVolume;

  return (
    <div className="calc-card">
      <div className="calc-toggle">
        <button
          type="button"
          className={`calc-toggle-btn${tab === "clinics" ? " active" : ""}`}
          onClick={() => setTab("clinics")}
        >
          Clinics
        </button>
        <button
          type="button"
          className={`calc-toggle-btn${tab === "assessment" ? " active" : ""}`}
          onClick={() => setTab("assessment")}
        >
          Video Assessments
        </button>
        <button
          type="button"
          className={`calc-toggle-btn${tab === "plyo" ? " active" : ""}`}
          onClick={() => setTab("plyo")}
        >
          Plyo + Guide
        </button>
      </div>

      {tab === "clinics" && (
        <div className="calc-panel">
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Price per player</span>
              <span className="calc-value price-blur">$160</span>
            </div>
          </div>
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Number of players (min 48)</span>
              <span className="calc-value">{clinicsVolume.toLocaleString("en-US")}</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={48}
              max={150}
              step={1}
              value={clinicsVolume}
              onChange={(e) => setClinicsVolume(Number(e.target.value))}
            />
          </div>
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Revenue share to host</span>
              <span className="calc-value price-blur">10%</span>
            </div>
          </div>
          <div className="calc-results">
            <div className="calc-result">
              <div className="calc-result-label">Total Program Revenue</div>
              <div className="calc-result-value price-blur">{currency(clinicsTotal)}</div>
            </div>
            <div className="calc-result highlight">
              <div className="calc-result-label">Your Revenue Share</div>
              <div className="calc-result-value price-blur">{currency(clinicsTotal * RATE)}</div>
            </div>
          </div>
          <p className="calc-note">
            Flat team rate also available: <span className="price-blur">$2,000</span> for up to 18 players + 3
            coaches.
          </p>
          <p className="calc-note">*Revenue share eligibility starts at 48 athletes.</p>
        </div>
      )}

      {tab === "assessment" && (
        <div className="calc-panel">
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Price per athlete</span>
              <span className="calc-value price-blur">{currency(assessmentPrice)}</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={30}
              max={99}
              step={1}
              value={assessmentPrice}
              onChange={(e) => setAssessmentPrice(Number(e.target.value))}
            />
            <p className="calc-note" style={{ textAlign: "left", marginTop: 8 }}>
              Price changes based on # of athletes.
            </p>
          </div>
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Number of athletes (min 12)</span>
              <span className="calc-value">{assessmentVolume.toLocaleString("en-US")}</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={12}
              max={30000}
              step={1}
              value={assessmentVolume}
              onChange={(e) => setAssessmentVolume(Number(e.target.value))}
            />
          </div>
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Revenue share to host</span>
              <span className="calc-value price-blur">10%</span>
            </div>
          </div>
          <div className="calc-results">
            <div className="calc-result">
              <div className="calc-result-label">Total Program Revenue</div>
              <div className="calc-result-value price-blur">{currency(assessmentTotal)}</div>
            </div>
            <div className="calc-result highlight">
              <div className="calc-result-label">Your Revenue Share</div>
              <div className="calc-result-value price-blur">{currency(assessmentTotal * RATE)}</div>
            </div>
          </div>
          <p className="calc-note">*Revenue share eligibility starts at 50 athletes.</p>
        </div>
      )}

      {tab === "plyo" && (
        <div className="calc-panel">
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Price per player</span>
              <span className="calc-value price-blur">$65</span>
            </div>
          </div>
          <div className="calc-row">
            <div className="calc-label-row">
              <span>Number of players (min 12)</span>
              <span className="calc-value">{plyoVolume.toLocaleString("en-US")}</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={12}
              max={1000}
              step={1}
              value={plyoVolume}
              onChange={(e) => setPlyoVolume(Number(e.target.value))}
            />
          </div>
          <div className="calc-results">
            <div className="calc-result highlight" style={{ gridColumn: "1 / -1" }}>
              <div className="calc-result-label">Total Program Cost</div>
              <div className="calc-result-value price-blur">{currency(plyoTotal)}</div>
            </div>
          </div>
          <p className="calc-note">
            No revenue share on this offering — cost is passed through at <span className="price-blur">$65</span>{" "}
            per player.
          </p>
        </div>
      )}

      <p className="calc-note">Estimate only — final revenue share is set in your program agreement.</p>
    </div>
  );
}
