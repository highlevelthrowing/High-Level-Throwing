import Image from "next/image";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className={`team-grid${members.length >= 3 ? " team-grid-3" : ""}`}>
      {members.map((m) => (
        <div className="team-card" key={m.name}>
          <div className="team-avatar">
            <Image src={m.image} alt={m.name} width={84} height={84} unoptimized />
          </div>
          <h4>{m.name}</h4>
          <div className="role">{m.role}</div>
          <p>{m.bio}</p>
        </div>
      ))}
    </div>
  );
}
