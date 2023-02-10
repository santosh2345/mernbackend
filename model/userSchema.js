const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config({path:'./config.env'});




const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    work:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    messages:[
    {
                    name:{
                        type:String,
                        required:true
                    },
                    email:{
                        type:String,
                        required:true
                    },
                    phone:{
                        type:Number,
                        required:true
                    },
                    message:{
                        type:String,
                        required:true
                    }
        
    }],
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }]
})



userSchema.pre('save',async function(next){
    console.log("hi hello how are you ?");
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
    next();
});


// generating token

userSchema.methods.generateAuthToken = async function(){
    try {
        let tokencreated = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:tokencreated});
        await this.save();
        return tokencreated;
    } catch (error) {
        console.log(error);
        
    }
}

// storing message to the db

userSchema.methods.addMessage = async function(name,email,phone,message){
    try {
        this.messages = this.messages.concat({name,email,phone,message});
        await this.save();
        return this.messages;
    } catch (error) {
        console.log(error)
    }
}



// collection creation....

const User = mongoose.model('USER',userSchema);

module.exports = User;