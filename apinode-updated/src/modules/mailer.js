const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const { host, port, user, pass } = require('../config/mail.json');

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
});

const handlebarOptions = {
    viewEngine: {
        extName: '.html',
        partialsDir: './src/resources/mail/',
        layoutsDir: './src/resources/mail/',
    },
    viewPath: './src/resources/mail/',
    extName: '.html',
};

transport.use('compile', hbs(handlebarOptions));

module.exports = transport;

// const path = require('path');
// const nodemailer = require('nodemailer');
// const hbs = require('nodemailer-express-handlebars');


// const { host, port, user, pass } = require('../config/mail');

// const transport = nodemailer.createTransport({
//     host,
//     port,
//     auth: { user, pass },
// });

// transport.use('compile', hbs({
//     viewEngine: 'handlebars',
//     viewPath: path.resolve('./src/resources/mail/'),
//     extName: '.html',
// }));

// module.exports = transport;