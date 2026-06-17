import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Disclaimer, DISCLAIMER_TEXT } from "./disclaimer";

describe("Disclaimer", () => {
  it("renders the exact required disclaimer text", () => {
    render(<Disclaimer />);
    expect(screen.getByTestId("disclaimer")).toHaveTextContent(DISCLAIMER_TEXT);
  });

  it("renders the inline variant", () => {
    render(<Disclaimer variant="inline" />);
    expect(screen.getByTestId("disclaimer")).toHaveTextContent(DISCLAIMER_TEXT);
  });
});
