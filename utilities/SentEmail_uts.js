const nodemailer = require("nodemailer");

exports.sendEmail = async(email,name,url)=>{
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
            subject: "Varification Your Account ✔", // Subject line
            html: ` <section style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-transform: capitalize; "> <div class="top"> <h1 style="color: red;">Activate Your Account.</h1> </div> <div style="border: 1px solid rgba(128, 128, 128, 0.403); padding: 0px 20px 20px 20px;"> <h3>hello ${name} ---</h3> <h3 style="padding-bottom: 10px;">you recently create a account on <span style="color: blue;">SOCIETY.IO</span> > to complete your registration,please confirm you account.</h3> <a style="background-color: rgba(42, 63, 56, 0.848); text-decoration: none; color: #fbf2f2; font-weight: 400; padding: 10px 15px; border-radius: 7px; cursor: pointer;" href=${url}>Comfirm Your Account</a> </div> </section>`, // html body
        });

    } catch (err) {
        console.log('something went wrong.');
    }
};