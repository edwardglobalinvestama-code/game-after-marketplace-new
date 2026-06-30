import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultPage } from "./ResultPage";

describe("ResultPage", () => {
  it("shows campaign follow-up copy", () => {
    render(<ResultPage result="victory" remainingPlays={1} />);

    expect(screen.getByText(/data kamu sudah tercatat/i)).toBeInTheDocument();
    expect(screen.getByText(/sisa kesempatan: 1/i)).toBeInTheDocument();
  });
});
