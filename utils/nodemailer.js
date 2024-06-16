
const nodemailer = await import('nodemailer');

//!--------------Account Verification Email-------------->
export const sendVerificationEmail = async (to, token) => {
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

//!--------------Password Reset Email-------------->

export const PasswordResetEmail = async (to, resetToken) => {
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
            subject: 'Password Reset',
            html: `<p>You are recieving this email because you have requested to change the password on your <strong>B Blogger</strong> account.</p>
            <p>Please click on the link below to complete this action:</p>
            
            <p>http://localhost:3000/password-reset/${resetToken}</p>
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


//!--------------Post Notification-------------->

export const sendNotification = async (to, postId) => {
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
            subject: 'You have A Notification',
            html:  ` <p>A new post was created on our site B Blogger</p>
            <p>Click <a href="http://localhost:3000/posts/${postId}">here</a> to view the post.</p>
            `
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