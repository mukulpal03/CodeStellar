import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendMail = async (options) => {
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "CodeStellar",
        link: "https://codestellar.in/",
      },
    });

    const emailHtml = mailGenerator.generate(options.mailGenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDER_MAIL,
      to: options.email,
      subject: options.subject,
      text: emailText,
      html: emailHtml,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ApiError(500, "Error in sending mail");
  }
};

const registerUserMailGenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to CodeStellar! We're very excited to have you on board.",
      action: {
        instructions: "To Verify your email, please click here:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const resetPasswordMailGenContent = (username, resetPassUrl) => {
  return {
    body: {
      name: username,
      intro: "We've recieved a request to reset your password!",
      action: {
        instructions: "To Reset your password, please click here: ",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: resetPassUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { sendMail, registerUserMailGenContent, resetPasswordMailGenContent };
