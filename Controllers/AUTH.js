const { registration_user, login_user, activate_user, forget_password, set_password, create_profile, reset_profile, profile_block_pin_save, block_usre_get, save_post_get, pin_post_get, viewSingleProfile } = require("../service/AUTH_SERVICE");


// user auth.....
exports.registration = async(req,res)=>{
    const result = await registration_user(req);
    res.status(200).json(result);
};
exports.activate = async(req,res)=>{
    const result = await activate_user(req);
    res.status(200).json(result);
};
exports.login = async(req,res)=>{
    const result = await login_user(req);
    res.status(200).json(result);
};
exports.forget_password = async(req,res)=>{
    const result = await forget_password(req);
    res.status(200).json(result);
};
exports.set_password = async(req,res)=>{
    const result = await set_password(req);
    res.status(200).json(result);
};



// user profile.....
exports.create_profile = async(req,res)=>{
    const result = await create_profile(req);
    res.status(200).json(result);
};
exports.reset_profile = async(req,res)=>{
    const result = await reset_profile(req);
    res.status(200).json(result);
};
exports.profile_block_pin_save = async(req,res)=>{
    const result = await profile_block_pin_save(req);
    res.status(200).json(result);
};

exports.block_usre_get = async(req,res)=>{
    const result = await block_usre_get(req);
    res.status(200).json(result);
};
exports.save_post_get = async(req,res)=>{
    const result = await save_post_get(req);
    res.status(200).json(result);
};
exports.pin_post_get = async(req,res)=>{
    const result = await pin_post_get(req);
    res.status(200).json(result);
};
exports.viewSingleProfile = async(req,res)=>{
    const result = await viewSingleProfile(req);
    res.status(200).json(result);
};