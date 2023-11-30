const { create_post, update_post } = require("../service/POST_SERVICE");

exports.create_post = async(req,res)=>{
    const result = await create_post(req);
    res.status(200).json(result);
};

exports.update_post = async(req,res)=>{
    const result = await update_post(req);
    res.status(200).json(result);
};