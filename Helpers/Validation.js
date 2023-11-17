const userModel = require("../Models/User_Model");
const jwt = require('jsonwebtoken');

exports.validationEmail = (email)=>{
    return String(email).match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/);
};

exports.validationLength = (text,min,max)=>{
    if(text.length > max || text.length < min){
        return false
    }else{
        return true
    }
};

exports.validationUserName = async(userName)=>{
   let a = false;

    do{
        let check = await userModel.findOne({userName:userName});
        if(check){
            userName += (+new Date()* Math.random()).toString().substring(0,1);
            a = true;
        }else{
            a = false;
        }
    } while (a);
    return userName;
};

exports.generateToken = (payload,exp)=>{
    return jwt.sign(payload,process.env.KEY,{expiresIn: exp});
};