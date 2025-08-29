import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Hr,
} from "@react-email/components";

export default function BaseLayout({
  preview,
  children,
}: {
  preview: string;
  children: any;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* HEADER */}
          <Section style={{ padding: "24px 24px 12px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>
              HiddyStays
            </div>
          </Section>
          <Hr style={styles.hr} />
          {children}
          {/* FOOTER */}
          <Hr style={styles.hr} />
          <Section style={{ padding: 16, color: "#64748B", fontSize: 12 }}>
            <div>
              © {new Date().getFullYear()} HiddyStays. All rights reserved.
            </div>
            <div style={{ marginTop: 8 }}>
              <a href="https://www.hiddystays.com" style={styles.link}>
                Website
              </a>{" "}
              •
              <a href="mailto:support@hiddystays.com" style={styles.link}>
                {" "}
                Support
              </a>{" "}
              •
              <a href="{{unsubscribe_url}}" style={styles.link}>
                {" "}
                Manage Preferences
              </a>{" "}
              •
              <a href="https://www.hiddystays.com/privacy" style={styles.link}>
                {" "}
                Privacy
              </a>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#F8FAFC", margin: 0, padding: 24 },
  container: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
  },
  hr: { borderColor: "#E2E8F0", margin: 0 },
  link: { color: "#0F172A", textDecoration: "none", marginLeft: 6 },
} as const;
