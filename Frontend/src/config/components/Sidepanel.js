import { useNavigate } from "react-router-dom";

export default function SidePanel({ onSelectLeague }) {
  const navigate = useNavigate();

  const leagues = [
    {
      id: "PL",
      name: "Premier League",
      logo: "/premier-league.png",
      code: "2021",
    },
    {
      id: "CL",
      name: "UEFA Champions League",
      logo: "/champions-league.png",
      code: "2001",
    },
    {
      id: "EL",
      name: "UEFA Europa League",
      logo: "/europa-league.png",
      code: "2146",
    },
    { id: "SA", name: "Serie A", logo: "/serie-a.png", code: "2019" },
    { id: "PD", name: "La Liga", logo: "/la-liga.png", code: "2014" },
    { id: "BL1", name: "Bundesliga", logo: "/bundesliga.png", code: "2002" },
    { id: "FL1", name: "Ligue 1", logo: "/ligue-1.png", code: "2015" },
  ];

  const handleLeagueSelect = (league) => {
    onSelectLeague(league.id, league.name);
    navigate(`/league/${league.id}`);
  };

  return (
    <aside className="w-64 bg-[#242937] shadow-lg rounded-lg overflow-hidden m-6">
      <div className="bg-[#1e2330] p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Leagues</h2>
      </div>
      <nav className="divide-y divide-gray-700">
        {leagues.map((league) => (
          <div
            key={league.id}
            className="px-4 py-3 hover:bg-[#2a303f] cursor-pointer flex items-center transition-colors"
            onClick={() => handleLeagueSelect(league)}
          >
            <img
              src={league.logo}
              alt={`${league.name} logo`}
              className="w-8 h-8 mr-4 object-contain bg-white p-1 rounded-full"
            />
            <span className="text-gray-300 hover:text-white transition-colors">
              {league.name}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
