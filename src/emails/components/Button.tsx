export function Button({ href, children }: { href: string; children: any }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: "#F97316",
        color: "#FFFFFF",
        padding: "12px 20px",
        borderRadius: 9999,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}
