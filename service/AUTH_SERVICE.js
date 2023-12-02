const bcrypt = require('bcryptjs');
const {
    validationEmail,
    validationLength,
    validationUserName,
    generateToken
} = require("../Helpers/Validation");
const userModel = require('../Models/User_Model');
const {
    sendEmail
} = require('../utilities/SentEmail_uts');
const jwt = require('jsonwebtoken');
const {
    forgetPassword_URL_sentemail
} = require('../utilities/forgetPassword_URL_sentemail');
const {
    Buffer
} = require('buffer');
const userProfileModel = require('../Models/user_profile_Model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.registration_user = async (req) => {
    try {

        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return {
                status: "Fail",
                message: "all fields is required."
            };
        }

        if (!validationLength(firstName, 3, 15)) {
            return {
                status: "Fail",
                message: "firstName must be 3 and 15 characters."
            };
        }

        if (!validationLength(lastName, 3, 15)) {
            return {
                status: "Fail",
                message: "lastName must be 3 and 15 characters."
            };
        }

        if (!validationEmail(email)) {
            return {
                status: "Fail",
                message: "invalid email address."
            };
        }

        if (!validationLength(password, 8, 40)) {
            return {
                status: "Fail",
                message: "password must be 8 and 40 characters."
            };
        }

        const passwordBcrypt = await bcrypt.hash(password, 12);

        const existEmail = await userModel.findOne({
            email
        });

        if (existEmail) {
            return {
                status: "Fail",
                message: "email address already exist."
            };
        }

        const username = `${firstName} ${lastName}`;

        const newUserName = await validationUserName(username);

        const userData = await new userModel({
            firstName,
            lastName,
            email,
            userName: newUserName,
            password: passwordBcrypt
        }).save();

        const emailVerification = generateToken({
            id: userData._id
        }, "15m");

        const url = `${process.env.BASE_URL}/activate/${emailVerification}`;

        await sendEmail(userData.email, userData.firstName, url);

        return {
            status: "success",
            message: "registration successfully."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};
// active user==================================
exports.activate_user = async (req) => {
    try {

        const {
            id
        } = req.params;
        if (!id) {
            return {
                status: "Fail",
                message: "use token is required."
            };
        };

        const verificationData = jwt.verify(id, process.env.KEY);

        const expireToken = Date.now() / 1000 > verificationData.exp;
        if (expireToken) {
            return {
                status: "Fail",
                message: "expire Your Token please try again."
            };
        }

        const findUser = await userModel.findOne({
            _id: verificationData.id
        });

        if (findUser.activated == true) {
            return {
                status: "Fail",
                message: "already activated your account."
            };
        }

        const userDatas = await userModel.findByIdAndUpdate({
            _id: verificationData.id
        }, {
            $set: {
                activied: true
            }
        });

        const profileUserName = userDatas.firstName + " " + userDatas.lastName;

        await userProfileModel.updateOne({
            userId: verificationData.id
        }, {
            $set: {
                userName: profileUserName,
                userId: verificationData.id
            }
        }, {
            upsert: true
        });

        const userData = await userModel.findByIdAndUpdate({
            _id: verificationData.id
        }, {
            $set: {
                activated: true
            }
        });

        const userActivatedToken = generateToken({
            id: userData._id
        }, "15d");

        return {
            status: "success",
            token: userActivatedToken
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// usesr login=============================================
exports.login_user = async (req) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return {
                status: "Fail",
                message: "all fields is required."
            };
        }
        if (!validationEmail(email)) {
            return {
                status: "Fail",
                message: "invalid email address."
            };
        }
        if (!validationLength(password, 8, 40)) {
            return {
                status: "Fail",
                message: "password must be 8 and 40 characters."
            };
        }

        const findUser = await userModel.findOne({
            email
        });
        if (!findUser) {
            return {
                status: "Fail",
                message: "there are no account in this email."
            };
        };

        const passwordCheck = await bcrypt.compare(password, findUser.password);
        if (!passwordCheck) {
            return {
                status: "Fail",
                message: "invalid your email/password please try again."
            };
        };

        if (findUser.activated == true) {
            const userToken = generateToken({
                id: findUser._id
            }, "15d");
            return {
                status: "success",
                token: userToken
            };
        } else {
            const emailVerification = generateToken({
                id: findUser._id
            }, "15m");

            const url = `${process.env.BASE_URL}/activate/${emailVerification}`;

            await sendEmail(findUser.email, findUser.firstName, url);

            return {
                status: "success",
                message: "Your account is not activated please first check your email and active your account."
            };
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// forget password ============================================
exports.forget_password = async (req) => {
    try {

        const {
            email
        } = req.body;

        if (!email) {
            return {
                status: "Fail",
                message: "email is required."
            };
        }
        if (!validationEmail(email)) {
            return {
                status: "Fail",
                message: "invalid email address."
            };
        }

        const findUser = await userModel.findOne({
            email
        });
        if (!findUser) {
            return {
                status: "Fail",
                message: "there are no account in this email."
            };
        };

        if (findUser.activated == false) {
            return {
                status: "Fail",
                message: "please activated your account first."
            };
        }

        const emailVarification = generateToken({
            id: findUser._id
        }, "15m");

        const url = `${process.env.BASE_URL}/set-password/${emailVarification}`;

        await forgetPassword_URL_sentemail(findUser.email, findUser.firstName, url);

        return {
            status: "success",
            message: "please check Your email and set your own new password."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// set password=================================================
exports.set_password = async (req) => {
    try {
        const {
            id
        } = req.params;
        const {
            password
        } = req.body;

        if (!id) {
            return {
                status: "Fail",
                message: "use token is required."
            };
        };

        const verificationData = jwt.verify(id, process.env.KEY);

        const expireToken = Date.now() / 1000 > verificationData.exp;
        if (expireToken) {
            return {
                status: "Fail",
                message: "expire Your Token please try again."
            };
        }

        if (!password) {
            return {
                status: "Fail",
                message: "password is required."
            };
        }
        if (!validationLength(password, 8, 40)) {
            return {
                status: "Fail",
                message: "password must be 8 and 40 characters."
            };
        }

        const passwordBcrypt = await bcrypt.hash(password, 12);

        await userModel.findByIdAndUpdate({
            _id: verificationData.id
        }, {
            $set: {
                password: passwordBcrypt
            }
        });

        return {
            status: "success",
            message: "new password set successfully."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// user profile.......=====================================
exports.create_profile = async (req) => {
    try {

        const {
            userName,
            birthYear,
            job,
            bio,
            workplace,
            high_School,
            college,
            current_city,
            home_town,
            gender,
            relationship,
            instagram,
            twitter,
            telegram,
            discord,
            userBlockId,
            savePostId,
            pinPostId
        } = req.body;
        const {
            image
        } = req.files;
        const {
            banner
        } = req.files;

        req.body.userId = req.userId;

        const validateField = (value, minLength, maxLength, fieldName) => {
            if (value && !validationLength(value, minLength, maxLength)) {
                return {
                    status: "Fail",
                    message: `${fieldName} must be between ${minLength} and ${maxLength} characters.`
                };
            }
            return null;
        };

        const validationResults = [
            validateField(userName, 3, 35, "userName"),
            validateField(birthYear, 4, 4, "birthYear"),
            validateField(job, 3, 50, "job"),
            validateField(bio, 3, 500, "bio"),
            validateField(workplace, 3, 50, "workplace"),
            validateField(high_School, 3, 50, "high_School"),
            validateField(college, 3, 50, "college"),
            validateField(current_city, 3, 50, "current_city"),
            validateField(home_town, 3, 50, "home_town"),
            validateField(gender, 3, 50, "gender"),
            validateField(relationship, 3, 50, "relationship"),
            // validateField(instagram, 3, 50, "instagram"),
            // validateField(twitter, 3, 50, "twitter"),
            // validateField(discord, 3, 50, "discord"),
            // validateField(telegram, 3, 50, "telegram")
        ];

        const failedValidation = validationResults.find(result => result !== null);

        if (failedValidation) {
            return failedValidation;
        };

        let profile_img;
        if (image) {
            const buffer = new Buffer.from(image[0].buffer);
            const result = buffer.toString('base64');
            profile_img = `data:${image[0].mimetype};base64,${result}`;
        };

        let banner_img;
        if (banner) {
            const bufferr = new Buffer.from(banner[0].buffer);
            const resultt = bufferr.toString('base64');
            banner_img = `data:${banner[0].mimetype};base64,${resultt}`;
        };

        if (userBlockId || savePostId || pinPostId) {
            await userProfileModel.updateOne({
                userId: req.userId
            }, {
                $addToSet: {
                    block_user: userBlockId,
                    save_post: savePostId,
                    pin_post: pinPostId
                }
            }, {
                upsert: true
            });
        };

        await userProfileModel.updateOne({
            userId: req.userId
        }, {
            $set: req.body,
            userImage: profile_img,
            userBannerImg: banner_img
        }, {
            upsert: true
        });

        return {
            status: "success",
            message: "profile update successfully."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// reset profile============================================
exports.reset_profile = async (req) => {
    try {

        await userProfileModel.updateOne({
            userId: req.userId
        }, {
            $set: {
                userBannerImg: "",
                birthYear: "",
                job: "",
                bio: "",
                workplace: "",
                high_School: "",
                college: "",
                current_city: "",
                home_town: "",
                gender: "",
                relationship: "",
                instagram: "",
                twitter: "",
                telegram: "",
                discord: "",
                profile_lock: false,
                block_user: [],
                save_post: [],
                pin_post: []
            }
        }, {
            upsert: true
        });

        return {
            status: "success",
            message: "profile reset successfully."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// profile block pin save =================================
exports.profile_block_pin_save = async (req) => {
    try {

        const {
            unblock,
            unpin,
            unsave
        } = req.body;

        const userData = await userProfileModel.findOne({
            userId: req.userId
        }).select({
            'block_user': 1,
            "pin_post": 1,
            "save_post": 1,
            "_id": 0
        });

        if (unblock) {
            const bloack_user = userData.block_user;
            const checkB = bloack_user.includes(unblock);
            if (!checkB) {
                return {
                    status: "Fail",
                    message: "No user found for this id."
                };
            };
        };

        if (unpin) {
            const pin_post = userData.pin_post;
            const checkP = pin_post.includes(unpin);
            if (!checkP) {
                return {
                    status: "Fail",
                    message: "No pin post found for this id."
                };
            };
        };

        if (unsave) {
            const save_post = userData.save_post;
            const checkS = save_post.includes(unsave);
            if (!checkS) {
                return {
                    status: "Fail",
                    message: "No save post found for this id."
                };
            };
        };

        await userProfileModel.findOneAndUpdate({
            userId: req.userId
        }, {
            $pull: {
                block_user: unblock,
                pin_post: unpin,
                save_post: unsave
            }
        });

        return {
            status: "success",
            message: "successfully work."
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// block user get =================================================
exports.block_usre_get = async (req) => {
    try {

        const userId = new ObjectId(req.userId);
        const matchUser = {
            $match: {
                userId
            }
        };

        let userProject = {
            $project: {
                "block_user": 1,
                "_id": 0
            }
        };

        let categoryLookup = {
            $lookup: {
                from: "user-profiles",
                localField: "block_user",
                foreignField: "_id",
                as: "block_user"
            }
        };

        let blockuserProject = {
            $project: {
                "block_user.block_user": 0,
                "block_user.pin_post": 0,
                "block_user.save_post": 0,
                "block_user.profile_lock": 0,
                "block_user.createdAt": 0,
                "block_user.userId": 0,
                "block_user.updatedAt": 0
            }
        };

        const blockUserDatfa = await userProfileModel.aggregate([matchUser, userProject, categoryLookup, blockuserProject]);

        return {
            status: "success",
            data: blockUserDatfa
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// save post get =============================================
exports.save_post_get = async (req) => {
    try {

        const userId = new ObjectId(req.userId);
        const matchUser = {
            $match: {
                userId
            }
        };

        let userProject = {
            $project: {
                "save_post": 1,
                "_id": 0
            }
        };

        let categoryLookup = {
            $lookup: {
                from: "posts",
                localField: "save_post",
                foreignField: "_id",
                as: "save_post"
            }
        };

        let blockuserProject = {
            $project: {
                "block_user.block_user": 0,
                "block_user.pin_post": 0,
                "block_user.save_post": 0,
                "block_user.profile_lock": 0,
                "block_user.createdAt": 0,
                "block_user.userId": 0,
                "block_user.updatedAt": 0
            }
        };

        const savePostData = await userProfileModel.aggregate([matchUser, userProject, categoryLookup, blockuserProject]);

        return {
            status: "success",
            data: savePostData
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// exports pin post===============================================
exports.pin_post_get = async (req) => {
    try {

        const userId = new ObjectId(req.userId);
        const matchUser = {
            $match: {
                userId
            }
        };

        let userProject = {
            $project: {
                "pin_post": 1,
                "_id": 0
            }
        };

        let categoryLookup = {
            $lookup: {
                from: "posts",
                localField: "pin_post",
                foreignField: "_id",
                as: "pin_post"
            }
        };

        let blockuserProject = {
            $project: {
                "block_user.block_user": 0,
                "block_user.pin_post": 0,
                "block_user.save_post": 0,
                "block_user.profile_lock": 0,
                "block_user.createdAt": 0,
                "block_user.userId": 0,
                "block_user.updatedAt": 0
            }
        };

        const pinPostData = await userProfileModel.aggregate([matchUser, userProject, categoryLookup, blockuserProject]);

        return {
            status: "success",
            data: pinPostData
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};

// view single profile===================================
exports.viewSingleProfile = async (req) => {
    try {

        const userid = req.userId;
        const {
            id
        } = req.params;

        const friend = [
            "655603ac58b45e675997c8ff",
            "6555a8b57fb2862ae6870ed9",
            "6555a8b57fb2862ae6870ed4",
            "6555a8b57fb2862ae6870ed1",
            "6555a8b57fb2862ae6870ed2",
            "6555a8b57fb2862ae6870ed0"
        ];

        const data = await userProfileModel.findOne({
            _id: id
        });

        const checkB = data.block_user.includes(userid);
        if (checkB) {
            return {
                status: "Fail",
                message: "you can't see this profile because You are  block."
            };
        };

        const checkF = friend.includes(userid);
        if (!checkF && data.profile_lock == true) {
            const profileObj = {
                userName: data.userName,
                userImage: data.userImage,
                userBannerImg: data.userBannerImg
            };

            return {
                status: "success",
                data: profileObj
            };
        };

        const Pdata = await userProfileModel.findOne({
            _id: id
        }).select({
            "userId": 0,
            "block_user": 0,
            "pin_post": 0,
            "createdAt": 0,
            "save_post": 0,
            "updatedAt": 0
        });

        return {
            status: "success",
            data: Pdata
        };

    } catch (err) {
        return {
            status: "Fail",
            message: "something went wrong.",
            error: err.message
        };
    }
};