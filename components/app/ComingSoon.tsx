export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="coming-soon">
      <p className="eyebrow">{title}</p>
      <h1 className="heading">Coming soon</h1>
      <p className="body-muted" style={{ marginTop: 12 }}>
        This section isn&apos;t built yet — it&apos;s next on the list.
      </p>
    </div>
  );
}
