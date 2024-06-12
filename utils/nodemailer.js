
const nodemailer = await import('nodemailer');

const sendVerificationEmail = async (to, token) => {
    try {
        //* 1. Create transporter
        const transporter = nodemailer.createTransport({
            // host: "smtp.gmail.com",
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_APP_USER,
                pass: process.env.GMAIL_APP_PASSWORD, 
            }
        })
        //* 2. Create Message
        const message = {
            to,
            subject: 'Account Verification',
            html: `<p>You are recieving this email because you have requested to verify your account with <strong>B Blogger</strong>.</p>
            <p>Please click on the link below to complete this action:</p>
            
            <p>http://localhost:3000/dashboard/account-verification/${token}</p>
            <p>If you did not make this request, kindly ignore this email.</p>`
        }
        //* 3. Send the Message
        const info = await transporter.sendMail(message)
        console.log('Email sent', info.messageId);
        return info
    } catch (error) {
        console.log(error);
        throw new Error('Email sending failed.')
    }
}

export default sendVerificationEmail;
