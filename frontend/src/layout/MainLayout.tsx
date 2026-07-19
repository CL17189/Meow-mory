import { Link, Outlet, NavLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import "./MainLayout.css";
import { useAuth } from "../auth/AuthContext";
import { getStreak, STREAK_UPDATED_EVENT, type StreakSummary } from "../api/stats";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState<StreakSummary | null>(null);

  const refreshStreak = useCallback(() => {
    void getStreak().then(setStreak).catch(() => setStreak(null));
  }, []);

  useEffect(() => {
    refreshStreak();
    window.addEventListener(STREAK_UPDATED_EVENT, refreshStreak);
    return () => window.removeEventListener(STREAK_UPDATED_EVENT, refreshStreak);
  }, [refreshStreak]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="/" className="brand" aria-label="Meowmory home">
          <span className="brand-mark" aria-hidden="true">🐈</span>
          <span className="brand-copy">
            <strong>meowmory</strong>
            <small>learn in little stories</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/words" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Vocabulary</NavLink>
          <NavLink to="/stories/generate" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Create story</NavLink>
        </nav>

        <div className="header-actions">
          <div className="streak-pill" title={streak?.today_completed ? "Today's learning is complete" : "Keep learning today to continue your streak"}>
            <span aria-hidden="true">✦</span> {streak?.current_streak ?? 0} day streak
          </div>
          <div className="profile-menu">
            <button className="profile-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
              <span className="profile-avatar" aria-hidden="true">{(user?.display_name || user?.email || "M").charAt(0).toUpperCase()}</span>
              <span className="profile-name">{user?.display_name || user?.email}</span>
              <span aria-hidden="true">⌄</span>
            </button>
            {open && (
              <div className="profile-dropdown">
                <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <Link to="/settings" onClick={() => setOpen(false)}>Settings</Link>
                <div className="dropdown-divider" />
                <button type="button" onClick={() => void logout()}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main"><Outlet /></main>
    </div>
  );
}
