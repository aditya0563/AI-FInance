"use server";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const sendEmailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  react: z.any().optional(),
});

export async function sendEmail({ to, subject, react }: z.infer<typeof sendEmailSchema>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

  // Rate limiting with Arcjet
  const req = await request();
  const decision = await aj.protect(req, { userId, requested: 1 });
  
    if (decision.isDenied()) {
      return { success: false, error: "Rate limit exceeded" };
    }

  // Input validation with Zod
  const validatedFields = sendEmailSchema.safeParse({ to, subject, react });
  
    if (!validatedFields.success) {
      return { success: false, error: "Invalid input fields: " + validatedFields.error.message };
    }

    if (!env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set.");
      return { success: false, error: "Email service is not configured." };
    }
    const resend = new Resend(env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to: validatedFields.data.to,
      subject: validatedFields.data.subject,
      react: validatedFields.data.react,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("sendEmail error:", error);
    return { success: false, error: "An unexpected error occurred while sending the email." };
  }
}
