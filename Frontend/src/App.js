import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/Sidepanel";
import StandingsWidget from "./components/StandingsPage";
import AboutUs from "./components/AboutUs";
import Register from "./components/Register";
import SignIn from "./components/SignIn";
import VerifyOTP from "./components/VerifyOTP";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import FantasyLeague from "./components/FantasyLeague";
import TopScorers from "./components/TopScorers";
import LeagueStats from "./components/LeagueStats";
import NewsPage from "./components/NewsPage";
import HomePage from "./components/HomePage";
import MatchDetails from "./components/MatchDetails";
import LeagueOverview from "./components/LeagueOverview";
import MatchPredictor from "./components/MatchPredictor";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("PL");
  const [selectedLeagueName, setSelectedLeagueName] =
    useState("Premier League");

  const handleSelectLeague = (leagueId, leagueName) => {
    setSelectedLeagueId(leagueId);
    setSelectedLeagueName(leagueName);
  };

  const renderWithSidePanel = (Component, props) => {
    return (
      <div className="flex">
        <SidePanel onSelectLeague={handleSelectLeague} />
        <div className="flex-grow">
          <Component {...props} />
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <Routes>
          {/* Home and Main Features */}
          <Route
            path="/"
            element={renderWithSidePanel(HomePage, {
              leagueId: selectedLeagueId,
              leagueName: selectedLeagueName,
            })}
          />

          <Route
            path="/league/:id"
            element={renderWithSidePanel(LeagueOverview, {
              leagueId: selectedLeagueId,
              leagueName: selectedLeagueName,
            })}
          />

          <Route path="/match/:id" element={<MatchDetails />} />
          <Route
            path="/standings"
            element={renderWithSidePanel(StandingsWidget, {
              leagueId: selectedLeagueId,
              leagueName: selectedLeagueName,
            })}
          />

          {/* League Related Routes */}
          <Route
            path="/leagues"
            element={renderWithSidePanel(LeagueStats, {
              leagueId: selectedLeagueId,
            })}
          />
          <Route
            path="/top-scorers"
            element={renderWithSidePanel(TopScorers, {
              leagueId: selectedLeagueId,
            })}
          />

          {/* News Section */}
          <Route
            path="/news"
            element={renderWithSidePanel(NewsPage, {
              leagueId: selectedLeagueId,
            })}
          />

          {/* Fantasy League */}
          <Route
            path="/fantasy"
            element={renderWithSidePanel(FantasyLeague, {
              leagueId: selectedLeagueId,
            })}
          />

          {/* Match Predictor */}
          <Route
            path="/predictor"
            element={renderWithSidePanel(MatchPredictor, {
              leagueId: selectedLeagueId,
              userId: "currentUserId", // Replace with actual user ID
            })}
          />

          {/* Authentication Routes */}
          <Route
            path="/signin"
            element={<SignIn setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/register"
            element={<Register setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/verify-otp"
            element={<VerifyOTP setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
