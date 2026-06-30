import { type FormEvent, useEffect, useState } from "react";

type AdminOrder = {
  orderNumber: string;
  quantity: number;
  playQuota: number;
  usedPlays: number;
  platform: string;
};

type AdminSession = {
  sessionToken: string;
  orderNumber: string;
  result: string;
  score: number;
};

export function AdminPage() {
  const [platform, setPlatform] = useState<"shopee" | "tiktok">("shopee");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [message, setMessage] = useState("Upload file order lalu review sesi permainan.");

  function loadOrders(currentPlatform: "shopee" | "tiktok") {
    fetch(`http://localhost:4000/api/admin/orders?platform=${currentPlatform}`)
      .then((response) => response.json())
      .then((data: { orders: AdminOrder[] }) => setOrders(data.orders))
      .catch(() => setOrders([]));
  }

  function loadSessions() {
    fetch("http://localhost:4000/api/admin/sessions")
      .then((response) => response.json())
      .then((data: { sessions: AdminSession[] }) => setSessions(data.sessions))
      .catch(() => setSessions([]));
  }

  useEffect(() => {
    loadOrders(platform);
    loadSessions();
  }, [platform]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("platform", platform);

    const response = await fetch("http://localhost:4000/api/admin/imports/orders", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setMessage("Upload gagal. Pastikan file CSV/XLSX valid.");
      return;
    }

    setMessage(`Upload ${platform} berhasil.`);
    loadOrders(platform);
    loadSessions();
  }

  return (
    <section className="screen">
      <div className="badge">Admin</div>
      <h1>Admin Dashboard</h1>
      <p className="subtitle">{message}</p>
      <form className="data-form" onSubmit={handleUpload}>
        <label>
          Platform Upload
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value as "shopee" | "tiktok")}
          >
            <option value="shopee">Shopee</option>
            <option value="tiktok">TikTok Shop</option>
          </select>
        </label>
        <label>
          File Order
          <input name="file" type="file" accept=".csv,.xlsx" required />
        </label>
        <button className="primary-button" type="submit">
          Upload Order
        </button>
      </form>
      <div className="card-grid">
        {orders.length === 0 ? (
          <article className="feature-card">
            <p>Belum ada order pada platform ini.</p>
          </article>
        ) : (
          orders.map((order) => (
            <article className="feature-card" key={`${order.platform}-${order.orderNumber}`}>
              <h2>{order.orderNumber}</h2>
              <p>Qty: {order.quantity}</p>
              <p>Kuota: {order.playQuota}</p>
              <p>Terpakai: {order.usedPlays}</p>
            </article>
          ))
        )}
      </div>
      <div className="card-grid">
        {sessions.length === 0 ? (
          <article className="feature-card">
            <p>Belum ada sesi selesai atau backend belum dijalankan.</p>
          </article>
        ) : (
          sessions.map((session) => (
            <article className="feature-card" key={session.sessionToken}>
              <h2>{session.orderNumber}</h2>
              <p>Hasil: {session.result}</p>
              <p>Skor: {session.score}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
