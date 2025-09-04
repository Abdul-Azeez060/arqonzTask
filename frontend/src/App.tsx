import "./App.css";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ChatPage from "./chat/ChatPage";
import Login from "./auth/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
