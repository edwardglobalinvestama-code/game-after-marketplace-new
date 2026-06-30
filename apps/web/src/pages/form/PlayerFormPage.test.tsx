import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayerFormPage } from "./PlayerFormPage";

describe("PlayerFormPage", () => {
  it("submits order data to the parent callback", () => {
    const onSubmit = vi.fn();

    render(<PlayerFormPage onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/whatsapp/i), {
      target: { value: "08123456789" },
    });
    fireEvent.change(screen.getByLabelText(/alamat/i), {
      target: { value: "Jl. Merdeka 10" },
    });
    fireEvent.change(screen.getByLabelText(/nomor order/i), {
      target: { value: "SPX-002" },
    });
    fireEvent.change(screen.getByLabelText(/platform/i), {
      target: { value: "shopee" },
    });

    fireEvent.click(screen.getByRole("button", { name: /mulai misi/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      whatsapp: "08123456789",
      address: "Jl. Merdeka 10",
      orderNumber: "SPX-002",
      platform: "shopee",
    });
  });
});
