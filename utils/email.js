const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
   host: "sandbox.smtp.mailtrap.io",
   port: 2525,
   auth: {
      user: "270956161ffdca",
      pass: "dd1175076042fb",
   },
});
const sendEmail = async function (options) {
   const info = await transporter.sendMail({
      from: ` ${process.env.SMTP_FROM} ${process.env.SMTP_FROM_EMAIL}
    `, // sender address
      to: options.email, // list of receivers
      subject: options.subject, // Subject line
      html: options.message, // shtml body
   });

   return info;
};

module.exports = sendEmail;
