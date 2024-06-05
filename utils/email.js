const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
      this.firstName = user.name.split(' ')[0]
    this.url = url,
      this.from = `Pranay Dak <${process.env.EMAIL_FROM}>`
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        auth: {
          user: '7f748f7a6493d5472670c64407b2fa39',
          pass: 'e56ef347bacf6e85b61838a3892dea46'
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //send the actual email
  async send(template, subject) {
    // 1) render the html based on a pug templet
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html)
    }

    // 3 create a transport and send email
    await this.newTransporter().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!')
  }

  async sendPasswordReset(){
    this.send('passwordReset','Your password reset token(valid for only 10 min) ')

  }
}
