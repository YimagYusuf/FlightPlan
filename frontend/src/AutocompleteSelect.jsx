import { useEffect, useMemo, useRef, useState } from "react";

export default function AutocompleteSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || "");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

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
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (open && filtered[highlight]) selectItem(filtered[highlight]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", maxWidth: 420 }}>
      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative", border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 12px", background: "white" }}>
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{ width: "100%", border: "none", outline: "none", fontSize: 16, background: "transparent" }}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: "absolute", left: 0, right: 0, top: "100%", marginTop: 6,
            background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)", maxHeight: 260, overflowY: "auto", zIndex: 20
          }}>
            {filtered.map((item, i) => (
              <div
                key={item}
                onMouseDown={() => selectItem(item)}
                onMouseEnter={() => setHighlight(i)}
                style={{ padding: "10px 12px", cursor: "pointer", background: i === highlight ? "#f3f4f6" : "white" }}
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
