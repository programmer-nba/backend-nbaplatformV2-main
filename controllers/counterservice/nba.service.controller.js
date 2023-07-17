const fs = require("fs");
const {google} = require("googleapis");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const CheckUserWallet = require("../../lib/checkwallet");
const {DebitWallet} = require("../../lib/transection/debit.wallet")

//GOOGLE
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

module.exports.CreatePreOrder = async (req,res) => {
    try {

         //UPLOAD TO GOOGLE DRIVE
         const token = req.headers['token'];
         const decoded = jwt.verify(token,process.env.TOKEN_KEY)
         const userWallet = CheckUserWallet(decoded._id);

         if(userWallet<req.body.price){
            return res.status(403).send({message:"มีเงินไม่เพียงพอ"});
         }

    let upload = multer({storage: storage}).fields([
        {name: "ref_image", maxCount: 10},
      ]);
      upload(req, res, async function (err) {

        if (req.files.ref_image) {
          console.log("มีรูปเข้ามา");
         const image = await uploadImage(req, res);

            //send api
            const axios = require('axios');

            const cost_nba =10;
            const cost_shop = 0;
            const charge = 20;

        const requestData={
            productid : req.body.productid,
            productname :req.body.productname,
            shop_id: decoded._id,
            payment_type:'wallet',
            detail:{
                note: req.body.note,
                ref1: req.body.ref1,
                ref2 : req.body.ref2,
            },
            employee:'NBA Platform',
            charge: charge,
            cost_nba:cost_nba,
            cost_shop:cost_shop,
            price : req.body.price, 
            receive:(Number(req.body.price) + cost_nba + charge),
            image: image.id, //image on googledive
            timestamp:new Date()
        }
        const config = {
            method:"post",
            headers:{
                "auth-token":process.env.SHOP_API_TOKEN,
                "Content-Type": "application/json"
            },
            url:`${process.env.SHOP_API}/counter_service/nba`,
            data:JSON.stringify(requestData)
        }
        console.log('request data',requestData);

        await axios(config).then(async(response)=>{

            const debitAmount = Number(response.data.data.detail.price) + Number(response.data.data.detail.charge);
            const debitData = {
                mem_id:decoded._id,
                name:`service nba ${response.data.data.invoice}`,
                type:"ออก",
                amount:debitAmount,
                detail:`${JSON.stringify(response.data.data.detail)}`,
                timestamp: `${new Date()}`
    
            }

                await DebitWallet(token,debitData)
                return res.status(200).send({status:true,message:'ส่งรายกาารฝากจ่ายสำเร็จ',data:response.data.data.detail});
        })
        .catch(err =>{
            console.error(err);
            return res.status(404).send({message:'ส่งรายการฝากจ่ายไม่สำเร็จ',data:err.message});
        })

        } else {
          return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
        }
      });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'Internal Server Error'});
    }
}



//image upload
async function uploadImage(req, res) {
    try {
      const filePathImg = req.files.ref_image[0].path;
    
      //UPLOAD รูป
      let fileMetaDataImg = {
        name: req.files.ref_image[0].originalname,
        parents: [`${process.env.GOOGLE_DRIVE_NBA_SERVICE_REF}`],
      };
  
      let mediaCus = {
        body: fs.createReadStream(filePathImg),
      };
  
      const responseImg = await drive.files.create({
        resource: fileMetaDataImg,
        media: mediaCus,
      });

     return{ url:generatePublicUrl(responseImg.data.id),id:responseImg.data.id};
     

    } catch (err) {
      console.log(err);
      return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
    }
  }
  
  async function generatePublicUrl(res) {
    try {
      const fileId = res;
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      const result = await drive.files.get({
        fileId: fileId,
        fields: "webViewLink, webContentLink",
      });

      return result;

    } catch (error) {
      console.log(error.message);
    }
  }
  
  