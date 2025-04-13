import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SidePanel from "./components/Sidepanel";
import StandingsPage from "./components/StandingsPage";
import AboutUs from "./components/AboutUs";
import Register from "./components/Register";
import SignIn from "./components/SignIn";
import VerifyOTP from "./components/VerifyOTP";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import BettingSimulator from "./components/BettingSimulator";
import TopScorers from "./components/TopScorers";
import LeagueStats from "./components/LeagueStats";
import HomePage from "./components/HomePage";
import MatchDetails from "./components/MatchDetails";
import LeagueOverview from "./components/LeagueOverview";
import MatchPredictor from "./components/MatchPredictor";
import UserDashboard from "./components/UserDashboard";
import Transfers from "./components/Transfers";
import MatchesPage from "./components/MatchesPage";
import ChangePassword from "./components/ChangePassword";
import FootballQuiz from "./components/FootballQuiz";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("PL");
  const [selectedLeagueName, setSelectedLeagueName] =
    useState("Premier League");
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (token) {
      setIsAuthenticated(true);
      setUser(storedUsername || "User");
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

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
          username={username}
          setUsername={setUsername}
        />
        <ToastContainer position="top-right" />
        <main className="flex-grow">
          <Routes>
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

            <Route
              path="/matches"
              element={renderWithSidePanel(MatchesPage, {
                leagueId: selectedLeagueId,
                leagueName: selectedLeagueName,
              })}
            />

            <Route path="/match/:matchId" element={<MatchDetails />} />

            <Route
              path="/standings"
              element={renderWithSidePanel(StandingsPage, {
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
              path="/transfers"
              element={renderWithSidePanel(Transfers, {
                leagueId: selectedLeagueId,
              })}
            />

            <Route
              path="/betting"
              element={renderWithSidePanel(BettingSimulator, {
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
              path="/dashboard"
              element={
                <UserDashboard
                  isAuthenticated={isAuthenticated}
                  username={username}
                />
              }
            />

            <Route
              path="/signin"
              element={
                <SignIn
                  setIsAuthenticated={setIsAuthenticated}
                  setUsername={setUsername}
                />
              }
            />

            <Route
              path="/register"
              element={
                <Register
                  setIsAuthenticated={setIsAuthenticated}
                  setUsername={setUsername}
                />
              }
            />

            <Route
              path="/verify-otp"
              element={<VerifyOTP setIsAuthenticated={setIsAuthenticated} />}
            />

            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
