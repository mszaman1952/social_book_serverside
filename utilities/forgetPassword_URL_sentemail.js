const nodemailer = require("nodemailer");

exports.forgetPassword_URL_sentemail = async(email,name,url)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: "lionwild420@gmail.com",
              pass: "ackrjetpdpuwjpcm"
            }
          });

        // send mail with defined transport object
        await transporter.sendMail({
            from: `SOCIETY.IO 👻 <${process.env.EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: "Forget Your Password. ✔", // Subject line
            html: ` <section style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-transform: capitalize; "> <div class="top"> <h1 style="color: red;">Forget Your Account password.</h1> </div> <div style="border: 1px solid rgba(128, 128, 128, 0.403); padding: 0px 20px 20px 20px;"> <h3>hello ${name} ---</h3> <a style="background-color: rgba(42, 63, 56, 0.848); text-decoration: none; color: #fbf2f2; font-weight: 400; padding: 10px 15px; border-radius: 7px; cursor: pointer;" href=${url}>Comfirm Your Email</a> </div> </section>`, // html body
        });

    } catch (err) {
        console.log('something went wrong.');
    }
};