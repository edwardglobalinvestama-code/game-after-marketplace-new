import { type FormEvent, useState } from "react";
import type { PlayerPayload } from "../../state/campaignStore";

type Props = {
  onSubmit: (payload: PlayerPayload) => void;
};

export function PlayerFormPage({ onSubmit }: Props) {
  const [form, setForm] = useState<PlayerPayload>({
    whatsapp: "",
    address: "",
    orderNumber: "",
    platform: "shopee",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <section className="screen">
      <div className="badge">Step 1</div>
      <h1>Validasi Data Pembeli</h1>
      <p className="subtitle">Isi data sebelum duel mecha dimulai.</p>
      <form className="data-form" onSubmit={handleSubmit}>
        <label>
          WhatsApp
          <input
            aria-label="WhatsApp"
            value={form.whatsapp}
            onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
          />
        </label>
        <label>
          Alamat
          <input
            aria-label="Alamat"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </label>
        <label>
          Nomor Order
          <input
            aria-label="Nomor Order"
            value={form.orderNumber}
            onChange={(event) => setForm({ ...form, orderNumber: event.target.value })}
          />
        </label>
        <label>
          Platform
          <select
            aria-label="Platform"
            value={form.platform}
            onChange={(event) =>
              setForm({ ...form, platform: event.target.value as "shopee" | "tiktok" })
            }
          >
            <option value="shopee">Shopee</option>
            <option value="tiktok">TikTok Shop</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          Mulai Misi
        </button>
      </form>
    </section>
  );
}
