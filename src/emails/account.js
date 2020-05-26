const nodemailer = require('nodemailer')
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})
const sendWelcomeEmail = (email, name) => {
    transporter.sendMail({
        //from: 'practice2912@gmail.com',
        to: email,
        subject: 'Thanks for joining Task App',
        text: `Hello ${name}. Welcome to the app`
    })
}
const sendCancelEmail = (email, name) => {
    transporter.sendMail({
        //from: 'practice2912@gmail.com',
        to: email,
        subject: 'Sad to see you go from Task App',
        text: `Hello ${name}.Please let us know why you left`
    })
}
module.exports = {sendWelcomeEmail,sendCancelEmail}