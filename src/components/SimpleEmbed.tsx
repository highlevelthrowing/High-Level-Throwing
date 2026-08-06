export default function SimpleEmbed({
  embedKey,
  iframeTitle,
  height = 1600,
}: {
  embedKey: string;
  iframeTitle: string;
  height?: number;
}) {
  return (
    <section style={{ paddingTop: 0 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", borderRadius: 20, overflow: "hidden" }}>
        <iframe
          src={`/api/embed/${embedKey}`}
          title={iframeTitle}
          style={{ width: "100%", height, border: "none", background: "#fff", display: "block" }}
        />
      </div>
    </section>
  );
}
