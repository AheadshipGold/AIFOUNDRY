export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>AI Foundry</h1>
      <p>Foundation ready.</p>
      {process.env.NODE_ENV !== 'production' && <a href="/internal/components">Design system · FR / EN</a>}
      {process.env.NODE_ENV !== 'production' && <p><a href="/internal/references">Références commerce · FR / EN</a></p>}
    </main>
  );
}
