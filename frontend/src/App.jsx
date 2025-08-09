import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const CITIES = [
  "Dallas (DFW)","Austin (AUS)","Houston (IAH)","Chicago (ORD)",
  "Atlanta (ATL)","Los Angeles (LAX)","New York (JFK)","San Francisco (SFO)"
];

function AutocompleteSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || "");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (!wrapRef.current || wrapRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => setInput(value || ""), [value]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.slice(0, 12);
  }, [input, options]);

  const selectItem = (item) => {
    onChange(item);
    setInput(item);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlight]) selectItem(filtered[highlight]);
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", maxWidth: 420 }}>
      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
        {label}
      </label>
      <div
        style={{
          position: "relative",
          border: "1px solid #d1d5db",
          borderRadius: 10,
          padding: "10px 12px",
          background: "white",
        }}
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: 16,
            background: "transparent",
          }}
        />
        {open && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "100%",
              marginTop: 6,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              maxHeight: 260,
              overflowY: "auto",
              zIndex: 20,
            }}
          >
            {filtered.map((item, i) => (
              <div
                key={item}
                onMouseDown={() => selectItem(item)}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: i === highlight ? "#f3f4f6" : "white",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrioritySelect({ value, onChange }) {
  return (
    <div style={{ width: "100%", maxWidth: 220 }}>
      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
        Priority
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          background: "white",
          padding: "0 12px",
          fontSize: 16,
        }}
      >
        <option value="T">Fastest (Time)</option>
        <option value="C">Cheapest (Cost)</option>
      </select>
    </div>
  );
}

export default function App() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [priority, setPriority] = useState("T");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const swap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const normalizeCity = (s) => (s || "").replace(/\s*\([^)]*\)\s*$/, "").trim();

  const onSearch = async () => {
    const from = normalizeCity(fromCity);
    const to = normalizeCity(toCity);
    if (!from || !to) {
      setError("Please choose both From and To.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const req = new URLSearchParams({ from, to, priority }).toString();
    try {
      const res = await fetch(`/route?${req}`); // Vite proxy -> Flask :8000
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <header
        style={{
          padding: "24px 20px",
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #e5e7eb",
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Plan your flight</h1>
          <p style={{ margin: 0, color: "#6b7280", marginTop: 6 }}>
            Search cities and pick your route.
          </p>
        </div>
      </header>

      <main style={{ display: "flex", justifyContent: "center", padding: "28px 20px" }}>
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: 1100,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          {/* Search row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 56px 1fr 220px 140px",
              gap: 12,
              alignItems: "end",
            }}
          >
            <AutocompleteSelect
              label="From"
              value={fromCity}
              onChange={setFromCity}
              options={CITIES}
              placeholder="Start typing a city…"
            />

            <button
              onClick={swap}
              title="Swap"
              style={{
                height: 44,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ⇄
            </button>

            <AutocompleteSelect
              label="To"
              value={toCity}
              onChange={setToCity}
              options={CITIES}
              placeholder="Search destination…"
            />

            <PrioritySelect value={priority} onChange={setPriority} />

            {/* spacer label to align button with inputs */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 12, color: "#6b7280", height: 18 }}>&nbsp;</label>
              <button
                onClick={onSearch}
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: "none",
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, color: "#6b7280", fontSize: 14 }}>
            {fromCity && toCity
              ? `Route: ${fromCity} → ${toCity} • Priority: ${priority}`
              : "Pick your cities and priority."}
          </div>

          {/* Status & results */}
          <div style={{ marginTop: 16 }}>
            {loading && (
              <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}>
                Finding best route…
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 12,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#991b1b",
                  borderRadius: 12,
                }}
              >
                {error}
              </div>
            )}

            {result && (
              <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 16 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 6,
                  }}
                >
                  Best by {result.priority === "T" ? "Time" : "Cost"}
                </div>
                <div style={{ color: "#374151", textAlign: "center", marginBottom: 10 }}>
                  {result.path.join(" → ")}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 24,
                    color: "#6b7280",
                    marginBottom: 10,
                  }}
                >
                  <span>
                    Time: <b style={{ color: "#111827" }}>{result.totalTime}</b>
                  </span>
                  <span>
                    Cost: <b style={{ color: "#111827" }}>{result.totalCost}</b>
                  </span>
                </div>

                {result.path.length > 1 && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    <div style={{ marginBottom: 4 }}>Legs:</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.path.slice(1).map((city, i) => (
                        <li key={i}>
                          {result.path[i]} → {city}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
