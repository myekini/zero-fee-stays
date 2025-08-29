export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        fontSize: 14,
      }}
    >
      <div style={{ color: "#64748B" }}>{label}</div>
      <div style={{ color: "#0F172A", fontWeight: 600, textAlign: "right" }}>
        {value}
      </div>
    </div>
  );
}
