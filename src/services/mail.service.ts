import { mailJobsRepository } from "../repositories/mailJobs.repository";

const MAIL_API_URL = process.env.MAIL_API_URL || "http://localhost:8025/api/send";
const MAIL_API_KEY = process.env.MAIL_API_KEY;

export const mailService = {
  enqueueMail: async (toEmail: string, subject: string, body: string) => {
    const [job] = await mailJobsRepository.createJob({ toEmail, subject, body });
    return job;
  },

  /**
   * Process pending jobs once.
   * Returns the number of jobs processed.
   */
  processPendingJobs: async () => {
    const jobs = await mailJobsRepository.getPending();
    let processed = 0;

    for (const job of jobs) {
      const nextAttempts = (job.attempts ?? 0) + 1;

      try {
        const res = await fetch(MAIL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(MAIL_API_KEY ? { Authorization: `Bearer ${MAIL_API_KEY}` } : {}),
          },
          body: JSON.stringify({
            to: job.toEmail,
            subject: job.subject,
            body: job.body,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          await mailJobsRepository.updateStatus(job.id, "failed", {
            attempts: nextAttempts,
            lastError: `HTTP ${res.status}: ${text}`,
          });
        } else {
          await mailJobsRepository.updateStatus(job.id, "sent", {
            attempts: nextAttempts,
          });
        }
      } catch (error: any) {
        await mailJobsRepository.updateStatus(job.id, "failed", {
          attempts: nextAttempts,
          lastError: error?.message || String(error),
        });
      }

      processed += 1;
    }

    return processed;
  },
};
