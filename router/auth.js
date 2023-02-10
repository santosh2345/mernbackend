
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authenticate = require("../middleware/authenticate");

require('../db/conn');
const User = require("../model/userSchema");
const { Router } = require('express');

const cookieParser = require("cookie-parser");
router.use(cookieParser())

router.get('/', (req, res) => {
    res.send(`Hello world from the server from router`);
});

// =========== user REGISTRATION part ===========================================

//=================Using Promises========================================

// router.post('/register',(req, res)=>{

//     const {name ,email,phone,work,password,cpassword} = req.body;
// if(!name || !email || !phone || !work || !password || !cpassword){
//     return res.status(422).json({Error: "please fill all the data required!"})
// }
//    User.findOne({email:email}).then((userExist)=>{
//     if(userExist){
//         return res.status(422).json({errr:"email already exist"});
//     }
//     const user = new User({name ,email,phone,work,password,cpassword})
//     user.save().then(()=>{
//         res.status(201).json({message: "user registered successfully"});
//     }).catch((err)=>{
//         res.status(500).json({error:"failed to registered"})
//     });
//    }).catch((err)=>{ 
//     console.log(err);
//    });


// });


// ================= Using Async Await ============================

router.post('/register', async (req, res) => {

    const { name, email, phone, work, password, cpassword } = req.body;
    console.log(name + email + phone + work + password + cpassword)
    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ error: "please fill all the data required!" })
    }

    try {

        const userExist = await User.findOne({ email: email })
        if (userExist) {
            return res.status(422).json({ error: "email already exist" });
        } else if (password != cpassword) {
            return res.status(422).json({ error: "passwords are not matching" });

        } else {
            const user = new User({ name, email, phone, work, password, cpassword })
            const userRegister = await user.save();

            if (userRegister) {
                res.status(201).json({ message: "user registered successfully" });
            }
            else {
                res.status(500).json({ error: "failed to registered" })
            }
        }






        // short cut of above but else condition wasn't there so i choose above code
        // await user.save();
        // res.status(201).json({message: "user registered successfully"});

    } catch (err) {
        console.log(err);

    }
});

// ========================= user LOG IN part ======================

router.post('/signin', async (req, res) => {
    let token;
    // console.log(req.body);
    // res.json({message: "it's done man good job."});

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ Error: "Please fill the data !" });
        }


        const userLogin = await User.findOne({ email: email });
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password)

            token = await userLogin.generateAuthToken();
            // console.log(token);

            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true,
                secure:true
            });

            if (!isMatch) {
                res.status(400).json({ error: "Invalid Credential!" });
            } else {
                res.json({ message: "user signin successfully" });
            }
        } else {

            res.status(400).json({ error: "Invalid Credential!" });
        }
    } catch (error) {

    }
})

router.get('/about', authenticate, (req, res) => {
    console.log("from about page")
    res.send(req.rootUser);
});


router.get('/getdata', authenticate, (req, res) => {
    console.log("from about page and home page")
    res.send(req.rootUser)

})

router.post('/contact', authenticate, async (req,res) => {

    try {
        
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            console.log("Error occured in contact page!")
            res.json({ error: "plz fill all the info in form" })
        }
        else {

            const userContact = await User.findOne({ _id: req.userID });

            if (userContact) {
                const userMessage = await userContact.addMessage(name, email, phone, message);
                await userContact.save();
                res.status(201).json({ message: "user contact successfully" });
            }

        }

    }
    catch (err) {
        console.log(err)

    }
})


router.get('/logout', (req, res) => {
    console.log("this is from logout page");
    res.clearCookie('jwtoken',{path:'/'});
    res.status(200).send('user logout')

})


module.exports = router;