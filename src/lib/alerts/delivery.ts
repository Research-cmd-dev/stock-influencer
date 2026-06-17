import { logger } from "@/lib/logger";
import type { Alert } from "@/lib/schemas";

export interface DeliveryResult {
  delivered: number;
  skipped: number;
}

/**
 * Alert delivery is a NON-GOAL for the MVP. This interface defines the contract a
 * real delivery job (email/push/webhook) would implement; the only implementation
 * is a no-op stub that logs intent without sending anything.
 */
export interface AlertDeliveryJob {
  readonly id: string;
  readonly enabled: boolean;
  deliverPending(alerts: Alert[]): Promise<DeliveryResult>;
}

/** No-op delivery. Records that pending alerts exist but never sends. */
export class NoopAlertDelivery implements AlertDeliveryJob {
  readonly id = "noop";
  readonly enabled = false;

  async deliverPending(alerts: Alert[]): Promise<DeliveryResult> {
    const pending = alerts.filter((a) => a.status === "pending");
    logger.info("Alert delivery is stubbed; no alerts sent", {
      pending: pending.length,
      total: alerts.length,
    });
    return { delivered: 0, skipped: pending.length };
  }
}

let singleton: AlertDeliveryJob | null = null;

/** Resolve the active alert-delivery job. Only the no-op stub exists in MVP. */
export function getAlertDelivery(): AlertDeliveryJob {
  if (!singleton) singleton = new NoopAlertDelivery();
  return singleton;
}
