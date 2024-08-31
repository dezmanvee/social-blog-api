const nodemailer = await import("nodemailer");

//!--------------Account Verification Email-------------->
export const sendVerificationEmail = async (to, token) => {
  try {
    //* 1. Create transporter
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_APP_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    //* 2. Create Message
    const message = {
      to,
      subject: "Account Verification Required for Devware",
      html: `<p>You are receiving this email because you requested to verify your account with <strong>Devware</strong>.</p>
            <p>Please click on the link below to complete the verification process:</p>
            
            <p><a href="http://localhost:3000/dashboard/account-verification/${token}" target="_blank" rel="noopener noreferrer">Verify your account</a></p>
            <p>If you did not make this request, please disregard this email.</p>`,
    };
    //* 3. Send the Message
    const info = await transporter.sendMail(message);
    // console.log("Email sent", info.messageId);
    return info;
  } catch (error) {
    // console.log(error);
    console.error("Error sending email:", error);
    throw new Error("Email sending failed.");
  }
};

//!--------------Password Reset Email-------------->

export const PasswordResetEmail = async (to, resetToken) => {
  try {
    //* 1. Create transporter
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_APP_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    //* 2. Create Message
    const message = {
      to,
      subject: "Password Reset Request for Your DevwareAccount",
      html: `<p>You are receiving this email because you requested a password reset on your <strong>Devware</strong> account.</p>
            <p>Please click on the link below to complete the process:</p>
            
            <p><a href="http://localhost:3000/password-reset/${resetToken}" target="_blank" rel="noopener noreferrer">Reset password</a></p>
            <p>If you did not request this change, kindly disregard this email.</p>`,
    };
    //* 3. Send the Message
    const info = await transporter.sendMail(message);
    // console.log("Email sent", info.messageId);
    return info;
  } catch (error) {
    // console.log(error);
    console.error("Error sending email:", error);
    throw new Error("Email sending failed.");
  }
};

//!--------------Post Notification-------------->

export const sendNotification = async (to, postId) => {
  try {
    //* 1. Create transporter
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_APP_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    //* 2. Create Message
    const message = {
      to,
      subject: "New Post Alert on Devware!",
      html: ` <p>A fresh post has just been published on Devware! 🎉</p>
            <p>Click <a href="http://localhost:3000/posts/${postId}" target="_blank" rel="noopener noreferrer">here</a> to check it out and engage with the latest content from our developer community.</p> `,
    };
    //* 3. Send the Message
    const info = await transporter.sendMail(message);
    // console.log("Email sent", info.messageId);
    return info;
  } catch (error) {
    // console.log(error);
    console.error("Error sending email:", error);
    throw new Error("Email sending failed.");
  }
};
