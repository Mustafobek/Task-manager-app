const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAILER_PASSWORD
    }
}, {
    from: `<${process.env.MAILER}>`
})

const sendWelcomeEmail = async (mail, name) => {
    return await transporter.sendMail({
        to: `${name} <${mail}>`,
        subject: `Hello and Welcome ${name}!`,
        text: 'Happy to see you with us on this way!'
    })
        .then(data => console.log(`Email sent to: ${mail}`))
        .catch(e => console.log(e))
}

const sendByeEmail = async (mail, name) => {
    return await transporter.sendMail({
        to: `${name} <${mail}>`,
        subject: `So sorry to see you go  ${name}!`,
        text: 'Hope you will come back soon!'
    })
        .then(data => console.log(`Email sent`))
        .catch(e => console.log(e))
}


module.exports = {
    sendWelcomeEmail, sendByeEmail
}