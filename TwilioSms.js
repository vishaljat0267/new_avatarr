const accountSid = 'AC0dc67b3ed763baa101096a174775160f';
//put the twilio id
const authToken = '60ae47969cfc720f41b2829dd1ae0e71';
//put the twilio authtoken
const client = require('twilio')(accountSid, authToken);



exports.sendMobileSMS = async ( body , to) => {
 return await client.messages .create({
      body,
      to, 
      from: '+12567980230' });
      //put number
}