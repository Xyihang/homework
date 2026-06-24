import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Setup } from "@/pages/Setup";
import { Players } from "@/pages/Players";
import { Assign } from "@/pages/Assign";
import { Game } from "@/pages/Game";
import { Result } from "@/pages/Result";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/players" element={<Players />} />
        <Route path="/assign" element={<Assign />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-gray-400">页面不存在</div>} />
      </Routes>
    </Router>
  );
}