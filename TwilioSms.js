const accountSid = 'AC0dc67b3ed763baa101096a174775160f';
const authToken = 'db27977355bf5af86051c450c908d8bf';
const client = require('twilio')(accountSid, authToken);


exports.sendMobileSMS = async ( body , to) => {
 return await client.messages .create({
      body,
      to,
      from: '+12567980230' });
}