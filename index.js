const express = require('express');
const mongoose = require('mongoose');
const { sendMobileSMS } = require('./TwilioSms')
const sendMail = require('./NodemailerEmail')
// const {Schema,model} = mongoose
const cors = require("cors");
const jwt = require('jsonwebtoken')
const Usermodel = require("./userschema")
const app = express();
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 8080;

const DB = 'mongodb+srv://vish:1234@cluster0.c9vwu.mongodb.net/mernstack'

{
    mongoose.connect(DB, {
     
    }).then(() => {
        console.log('connections successful');
    }).catch((err) => console.log('no connections'));

};



app.post('/signup', (req, res) => { // new Entry                                                     
    req.body.phone = '+91' + req.body.phone
    const { phone, email } = req.body
    var val = Math.floor(1000 + Math.random() * 9000);
    req.body.verificationCode = val
    req.body.status = "not verified"
    const msg = `hi this verification code ${val}`
    const userDetail = Usermodel.Usercollec(req.body)
    userDetail.save((err, userDetail) => {
        const smsresult = sendMobileSMS(msg, phone)
        const sendmail = sendMail(email, msg)
        if (err) {
            res.status(500).send({ err })
        }
        else {
            res.status(200).send({ data: userDetail })
        }
    })
})

app.patch('/verification', async (req, res, next) => {
    Usermodel.Usercollec.findOneAndUpdate({ email: req.body.email, verificationCode: req.body.verificationCode }, { status: "verified" }, { new: true })
        .then(user => {
            console.log(user);
            if (user) {
                res.status(200).send({ msg: 'verified succesfully', data: user })
            }
            else {
                console.log('user Does Not Exits');
            }
        })
})




app.post("/login", async (req, res) => {
    try {
        const emailphone = req.body.emailphone
        const password = req.body.password
        console.log(req.body.emailphone);

        const useremail = await Usermodel.Usercollec.findOne({ $and: [{ $or: [{ email: emailphone }, { phone: emailphone }] }, { password }] });
        console.log(useremail);
        if (useremail) {
            // console.log('kkkk');
            const token = jwt.sign({ useremail }, 'email')
            res.status(200).send({ msg: "Login Successful", token, data: useremail });

        }
        else {
            res.status(500).send("invaild login");
        }

    } catch (error) {
        res.status(400).send("invaild login Details2")
    }
})

app.get('/getUsers', async (req, res) => {
    try {
        const data = await Usermodel.Usercollec.find({})
        res.status(200).send({ data })
    } catch (error) {
        res.status(500).send({ msg: "unable to fetch" })
    }
})

app.get('/card', async (req, res) => {
    const data = await Usermodel.user.find({})
    console.log("hihihihii", data);
    res.send({ "data": data })
})

app.get('/card2', async (req, res) => {
    const data = await Usermodel.user1.find({})
    console.log("hihihihii", data);
    res.send({ "data": data })
})

app.get('/card3', async (req, res) => {
    const data = await Usermodel.user2.find({})
    console.log("hihihihii", data);
    res.send({ "data": data })
})

app.get('/card4', async (req, res) => {
    const data = await Usermodel.user3.find({})
    console.log("hihihihii", data);
    res.send({ "data": data })
})

app.get('/mobileproducts', async (req, res) => {
    const data = await Usermodel.user5.find({})
    console.log("hihihihii", data);
    res.send({ "data": data })
})




app.post('/addtocart', async (req, res) => {
    try {
        req.body.quantity = 1
        const { title, description, image, email, category, product_id, quantity,price } = req.body;
        console.log(req.body);
        const result = await Usermodel.Usercollec.findOneAndUpdate({ email }, { $push: { cartItems: { title, description, image, category, product_id, quantity,price } } })
        // console.log("===============>", result);
        result ? res.status(200).send({ msg: "item added succesfully" }) : res.status(404).send({ msg: "email not found" })
    }
    catch (err) {
        res.status(500).send(err)
    }


})

app.delete('/deleteitem/:product_id/:email', async (req, res) => {
    // const userDetail = Usermodel.user4.find(req.body)
    const { product_id, email } = req.params
    // console.log(">>>>>>", req.body);
    // console.log(";;;;;;", req.params);
    const result = await Usermodel.Usercollec.findOneAndUpdate({ email }, {
        $pull: {
            cartItems: {
                product_id: product_id,
            },
        }
    })
    console.log("===============>", result);
    result ? res.status(200).send({ msg: "item delete succesfully", data: result }) : res.status(404).send({ msg: "email not found" })
})

app.get('/cardShow', async (req, res) => {
    try {
        const {authorization}= req.headers
        // console.log(">>>>>>",req.headers)
        var decoded = jwt.verify(authorization , 'email');
        // console.log(">>>>>>fhsjcdbnm",decoded)
        const {email} = decoded.useremail
                const data = await Usermodel.Usercollec.findOne({ email });
                console.log(">>>>>>>>>>>", data);
                data ? res.status(200).send({ data: data.cartItems }) : res.status(404).send({ msg: "email not found" });
            } catch (error) {
                res.status(500).send({ error })
            }
})
app.patch('/updatequantity/:product_id/:email', async (req, res) => {

    console.log(req.params)
    const { product_id, email } = req.params
    const { update, quantity } = req.body
    let i = parseInt(quantity)
    console.log("=====================>", i);
    if (update === "inc") {

        await Usermodel.Usercollec.findOneAndUpdate({ $and: [{ email }, { "cartItems.product_id": product_id }] }, { $set: { "cartItems.$.quantity": ++i } }, { new: true }, function (err, data) {
            console.log("===>", data);
            if (err) return new Error("no products")
            res.status(200).send({ data: data })
        }).clone().catch(function (err) { console.log(err) })


    }
    else {
        if (i > 0) {
            Usermodel.Usercollec.findOneAndUpdate({ $and: [{ email }, { "cartItems.product_id": product_id }] }, { $set: { "cartItems.$.quantity": --i } }, { new: true }, function (err, data) {
                if (err) return new Error("no products")
                res.status(201).send({ msg: "data successfully", data: data })
            })
        }


    }
})

app.post('/filterItems', async(req, res) => {
    console.log(req.body);
    const filterProduct =  Usermodel.Usercollec(req.body)
    filterProduct.save((err, filterProduct) => {
        console.log(filterProduct);
        if(err){
            res.status(500).send({ err })
        }
        else{
            res.status(200).send({msg:"products added successfully", data:req.body })
        }
    })
})

app.post('/getProductByCategory/:category', async (req,res) =>{
    const {category,image} = req.body
    const data =  await Usermodel.user3.find({}, { projection: {} })
    console.log("data", data);
    res.send({ "data": data })
})


app.listen(port, () => {
    console.log("Server is running on port 8080");
})