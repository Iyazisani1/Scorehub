import React from "react";
import { Calendar, Clock, Activity, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const MatchCard = ({ match }) => {
  const navigate = useNavigate();
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";

  const getStatusBadge = () => {
    const baseStyles = "px-2 py-1 rounded-full text-sm font-medium";
    if (isLive) return `${baseStyles} bg-green-500 text-white animate-pulse`;
    if (isFinished) return `${baseStyles} bg-gray-500 text-white`;
    return `${baseStyles} bg-blue-500 text-white`;
  };

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-[#242937] rounded-lg shadow-lg hover:bg-[#2a303f] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden"
    >
      <div className="bg-[#1e2330] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={match.competition?.emblem}
            alt=""
            className="w-6 h-6 object-contain"
          />
          <span className="text-gray-300 font-medium">
            {match.competition?.name}
          </span>
        </div>
        <span className={getStatusBadge()}>
          {isLive
            ? "LIVE"
            : isFinished
            ? "Finished"
            : format(new Date(match.utcDate), "HH:mm")}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <TeamDisplay
            team={match.homeTeam}
            score={match.score.fullTime.home}
            isWinner={match.score?.winner === "HOME_TEAM"}
          />
          <div className="flex flex-col items-center mx-8">
            {isFinished || isLive ? (
              <div className="text-3xl font-bold text-white">
                {match.score.fullTime.home} - {match.score.fullTime.away}
              </div>
            ) : (
              <div className="text-xl font-medium text-gray-400">vs</div>
            )}
          </div>
          <TeamDisplay
            team={match.awayTeam}
            score={match.score.fullTime.away}
            isWinner={match.score?.winner === "AWAY_TEAM"}
            isAway
          />
        </div>

        {match.venue && (
          <div className="mt-4 text-sm text-gray-400 flex items-center justify-center">
            <MapPin className="w-4 h-4 mr-2" />
            {match.venue}
          </div>
        )}
      </div>
    </div>
  );
};

const TeamDisplay = ({ team, score, isWinner, isAway }) => {
  const containerClasses = `flex items-center space-x-4 ${
    isAway ? "flex-row-reverse" : "flex-row"
  }`;

  return (
    <div className={containerClasses}>
      <div className="w-12 h-12 relative flex-shrink-0">
        <img
          src={team.crest}
          alt={team.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className={`text-${isAway ? "right" : "left"}`}>
        <span className="font-medium text-white block">{team.name}</span>
        {isWinner && <span className="text-green-500 text-sm">Winner</span>}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Something went wrong
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export { MatchCard, ErrorBoundary };
