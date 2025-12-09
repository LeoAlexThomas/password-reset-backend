import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async ({ to, subject, htmlText }) => {
  let apiInstance = new brevo.TransactionalEmailsApi();

  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.MAIL_API_KEY
  );

  const sendSmtpEmail = {
    to: [{ email: to }],
    sender: { email: process.env.PASS_MAIL },
    subject: subject,
    htmlContent: htmlText,
  };

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};

export default sendEmail;
