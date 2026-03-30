let nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: "31ba78e3d85efc",
        pass: "63f560527709b4",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "mail reset passwrod",
            text: "lick vo day de doi passs", // Plain-text version of the message
            html: "lick vo <a href=" + url + ">day</a> de doi passs", // HTML version of the message
        });
    },
    sendPasswordEmail: async function (to, username, password, email) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; font-size: 24px; }
        .content { line-height: 1.6; color: #555; }
        .info-box { background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .credentials { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .label { font-weight: bold; color: #333; margin-top: 10px; }
        .value { background-color: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; word-break: break-all; margin-top: 5px; }
        .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999; text-align: center; }
        .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to NNPTUD!</h1>
        </div>
        
        <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            
            <p>Your account has been successfully created. Here are your login credentials:</p>
            
            <div class="credentials">
                <div class="label">👤 Username:</div>
                <div class="value">${username}</div>
                
                <div class="label">📧 Email:</div>
                <div class="value">${email}</div>
                
                <div class="label">🔑 Password:</div>
                <div class="value">${password}</div>
            </div>
            
            <div class="warning">
                ⚠️ <strong>Important:</strong> Please save your password in a safe place. You can change this password after logging in for the first time.
            </div>
            
            <div class="info-box">
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Use your username and password to log in</li>
                    <li>We recommend changing your password after first login</li>
                    <li>Complete your profile information</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>NNPTUD © 2026 | All rights reserved</p>
            <p>If you did not create this account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
        `;
        
        await transporter.sendMail({
            from: '"NNPTUD Admin" <admin@nnptud.com>',
            to: to,
            subject: "Your Account Has Been Created - Login Credentials",
            text: `Welcome! Your account has been created.\n\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}\n\nPlease save your password in a safe place.`,
            html: htmlContent
        });
    }
}