const { RTMClient } = require('@slack/client');
const { WebClient } = require('@slack/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

// An access token (from your Slack app or custom integration - usually xoxb)
const webtoken = process.env.WEB_SLACK_TOKEN;
const bottoken = process.env.BOT_SLACK_TOKEN;
const mailTo = process.env.MAILTO || 'support@fxpal.com';
const mailFrom = process.env.MAILFROM || '"SupportBot" <support@fxpal.com>';

// console.log(webtoken, bottoken, mailTo, mailFrom);

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(bottoken);
rtm.start();

const web = new WebClient(webtoken);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
let user = {};
let channel = {};

// setup mail
const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

rtm.on('message', (message) => {
    // For structure of `event`, see https://api.slack.com/events/message

    // Skip messages that are from a bot or my own user ID
    if ((message.subtype && message.subtype === 'bot_message') ||
        (!message.subtype && message.user === rtm.activeUserId)) {
        return;
    }

    // Log the message
    //console.log(`(channel:${message.channel}) ${user[message.user].name} says: ${message.text}`);

    let userinfo = {};
    getUserInfo(message.user)
        .then((profile) => {
            userinfo = profile;
            return getChanelname(message.channel);
        })
        .then((name) => {
            channelname = name;
            sendEmail(userinfo.display_name, userinfo.real_name, userinfo.email, channelname, message.text);
        })
});

function getUserInfo(id) {
    return new Promise(function(resolve, reject) {
        let info = user[id]
        if (info) {
            resolve(info);
        } else {
            web.users.profile.get({ user: id }).then((res) => {
                // update the users roster
                let profile = user[id] = res.profile;
                resolve(profile);
            }).catch(reject);
        }
    });
}

function getChanelname(id) {
    return new Promise(function(resolve, reject) {
        let info = channel[id]
        if (info) {
            resolve(info.name);
        } else {
            web.channels.info({ channel: id }).then((res) => {
                // update the users roster
                channel[id] = res.channel;
                resolve(res.channel.name);
            }).catch(reject);
        }
    });
}

function sendEmail(username, realname, email, channelname, text) {
    let mailOptions = {
        from: mailFrom, // sender address
        replyTo: `"${realname || mailTo}" <${email || mailTo}>`,
        to: mailTo, // list of receivers
        subject: 'From Slack: #' + channelname, // Subject line
        text: `${username || 'Slack'} says: ${text}`, // plain text body
    };
    console.log(mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        // console.log('Message sent: %s', info.messageId);
    });
}
