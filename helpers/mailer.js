/**
 * Created by siraj on 5/03/2018.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

const EMAIL_USER ='<your_email>';
const EMAIL_PASS ='<your_password>';

/** smtp configuration for nodemailer */
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

module.exports = {

    readHTMLTemplate: function (templateName, callback) {
        fs.readFile(__dirname + "/../templates/" + templateName, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, html);
            }
        });
    },

    sendMail: async function (mailOptions) {
        try {
            let info = await transporter.sendMail(mailOptions);
            console.log(info);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
};
