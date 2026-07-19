// App.tsx
import { Routes, Route, Outlet } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/HomePage";
import GenerateStoryPage from "./pages/GenerateStoryPage";
import WordPage from "./pages/WordPage";
import StoryHistoryPage from "./pages/StoryHistoryPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import RequireAuth from "./auth/RequireAuth";
import { AuthProvider } from "./auth/AuthContext";


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/words" element={<WordPage />} />

            <Route path="/stories" element={<Outlet />}>
              <Route path="generate" element={<GenerateStoryPage />} />
              <Route path=":storyId" element={<StoryHistoryPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>

  );
}
