const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const checkWhitelist = require('../check-whitelist');

class SesDriver {
  send(emailObject) {
    return new Promise((resolve, reject) => {
      if (!emailObject.to) {
        return reject('no to address provided');
      }

      if (!emailObject.subject) {
        return reject('no subject provided');
      }

      if (!emailObject.text && !emailObject.html) {
        return reject('no text or html body provided');
      }

      if (emailObject.attachments) {
        return reject('ses driver does not currently support attachments');
      }

      const params = {
        Destination: { ToAddresses: [checkWhitelist(emailObject.to, reject)] },
        Message: {
          Body: {
            Html: {
              Data: emailObject.html
            },
          },
          Subject: {
            Data: emailObject.subject,
          },
        },
        Source: emailObject.from || 'no-reply@' + process.env.OIDC_EMAIL_DOMAIN,
      };

      ses.sendEmail(params).promise().then(result => {
        console.log(result);
        resolve(result);
      })
        .catch(err => {
          reject(err);
        });
    });
  }
}

module.exports = SesDriver;
