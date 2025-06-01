require('dotenv').config();
const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    requireTLS:true,
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD
        
    }
})
const sendMail=async(email,subject,content)=>{
    try{
      var mailoptions={

        from:process.env.SMTP_MAIL,
        to:email,
        subject:subject,
        html:content

       } ;
       transporter.sendMail(mailoptions,(err,info)=>{
        if(err){
            console.log(err)
        }
        console.log('mail sent',info.messageId);
       })

    }
    catch(err){
        console.log(err.message)

    }

}
module.exports={
    sendMail
}