import { mailService } from "../services/mail.service";
import { z } from "zod";

const sendMailDto = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const mailController = {
  async send(c: any) {
    const body = await c.req.json();
    const parsed = sendMailDto.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const job = await mailService.enqueueMail(parsed.data.to, parsed.data.subject, parsed.data.body);
    return c.json(job, 201);
  },
};
