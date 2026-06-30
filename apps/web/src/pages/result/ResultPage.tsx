type Props = {
  result: "victory" | "defeat" | "draw";
  remainingPlays: number;
};

export function ResultPage({ result, remainingPlays }: Props) {
  const title = result === "victory" ? "Victory" : result === "defeat" ? "Defeat" : "Draw";

  return (
    <section className="screen">
      <div className="badge">Result</div>
      <h1>{title}</h1>
      <p className="subtitle">
        Data kamu sudah tercatat. Admin akan meninjau hasil permainan ini.
      </p>
      <div className="feature-card">
        <p>Sisa kesempatan: {remainingPlays}</p>
      </div>
    </section>
  );
}
