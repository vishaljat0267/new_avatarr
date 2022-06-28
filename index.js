const express = require('express');
const mongoose= require('mongoose');
// const {Schema,model} = mongoose
const cors = require("cors");
const jwt = require('jsonwebtoken')
const  Usermodel=require ("./userschema")
const app = express();

const {sendMobileSMS} = require('./TwilioSms')
const sendMail = require('./NodemailerEmail')

const port =process.env.PORT || 8080;

const DB = 'mongodb+srv://vish:1234@cluster0.c9vwu.mongodb.net/mernstack'

{
mongoose.connect(DB,{
    // useNewUrlParser: true,
  
    // useUnfiedTopology: true,
    // useFindAndModify: false
}).then(()=>{
    console.log('connections successful');
}).catch((err) => console.log('no connections'));

};
app.use(cors());
app.use(express.json());


app.post('/signup',(req,res)=>{ // new Entry    
    req.body.phone='+91'+req.body.phone 
    const {phone,email}=req.body
    var val = Math.floor(1000 + Math.random() * 9000);
    req.body.verificationCode = val
    req.body.status="not verified"
    const msg = `Hello friends! verification code ${val}`                                                
               const userDetail = Usermodel.Usercollec(req.body)
               userDetail.save((err,userDetail)=>{
                const smsresult=sendMobileSMS(msg,phone)
                const sendMail =sendMail(email,msg)
                   if(err){
                       res.status(500).send({err})
                   }
                   else{
                       res.status(200).send({data:userDetail})
                   }
               })
})

app.patch('./verification', async(req,res,next)=>{
    Usermodel.Usercollec.findOneAndUpdate({email: req.body.email,verificationCode:req.body.verificationCode},{status:"verified"},{})
    .then(user=>{
        console.log(user);
        if(user){
            res.status(200).send({msg:'verified succesfully',data:user})
        }
        else{
            console.log('user Does Not Exits');
        }
    })
})


app.post('/login', async (req, res) => {
    try {
        const emailphone = req.body.emailPhone
        const password = req.body.password

        const useremail = await Usermodel.Usercollec.findOne({ $and: [{ $or: [{ email: emailphone }, { phone: emailphone }] }, { password }] });
        console.log(useremail);

        if (useremail) {
            const token = jwt.sign({ useremail }, 'email');
            res.status(200).send({ msg: "login succesfull", token, data:useremail });
        }
        else {
            res.status(500).send({ msg: "invalid user" })
        }
    }
    catch (error) {
        res.status(400).send("invaild details")
    }
})

app.get('/card', async (req, res) => {
    
    const data = await Usermodel.user.find({});
    console.log("hello", data);
    res.send({ "data": data })

})
app.get('/card2', async (req, res) => {
    const data = await Usermodel.user1.find({})
    console.log("hello", data);
    res.send({ "data": data })
})
app.get('/card3', async (req, res) => {
    const data = await Usermodel.user2.find({})
    console.log("hello", data);
    res.send({ "data": data })
})
app.get('/card4', async (req, res) => {
    const data = await Usermodel.user3.find({})
    console.log("hello", data);
    res.send({ "data": data })
})


app.post('/addtocart', async(req, res) => {
    console.log(req.body);
    req.body.quantity=1
    const userDetail = Usermodel.user4(req.body)
    userDetail.save((err, userDetail) => {
        console.log(userDetail);
        if(err){
            res.status(500).send({ err })
        }
        else{
            res.status(200).send({msg:"items added successfully", data:req.body })
        }
    })
})

app.delete('/deleteitem/:id', async(req, res) => {
    const userDetail = Usermodel.user4.find(req.body)
    userDetail.findOneAndDelete({_id: req.params.id}, function(err){
        if(err){
            res.send(err);
        }
        else{
            res.send("Successfully deleted items"); 
        }
    })
})

app.get('/cardshow', async(req, res) => {
    const data = await Usermodel.user4.find({})
    res.send({ "data": data })
})


app.patch('/updatequantity/:id', async(req,res)=>{
    var id = req.params.id;
    console.log(req.params);
    if(req.body.update === 'inc'){
        Usermodel.user4.findOneAndUpdate({"_id":id},{ $inc :{quantity:+1}},{new : true},function(err,data){
            console.log(data);
            if(err) return new Error("no items")
            res.status(201).send({msg:"data successfully", data:data})
        })
   }
   else{
       Usermodel.user4.findOneAndUpdate({"_id":id}, {$inc :{quantity:-1 || quantity>=0}},{new : true}, function(err,data){
           if(err) return new Error("no items")
           res.status(201).send({msg:"data successfully", data:data})
       })
   }
})




app.listen(port, ()=>{
    console.log("Server is running on port 8080");
})