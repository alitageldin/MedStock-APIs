const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRIDKEY);

exports.sendEmail = async (recipient, data, subject, templateName, attachments) => {
  try {
    const source = fs.readFileSync(path.join(__dirname, `/email-templates/${templateName}`), 'utf8')
    const template = Handlebars.compile(source)
    const msg = {
      from: process.env.EMAIL,
      to: recipient,
      subject: subject,
      html: template(data),
      attachments: attachments
    }
  sgMail
      .send(msg)
      .then((response) => {
      })
      .catch((error) => {
      });
  } catch (error) {
  }


  
}
