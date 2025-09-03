import "./App.css";
import Dashboard from "./dashboard/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}
import ChatPage from "./chat/ChatPage";
import { Routes, Route } from "react-router-dom";
