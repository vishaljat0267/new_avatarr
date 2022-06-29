const accountSid = '';
//put the twilio id
const authToken = '';
//put the twilio authtoken
const client = require('twilio')(accountSid, authToken);



exports.sendMobileSMS = async ( body , to) => {
 return await client.messages .create({
      body,
      to, 
      from: '' });
      //put number
}