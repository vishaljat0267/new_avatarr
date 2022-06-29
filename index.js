const express = require('express');
const mongoose= require('mongoose');
// const {Schema,model} = mongoose
const cors = require("cors");
const jwt = require('jsonwebtoken')
const  Usermodel=require ("./userschema")
const app = express();
app.use(cors());
app.use(express.json());

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



app.post('/signup', (req, res) => { // new Entry                                                     
    req.body.phone='+91'+req.body.phone
    const {phone,email}=req.body
    var val = Math.floor(1000 + Math.random() * 9000);
    req.body.verificationCode = val
    req.body.status="not verified"
    const msg=`hi this verification code ${val}`
    const userDetail = Usermodel.UserCollec(req.body)
    userDetail.save((err, userDetail) => {
        const smsresult= sendMobileSMS(msg,phone)
        const sendmail=sendMail(email,msg)
        if (err) {
            res.status(500).send({ err })
        }
        else {
            res.status(200).send({ data: userDetail })
        }
    })
})

app.patch('/verification', async(req,res,next)=>{ 
     Usermodel.UserCollec.findOneAndUpdate({email: req.body.email,verificationCode:req.body.verificationCode},{status:"verified"},{new:true})
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




app.post("/login", async (req, res) => {
    try {
        const emailphone = req.body.emailphone
        const password = req.body.password
        console.log(req.body.emailphone);

        const useremail = await Usermodel.UserCollec.findOne({ $and: [{ $or: [{ email: emailphone }, { phone: emailphone }] }, { password }] });
        console.log(useremail);
        if (useremail) {
            console.log('kkkk');
            const token = jwt.sign({ useremail }, 'email')
            res.status(200).send({ msg: "Login Successful", token ,data:useremail});

        }
        else {
            res.status(500).send("invaild login");
        }

    } catch (error) {
        res.status(400).send("invaild login Details2")
    }
})


app.get('/card', async(req, res) => {
    const data=await Usermodel.user.find({})
    console.log("hihihihii",data);
   res.send({"data":data})
})

app.get('/card2', async(req, res) => {
    const data=await Usermodel.user1.find({})
    console.log("hihihihii",data);
   res.send({"data":data})
})

app.get('/card3', async(req, res) => {
    const data=await Usermodel.user2.find({})
    console.log("hihihihii",data);
   res.send({"data":data})
})

app.get('/card4', async(req, res) => {
    const data=await Usermodel.user3.find({})
    console.log("hihihihii",data);
   res.send({"data":data})
})

app.get('/mobileproducts', async(req, res) => {
    const data=await Usermodel.user5.find({})
    console.log("hihihihii",data);
   res.send({"data":data})
})


app.post('/addtocart',async(req, res) => {
    console.log(req.body);
    req.body.quantity=1
    const userDetail = Usermodel.user4(req.body)
    //  userDetail.cartItems.push(_id)
    userDetail.save((err,userDetail)=>{  
    console.log(userDetail);
   if (err) {
        res.status(500).send({ err })
    }
    else {
        res.status(200).send({msg:"item added succesfully",data:req.body })
    }
})
})

app.delete('/deleteitem/:id',(req,res)=> {
    // const userDetail = Usermodel.user4.find(req.body)
     Usermodel.user4.findOneAndDelete({_id: req.params.id}, function(err,data){
        if(err) return res.send(err);
        res.send("Successfully deleted Items")
    })

})






app.get('/cardShow', async(req, res) => {
    const data=await Usermodel.user4.find({})
   
    console.log("hihihihii",data.length);
   res.send({"data":data})
})


// BlogPost.update({_id: blogPostId, 'comments._id': commentId}, {$inc:{'comments.$.rating':1}})


app.patch('/updatequantity/:id',async(req,res)=>{
   var id =req.params.id;
   console.log(req.params);
   if (req.body.update==="inc") {
    Usermodel.user4.findOneAndUpdate({"_id":id},{ $inc :{quantity:1,}},{new : true},function(err,data){
        console.log(data);
        if(err) return new Error("no products")
        res.status(201).send({msg:"data successfully",data:data})
    })
    }
    else{
        Usermodel.user4.findOneAndUpdate({"_id":id},{ $inc :{quantity:-1 || quantity>=0}},{new : true},function(err,data){
            if(err) return new Error("no products")
            res.status(201).send({msg:"data successfully",data:data})
        })

    }
})













app.listen(port, () => {
    console.log("Server is running on port 8080");
})