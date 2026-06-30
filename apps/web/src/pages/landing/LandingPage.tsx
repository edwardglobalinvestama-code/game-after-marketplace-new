type Props = {
  onStart: () => void;
};

export function LandingPage({ onStart }: Props) {
  return (
    <section className="screen hero-screen">
      <div className="badge">Campaign Event</div>
      <h1>Mecha Battle Reward Mission</h1>
      <p className="subtitle">
        Scan paket, validasi order, lalu mainkan duel mecha singkat untuk masuk program
        hadiah marketing.
      </p>
      <div className="card-grid">
        <article className="feature-card">
          <h2>Validasi Order</h2>
          <p>Nomor order Shopee atau TikTok Shop dicek sebelum game dimulai.</p>
        </article>
        <article className="feature-card">
          <h2>Kuota Sesuai Qty</h2>
          <p>1 pembelian = 1 kesempatan bermain, kelipatan qty memberi kuota ekstra.</p>
        </article>
      </div>
      <button className="primary-button" onClick={onStart}>
        Mulai Misi
      </button>
    </section>
  );
}
