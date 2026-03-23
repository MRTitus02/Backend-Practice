import { mailJobsRepository } from "../repositories/mailJobs.repository";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "1025");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: SMTP_USER && SMTP_PASS ? {
    user: SMTP_USER,
    pass: SMTP_PASS,
  } : undefined,
});

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
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "noreply@example.com",
          to: job.toEmail,
          subject: job.subject,
          text: job.body,
        });

        await mailJobsRepository.updateStatus(job.id, "sent", {
          attempts: nextAttempts,
        });
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
