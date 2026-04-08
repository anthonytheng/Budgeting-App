import { useEffect, useMemo, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import DesktopLayout from "../components/DesktopLayout";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  backdropFilter: "blur(6px)",
};

const palette = [
  "#f14949",
  "#2E96FF",
  "#11d899",
  "#f59e0b",
  "#a855f7",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
];

const pieheight = 280;
const piewidth = 400;

const pieWrap = {
  position: "relative",
  width: piewidth,
  maxWidth: "100%",
  margin: "0 auto",
};

const pieCenterLabel = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "#ffffff",
  fontWeight: 700,
  pointerEvents: "none",
  padding: "0 16px",
};

const metricLabel = {
  color: "var(--text-muted)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const metricValue = {
  color: "var(--text)",
  fontSize: 26,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const readHomeData = () => {
  if (typeof window === "undefined") {
    return {
      categories: [],
      transactions: [],
      currentBudgetId: null,
    };
  }

  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const currentBudgetId = (() => {
    const value = localStorage.getItem("currentBudgetId");
    return value ? parseInt(value, 10) : null;
  })();

  if (!currentBudgetId) {
    return {
      categories: [],
      transactions: [],
      currentBudgetId: null,
    };
  }

  return {
    categories: categories.filter((category) => category.budgetId === currentBudgetId),
    transactions: transactions.filter((transaction) => transaction.budgetId === currentBudgetId),
    currentBudgetId,
  };
};

export default function Home() {
  const [homeData, setHomeData] = useState(() => readHomeData());
  const { categories, transactions, currentBudgetId } = homeData;

  useEffect(() => {
    const handler = () => setHomeData(readHomeData());
    window.addEventListener("budget-data-updated", handler);
    return () => window.removeEventListener("budget-data-updated", handler);
  }, []);

  const { totalSpent, chartData, sortedData, sortedTransactions, categoryMeta } = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = (dateStr) => {
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    const monthTransactions = transactions.filter((t) => t.date && isCurrentMonth(t.date));
    const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    const chart = categories
      .map((category, index) => {
        const value = monthTransactions
          .filter((t) => t.categoryId === category.id)
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          id: category.id,
          value,
          label: category.name,
          color: palette[index % palette.length],
        };
      })
      .filter((item) => item.value > 0);

    const sorted = [...chart].sort((a, b) => b.value - a.value);
    const txSorted = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const meta = new Map(
      categories.map((category, index) => [
        category.id,
        { name: category.name, color: palette[index % palette.length] },
      ])
    );

    return {
      totalSpent: total,
      chartData: chart,
      sortedData: sorted,
      sortedTransactions: txSorted,
      categoryMeta: meta,
    };
  }, [categories, transactions]);

  const income = 0;
  const net = income - totalSpent;

  return (
    <DesktopLayout title="Home">
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div style={card}>
            <div style={metricLabel}>This Month Spent</div>
            <div style={metricValue}>${totalSpent.toLocaleString()}</div>
          </div>

          <div style={card}>
            <div style={metricLabel}>Income</div>
            <div style={metricValue}>${income.toLocaleString()}</div>
          </div>

          <div style={card}>
            <div style={metricLabel}>Net</div>
            <div
              style={{
                color: net >= 0 ? "var(--success)" : "var(--danger)",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {net >= 0 ? "+" : ""}${net.toLocaleString()}
            </div>
          </div>
        </div>

        {!currentBudgetId ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94a3b8", marginBottom: 16 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(320px, 1.2fr) minmax(220px, 0.8fr)",
                gap: 16,
              }}
            >
              <div style={{ ...card, minHeight: 320, position: "relative" }}>
                {chartData.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    No transactions this month yet.
                  </div>
                ) : (
                  <div style={pieWrap}>
                    <PieChart
                      series={[
                        {
                          innerRadius: 80,
                          outerRadius: 100,
                          data: chartData,
                        },
                      ]}
                      width={piewidth}
                      height={pieheight}
                      hideLegend
                    />
                    <div style={pieCenterLabel}>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--text-muted)",
                            marginBottom: 6,
                            fontWeight: 700,
                          }}
                        >
                          Expenses
                        </div>
                        <div
                          style={{
                            fontSize: 34,
                            lineHeight: 1,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          ${totalSpent.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ ...card, minHeight: 320 }}>
                <div style={metricLabel}>Top Categories</div>
                {sortedData.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    No transactions this month yet.
                  </div>
                ) : (
                  sortedData.map((item) => {
                    const pct = Math.round((item.value / totalSpent) * 100);
                    return (
                      <div key={item.id} style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: item.color,
                                display: "inline-block",
                                boxShadow: "0 0 0 3px rgba(255,255,255,0.03)",
                              }}
                            />
                            <span style={{ color: "#e2e8f0", fontSize: 13 }}>{item.label}</span>
                          </div>
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>${item.value}</span>
                        </div>
                        <div
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 999,
                            height: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: item.color,
                              width: `${pct}%`,
                              height: "100%",
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={{ ...card, minHeight: 240 }}>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Recent Transactions
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1.5fr 1fr",
                  padding: "0 8px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span>Date</span>
                <span>Description</span>
                <span>Category</span>
                <span style={{ textAlign: "right" }}>Amount</span>
              </div>

              {sortedTransactions.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 14, padding: "12px 8px" }}>
                  No transactions yet.
                </div>
              ) : (
                sortedTransactions.map((tx, i) => {
                  const meta = categoryMeta.get(tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr 1.5fr 1fr",
                        padding: "12px 8px",
                        borderBottom:
                          i < sortedTransactions.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span style={{ color: "#e2e8f0", fontSize: 13 }}>{tx.note}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: meta?.color ?? "#888",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>
                          {meta?.name || "Unknown"}
                        </span>
                      </span>
                      <span
                        style={{
                          color: "#f1f5f9",
                          fontSize: 13,
                          textAlign: "right",
                          fontWeight: 500,
                        }}
                      >
                        -${tx.amount}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DesktopLayout>
  );
}