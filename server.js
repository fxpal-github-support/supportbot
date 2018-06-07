const { RTMClient } = require('@slack/client');
const { WebClient } = require('@slack/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

// An access token (from your Slack app or custom integration - usually xoxb)
const token = process.env.SLACK_TOKEN;

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(token);
rtm.start();

const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
let supportChannel = '';
let user = {}

// setup mail
const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

web.users.list()
    .then((res) => {
        console.log(res);
        res.members.forEach(m => user[m.id] = m);

        rtm.on('message', (message) => {
            // For structure of `event`, see https://api.slack.com/events/message

            // Skip messages that are from a bot or my own user ID
            if ((message.subtype && message.subtype === 'bot_message') ||
                (!message.subtype && message.user === rtm.activeUserId)) {
                return;
            }

            // Log the message
            //console.log(`(channel:${message.channel}) ${user[message.user].name} says: ${message.text}`);

            // setup email data with unicode symbols
            let username = (user[message.user] || {}).name || message.user;
            if (!username) {
                return;
            }

            let mailOptions = {
                from: '"SupportBot" <support@fxpal.com>', // sender address
                to: 'support@fxpal.com', // list of receivers
                subject: 'From Slack: #support', // Subject line
                text: `${username} says: ${message.text}`, // plain text bod
            };


            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
                // // Preview only available when sending through an Ethereal account
                // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });

    })
    .catch(console.error);

