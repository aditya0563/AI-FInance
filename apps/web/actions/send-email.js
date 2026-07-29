"use server";

import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const sendEmailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  react: z.any().optional(),
});

export async function sendEmail({ to, subject, react }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Rate limiting with Arcjet
  const req = await request();
  const decision = await aj.protect(req, { userId, requested: 1 });
  
  if (decision.isDenied()) {
    throw new Error("Rate limit exceeded");
  }

  // Input validation with Zod
  const validatedFields = sendEmailSchema.safeParse({ to, subject, react });
  
  if (!validatedFields.success) {
    throw new Error("Invalid input fields: " + validatedFields.error.message);
  }

  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to: validatedFields.data.to,
      subject: validatedFields.data.subject,
      react: validatedFields.data.react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
