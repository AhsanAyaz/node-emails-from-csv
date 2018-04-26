'use strict';
 
const path = require('path');
const csv = require('csv');
const parse = require('csv-parse');
const fs = require('fs');
const mailHelper = require('./helpers/mailer');
const handlebars = require('handlebars');

// app/email specific variables
const csvRecords = [];
let eventRegistrations = [];
const emailColIndexInCSV = 2;   // based on the data in your csv file
const nameColIndexInCSV = 1;   // based on the data in your csv file
const sourceCSVFile = path.join(__dirname, './files/test.csv');
const emailTemplate = 'registration-email.html';    // will be used when sending emails
const senderEmailAddress = 'admin@mydomain.com';    // this will show up in the target user's inbox as who sent the email
const emailVars = {
    name: 'My Event Name',
    date: '03-30-2020',
    time: '3:00 PM',
    venue: 'Grand America Hotel | Salt Lake City',
    venueLink: 'https://www.google.com/maps/place/The+Grand+America+Hotel/@40.7574406,-111.8902221,15z/data=!4m2!3m1!1s0x0:0x6fae71fa7326abbd?sa=X&ved=0ahUKEwinuISQtdfaAhUHPo8KHXQODCQQ_BII4AEwCg'
}
const emailSubject = `Registration - ${emailVars.name}`;

/**
 * @author Ahsan Ayaz
 * @desc Entry method for the script
 */
const startExecution = async() => {
    await readCSVFile()
    parseCSVAndCreateEmailRows();
    await sendEmailsToTargetUsers(); 
    console.log('** Emails sent **');
}

/**
 * @author Ahsan Ayaz
 * @desc Reads the CSV file for the records containing user emails and user names
 * Creates a records array for the data from CSV
 * @returns {Promise} which gets resolved when the csv stream ends
 */
const readCSVFile = () => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(sourceCSVFile)
            .pipe(parse({delimiter: ','}))
            .on('data', (csvRow) => {
                csvRecords.push(csvRow);        
            })
            .on('end', () => {
                resolve();
            });
    });
}

/**
 * @author Ahsan Ayaz
 * @desc Creates an array containing properties needed in the email extracted out from the
 * CSV data which we already pushed to csvRows
 */
const parseCSVAndCreateEmailRows = () => {
    csvRecords.map((regItem) => {
        eventRegistrations.push({
            name: regItem[nameColIndexInCSV],
            email: regItem[emailColIndexInCSV]
        });
    });
    eventRegistrations.splice(0, 1);
}

/**
 * @author Ahsan Ayaz
 * @desc Fetches the email template, compiles while replacing the variable placeholders with real data.
 * Then sends the email to the target users
 * @returns {Promise} which gets resolved once all the emails have been sent.
 */
const sendEmailsToTargetUsers = async () => {
    // uncomment the below chunk and put your email & name for testing
    // nsRegistrations = [{
    //     name: "Test User",
    //     email: 'test@test.com'
    // }];
    return new Promise((resolve, reject) => {
        mailHelper.readHTMLTemplate(emailTemplate, async function (err, html) {
            if (!err) {
                const template = handlebars.compile(html);
                for (let i =0, len = eventRegistrations.length; i < len; ++i) {
                    const registration = eventRegistrations[i];
                    const replacements = {
                        userName: registration.name,
                        eventName: emailVars.name,
                        eventVenue: emailVars.venue,
                        eventDate: emailVars.date,
                        eventTime: emailVars.time,
                        eventVenueLink: emailVars.venueLink
                    };
        
                    const htmlToSend = template(replacements);
                    const mailOptions = {
                        from: senderEmailAddress,
                        to: registration.email,
                        subject: emailSubject,
                        html: htmlToSend
                    };
        
                    await mailHelper.sendMail(mailOptions);
                }
                resolve();
            }
            else {
                console.log(err);
                reject(err);
            }
        });
    });
}

// initialize the awesome!
startExecution();