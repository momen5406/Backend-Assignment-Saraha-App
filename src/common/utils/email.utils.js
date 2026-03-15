import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smpt.gmail.com",
    port: 587,
    auth: {
      user: "morenocoder@gmail.com",
      pass: "ukdo asrs vadl zgpd",
    },
  });

  await transporter.sendMail({
    from: '"Saraha App"<morenocoder@gmail.com>',
    to,
    subject,
    html,
  });
};
