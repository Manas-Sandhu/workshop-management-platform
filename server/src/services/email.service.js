const { Resend } = require("resend");

// Created lazily: constructing Resend at import time throws when the key is
// missing, which would crash the whole app (including /health) on startup.
let resend = null;

async function sendWorkshopConfirmationEmail(registration, workshop) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing from environment variables");
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing from environment variables");
  }

  const formattedDate = new Date(workshop.dateTime).toLocaleString(
    "en-IN",
    {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }
  );

  console.log("Sending confirmation email to:", registration.email);
  console.log("Using sender:", process.env.EMAIL_FROM);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [registration.email],
    subject: "Workshop Registration Confirmed!",
    text: `Hi ${registration.fullName},

        Your registration for ${workshop.title} has been confirmed!

        Workshop: ${workshop.title}
        Date and Time: ${formattedDate} (IST)
        Registration ID: ${registration.id}

        Thank you for registering. We look forward to seeing you!

        Regards,
        Workshop Team`,
  });

  if (error) {
    console.error("Resend API error:", error);
    throw new Error(`Resend email failed: ${error.message}`);
  }

  console.log("Resend accepted email. Email ID:", data?.id);

  return data;
}

module.exports = {
  sendWorkshopConfirmationEmail,
};
