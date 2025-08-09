export default function PrioritySelect({ value, onChange }) {
  return (
    <div style={{ width: "100%", maxWidth: 220 }}>
      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Priority</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", height: 44, borderRadius: 10, border: "1px solid #d1d5db",
          background: "white", padding: "0 12px", fontSize: 16
        }}
      >
        <option value="T">Fastest (Time)</option>
        <option value="C">Cheapest (Cost)</option>
      </select>
    </div>
  );
}
