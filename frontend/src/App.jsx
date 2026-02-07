// App.tsx
import { Routes, Route,Outlet } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/HomePage";
import GenerateStoryPage from "./pages/GenerateStoryPage";
import WordPage from "./pages/WordPage";
import StoryHistoryPage from "./pages/StoryHistoryPage";


export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/words" element={<WordPage />} />

        <Route path="/stories" element={<Outlet />}>
          <Route path="generate" element={<GenerateStoryPage />} />
          <Route path=":storyId" element={<StoryHistoryPage />} />
        </Route>
      </Route>
    </Routes>

  );
}
