import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import FootballQuiz from "./components/FootballQuiz";
import PreferenceSelector from "./components/PreferenceSelector";
function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("PL");
  const [selectedLeagueName, setSelectedLeagueName] =
    useState("Premier League");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <main className="flex-grow">
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

            <Route
              path="/news"
              element={renderWithSidePanel(NewsPage, {
                leagueId: selectedLeagueId,
              })}
            />

            <Route
              path="/fantasy"
              element={renderWithSidePanel(FantasyLeague, {
                leagueId: selectedLeagueId,
              })}
            />

            <Route
              path="/predictor"
              element={renderWithSidePanel(MatchPredictor, {
                leagueId: selectedLeagueId,
                userId: "currentUserId",
              })}
            />

            <Route
              path="/quiz"
              element={renderWithSidePanel(FootballQuiz, {
                leagueId: selectedLeagueId,
              })}
            />

            <Route
              path="/preferences"
              element={<PreferenceSelector user={user} />} // Correctly pass the component
            />

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
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
