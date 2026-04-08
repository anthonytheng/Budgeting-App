import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import Calendar from "./pages/Calendar";
import DayTransactions from "./pages/DayTransactions";
import Settings from "./pages/Settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/calendar/day/:date" element={<DayTransactions />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
