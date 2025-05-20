import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import config from "../config/env.js";

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
      host: config.MAILTRAP_HOST,
      port: config.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: config.MAILTRAP_USER,
        pass: config.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: config.MAILTRAP_SENDER_MAIL,
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
