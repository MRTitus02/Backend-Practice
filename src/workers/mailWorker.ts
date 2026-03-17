import { mailService } from "../services/mail.service";

const DEFAULT_POLL_MS = 10_000;

let intervalId: NodeJS.Timeout | null = null;

export function startMailWorker(intervalMs: number = DEFAULT_POLL_MS) {
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      await mailService.processPendingJobs();
    } catch (error) {
      // Swallow errors so the worker doesn't stop
      // eslint-disable-next-line no-console
      console.error("Mail worker error:", error);
    }
  }, intervalMs);
}

export function stopMailWorker() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}
