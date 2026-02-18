import { useState } from "react";
import TeamCard from "../components/TeamCard";

interface Team {
  id: number;
  name: string;
  hackathon: string;
  mode: string;
  roleNeeded: string;
  experience: string;
  skills: string[];
  membersOpen: number;
}

const ExploreTeamsPage = () => {
  const [teams] = useState<Team[]>([
    {
      id: 1,
      name: "Hackermen",
      hackathon: "Smart India Hackathon",
      mode: "Online",
      roleNeeded: "Frontend Developer",
      experience: "Intermediate (1-2 years)",
      skills: ["React", "TypeScript", "Tailwind"],
      membersOpen: 2,
    },
    {
      id: 2,
      name: "Code Warriors",
      hackathon: "AI Challenge 2025",
      mode: "Hybrid",
      roleNeeded: "Backend Developer",
      experience: "Beginner",
      skills: ["Node.js", "MongoDB"],
      membersOpen: 1,
    },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Explore Teams</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
};

export default ExploreTeamsPage;
