const accountSid = 'k';
//put the twilio id
const authToken = 'k';
//put the twilio authtoken
const client = require('twilio')(accountSid, authToken);



exports.sendMobileSMS = async ( body , to) => {
 return await client.messages .create({
      body,
      to, 
      from: 'k' });
      //put number
}