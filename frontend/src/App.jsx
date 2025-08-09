import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const CITIES = [
  "Atlanta (ATL)", "Austin (AUS)", "Baltimore (BWI)", "Boston (BOS)",
  "Charlotte (CLT)", "Chicago (ORD)", "Dallas (DFW)", "Denver (DEN)",
  "Detroit (DTW)", "Fort Lauderdale (FLL)", "Honolulu (HNL)", "Houston (IAH)",
  "Las Vegas (LAS)", "Los Angeles (LAX)", "Miami (MIA)", "Minneapolis (MSP)",
  "Nashville (BNA)", "New Orleans (MSY)", "New York (JFK)", "New York (LGA)",
  "Newark (EWR)", "Oakland (OAK)", "Orlando (MCO)", "Philadelphia (PHL)",
  "Phoenix (PHX)", "Portland (PDX)", "Salt Lake City (SLC)", "San Diego (SAN)",
  "San Francisco (SFO)", "San Jose (SJC)", "Seattle (SEA)", "Tampa (TPA)",
  "Toronto (YYZ)", "Vancouver (YVR)", "Washington (DCA)", "Washington (IAD)"
];

function AutocompleteSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || "");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current || wrapRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setInput(value || ""), [value]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    const list = q
      ? options.filter((o) => o.toLowerCase().includes(q))
      : options;
    return list.slice(0, 12); // cap results
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
    } else if (e.key === "Escape") {
      setOpen(false);
    }
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
          background: "white"
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
            background: "transparent"
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
              zIndex: 20
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
                  background: i === highlight ? "#f3f4f6" : "white"
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

function App() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  const swap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <header
        style={{
          padding: "24px 20px",
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #e5e7eb",
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Plan your flight</h1>
          <p style={{ margin: 0, color: "#6b7280", marginTop: 6 }}>
            Search cities and pick your route.
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <main style={{ display: "flex", justifyContent: "center", padding: "28px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 12px 36px rgba(0,0,0,0.06)"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 1fr 140px",
              gap: 14,
              alignItems: "end"
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
                fontWeight: 700
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

            <button
              style={{
                height: 44,
                borderRadius: 10,
                border: "none",
                background: "#111827",
                color: "white",
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => alert(`Searching flights: ${fromCity} → ${toCity}`)}
            >
              Search
            </button>
          </div>

          {/* Selection preview */}
          <div style={{ marginTop: 14, color: "#6b7280", fontSize: 14 }}>
            {fromCity && toCity
              ? `Route selected: ${fromCity} → ${toCity}`
              : "Pick your cities to get started."}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
