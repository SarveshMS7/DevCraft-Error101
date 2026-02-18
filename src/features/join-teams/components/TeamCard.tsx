import { Users, MapPin, Briefcase } from "lucide-react";

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

interface Props {
  team: Team;
}

const TeamCard = ({ team }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-xl transition duration-300">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{team.name}</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
          {team.mode}
        </span>
      </div>

      <p className="text-gray-600 mt-1">{team.hackathon}</p>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Briefcase size={16} /> {team.roleNeeded}
        </div>

        <div className="flex items-center gap-2">
          <Users size={16} /> Open Spots: {team.membersOpen}
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} /> {team.experience}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {team.skills.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Request to Join
      </button>
    </div>
  );
};

export default TeamCard;
