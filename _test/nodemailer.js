import nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport({
    auth: {
        pass: 'SG.0.0',
        user: 'apikey',
    },
    host: 'smtp.sendgrid.net',
    port: 587,
})

transporter.sendMail(
    {
        from: 'open-listings@gmx.com', // verified sender email
        html: '<b>Hello world!</b>', // html body
        subject: 'Test message subject', // Subject line
        text: 'Hello world!', // plain text body
        to: 'bacloud14@gmail.com', // recipient email
    },
    function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    },
)
