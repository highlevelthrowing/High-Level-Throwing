import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velocity Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Velocity Leaderboard</div>
        <h2>Join the HLT Leaderboard</h2>
        <p>
          Join the HLT Leaderboard and compete against athletes around the world! Earn your VELOCITY BADGE and
          showcase them in your recruiting profiles! Do you have the strongest arm on the field?
        </p>
        <p style={{ fontSize: "0.85rem", marginTop: 18 }}>
          *To join the leaderboard you must attend a 2026 HLT Clinic, Receive a Video Assessment or be Accepted
          through one of our Partners.
        </p>
        <p style={{ fontSize: "0.85rem", marginTop: 8 }}>*All velocity numbers have been verified.</p>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
        <iframe
          src="/api/embed/leaderboard"
          title="Velocity Leaderboard"
          style={{ width: "100%", height: 1600, border: "none", background: "#fff", display: "block" }}
        />
      </div>
    </section>
  );
}
