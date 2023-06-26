const {Member} = require("../models/member.model");
const { LoginHistory } = require('../models/login.history.model');
const {TokenList} = require('../models/token.list.model')
const Joi = require("joi");
const bcrypt = require("bcrypt");
const token_decode = require("../lib/token_decode");

const fs = require("fs");
const {google} = require("googleapis");
const multer = require("multer");
const {linenotify} = require("../lib/line.notify");

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
    console.log(file);
    cb(null, file.fieldname + "-" + Date.now());
  },
});

exports.edit = async (req, res) => {
  try {
    console.log(req.body);
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.change_password = async (req, res) => {
  try {
    const vali = (data) => {
      const schema = Joi.object({
        password: Joi.string().required().label("ไม่พบรหัสผ่าน"),
      });
      return schema.validate(data);
    };
    const {error} = vali(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }
    const decode = token_decode(req.headers["token"]);
    const encrytedPassword = await bcrypt.hash(req.body.password, 10);
    const member = await Member.findByIdAndUpdate(decode._id, {
      password: encrytedPassword,
    });
    if (member) {
      return res
        .status(200)
        .send({status: true, message: "เปลี่ยนรหัสผ่านสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "เปลี่ยนรหัสผ่านไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.verify_iden = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "iden_image", maxCount: 10},
    ]);
    upload(req, res, async function (err) {
      console.log(req.body.number);
      if (req.files.iden_image) {
        console.log("มีรูปเข้ามา");
        await uploadImageIden(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.verify_bank = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "bank_image", maxCount: 10},
    ]);
    upload(req, res, async function (err) {
      if (req.files.bank_image) {
        console.log("มีรูปเข้ามา");
        await uploadImageBank(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

//ประวัติการเข้าสู่ระบบ
exports.login_history = async(req, res)=>{
  try{
    const decode = token_decode(req.headers['token']);
    const login_history = await LoginHistory.find({mem_id : decode._id});
    if(login_history){
      return res.status(200).send({status: true, data: login_history.reverse()});
    }else{
      return res.status(400).send({status: false, message: 'ดึงรายการไม่สำเร็จ'})
    }
  }catch(err){
    console.log(err);
    return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
  }
}

exports.online_device = async(req,res)=>{
  try{
    const decode = token_decode(req.headers['token']);
    const token_list = await TokenList.find({mem_id:decode._id});
    if(token_list){
      return res.status(200).send({status: true, data: token_list.reverse()})
    }else{
      return res.status(400).send({status: false, message: 'ดึงข้อมูลไม่สำเร็จ'})
    }
  }catch(err){
    return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
  }
}

//ลบออกจากอุปกรณ์
exports.delete_device = async(req,res)=>{
  console.log(req.params);
  try{
    const id = req.params.id;
    const device = await TokenList.findByIdAndDelete(id);
    if(device){
      return res.status(200).send({status:true, message: 'ลบสำเร็จ'})
    }else{
      return res.status(400).send({status: false, message: 'ลบข้อมูลไม่สำเร็จ'})
    }
  }catch(err){
    console.log(err);
    return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
  }
}

async function uploadImageIden(req, res) {
  try {
    const filePathImg = req.files.iden_image[0].path;
    const decode = token_decode(req.headers["token"]);
    const member = await Member.findById(decode._id);
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ"});
    }
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.iden_image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_IDEN}`],
    };

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });
    generatePublicUrl(responseImg.data.id);
    let data = {
      ...member.iden,
      number: req.body.number,
      image: responseImg.data.id,
      remark: "อยู่ระหว่างการตรวจสอบ",
      status: false,
    };
    const res_update = await Member.findByIdAndUpdate(decode._id, {iden: data});
    if (res_update) {
      //แจ้งเตือนไลน์
      const message = `
*ยืนยันบัตรประชาชน*
ชื่อ : ${member.name}
เบอร์โทร : ${member.tel}

*กรุณาตรวจสอบให้กับผู้ใช้งาน*
        `;
      await linenotify(message);
      res.status(200).send({
        message: "ส่งข้อมูลเรียบร้อย",
        status: true,
      });
    } else {
      res.status(404).send({
        message: `ไม่สามารถสร้างได้`,
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
}

async function uploadImageBank(req, res) {
  try {
    const filePathImg = req.files.bank_image[0].path;
    const decode = token_decode(req.headers["token"]);
    const member = await Member.findById(decode._id);
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ"});
    }
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.bank_image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_BANK}`],
    };

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });
    generatePublicUrl(responseImg.data.id);
    let data = {
      ...member.bank,
      name: req.body.name,
      number: req.body.number,
      image: responseImg.data.id,
      remark: "อยู่ระหว่างการตรวจสอบ",
      status: false,
    };
    const res_update = await Member.findByIdAndUpdate(decode._id, {bank: data});
    if (res_update) {
      //แจ้งเตือนไลน์
      const message = `
*ยืนยันบัญชีธนาคาร*
ชื่อ : ${member.name}
เบอร์โทร : ${member.tel}

*กรุณาตรวจสอบให้กับผู้ใช้งาน*
        `;
      await linenotify(message);

      res.status(200).send({
        message: "ส่งข้อมูลเรียบร้อย",
        status: true,
      });
    } else {
      res.status(404).send({
        message: `ไม่สามารถสร้างได้`,
        status: false,
      });
    }
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
  } catch (error) {
    console.log(error.message);
  }
}
