const { RTMClient } = require('@slack/client');
const { WebClient } = require('@slack/client');

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
    name: 'localhost'
})

// setup email data with unicode symbols
let mailOptions = {
    from: '"Support" <support@fxpal.com>', // sender address
    to: 'yulius@gmail.com', // list of receivers
    subject: 'Test', // Subject line
    text: 'Test', // plain text body
};

// send mail with defined transport object
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


// fetch users
web.users.list()
  .then((res) => {
    console.log(res);
    res.members.forEach(m => user[m.id] = m);
  })
  .catch(console.error);

rtm.on('message', (message) => {
    // For structure of `event`, see https://api.slack.com/events/message

    // Skip messages that are from a bot or my own user ID
    if ((message.subtype && message.subtype === 'bot_message') ||
        (!message.subtype && message.user === rtm.activeUserId)) {
        return;
    }

    // Log the message
    //console.log(`(channel:${message.channel}) ${user[message.user].name} says: ${message.text}`);
})
