import { describe, it, expect } from "vitest";

import { NoopAlertDelivery, getAlertDelivery } from "./delivery";
import type { Alert } from "@/lib/schemas";

function alert(status: Alert["status"]): Alert {
  return {
    id: `a_${status}`,
    userId: "u_1",
    watchlistId: "w_1",
    rule: { type: "new-theme" },
    status,
    message: "A theme touches your watchlist.",
  };
}

describe("NoopAlertDelivery", () => {
  it("is disabled and never delivers", async () => {
    const job = new NoopAlertDelivery();
    expect(job.enabled).toBe(false);

    const result = await job.deliverPending([alert("pending"), alert("sent"), alert("pending")]);
    expect(result.delivered).toBe(0);
    expect(result.skipped).toBe(2); // two pending, none sent
  });

  it("getAlertDelivery returns a stub singleton", () => {
    expect(getAlertDelivery()).toBe(getAlertDelivery());
    expect(getAlertDelivery().enabled).toBe(false);
  });
});
