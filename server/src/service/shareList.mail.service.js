const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

async function ShareListMailingService(recipientEmail, sendersName, listName) {
  try {
    const { data, error } = await resend.emails.send({
      from: "To_List <notifications@update.gisteraand.co.za>", // sender address
      to: `${recipientEmail}`, // list of recipients
      subject: `${sendersName} has shared ${listName} on DO_IT.`, // subject line
      html: `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0   auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">You've got a shared to-do list</h1>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        ${sendersName} just shared a to-do list with you on DO_IT. Sign in to your existing account, or create a free one in seconds, to see what's on it.
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        New here? Click the button below, then select <strong>Register</strong> underneath the login form. Once your account is set up, sign in and the list will be waiting for you.
        </p>
        <div style="text-align: center; margin: 0 0 24px;">
        <a href="https://do-it-pink.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 28px; border-radius: 6px;">
         View the list
        </a>
        </div>
        <p style="font-size: 13px; color: #6b6b6b; line-height: 1.5; margin: 0;">
        Tip: when creating your password, use a mix of uppercase, lowercase, numbers, and special characters to keep your account secure.
        </p>
        </div>`, // HTML body
    });
    if (error) {
      console.error(`Failed to send email to ${email}:`, error);
      return { success: false, reason: "exception", error };
    }

    return { success: true, providerId: data?.id };
    // console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error(`Unexpected error sending to ${email}:`, err);
    return { success: false, reason: "exception", error: err };
  }
}
module.exports = ShareListMailingService;
