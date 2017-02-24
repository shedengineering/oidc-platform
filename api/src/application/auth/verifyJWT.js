const jose = require('node-jose');
const atob = require('atob');

module.exports = () => (keystore) => (decoded, request, callback) => {
  const token = request.headers.authorization;
  try {
    const header = JSON.parse(atob(token.split('.')[0]));
    const key = keystore.get(header.kid);
    jose.JWS.createVerify(key).verify(token).then(verify => {
      callback(null, true);
    }).catch(e => {
      callback(null, false);
    });
  } catch (e) {
    return callback(null, false);
  }
};

module.exports['@singleton'] = true;
module.exports['@require'] = [];
