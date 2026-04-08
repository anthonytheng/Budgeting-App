import DesktopLayout from "../components/DesktopLayout";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const nav = useNavigate();

  function onLearn() {
    window.open(
      "https://consumer.gov/your-money/making-budget"
    );
  }

  function onLogout() {
    nav("/login", { replace: true });
  }

  return (
    <DesktopLayout title="Settings">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={itemStyle} onClick={onLearn}>
          Learn Budgeting Basics
        </div>

        <div style={itemStyle}>Privacy</div>
        <div style={itemStyle}>About This App</div>

        <div style={{ ...itemStyle, color: "#be0000" }} onClick={onLogout}>
          Log out
        </div>
      </div>
    </DesktopLayout>
  );
}

const itemStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 18,
  cursor: "pointer",
  fontWeight: 700,
  letterSpacing: "0.01em",
  backdropFilter: "blur(6px)",
};
