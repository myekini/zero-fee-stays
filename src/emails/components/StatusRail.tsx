export function StatusRail({
  steps,
  activeIndex,
}: {
  steps: string[];
  activeIndex: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: i <= activeIndex ? "#F97316" : "#E2E8F0",
            }}
          />
          <div
            style={{
              fontSize: 12,
              color: i <= activeIndex ? "#0F172A" : "#94A3B8",
            }}
          >
            {s}
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 40, height: 2, background: "#E2E8F0" }} />
          )}
        </div>
      ))}
    </div>
  );
}
