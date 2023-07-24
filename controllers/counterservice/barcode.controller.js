const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');

const { DebitWallet} = require('../../lib/transection/debit.wallet');

//STEP 0- get Barcode service
module.exports.GetBarcodeService = async (req,res) => {
    try {

        const axios = require('axios');
        const config = {
            method: 'GET',
            url:`${process.env.SHOP_API}/api/cs/barcode-service`,
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN
            }
        }

        await axios(config).then(result=>{
            return res.status(200).send({message:"ดึงข้อมูล barcode-service สำเร็จ",data:result.data});
        })
        .catch(error=>{
            return res.status(403).send({message:"ดึงข้อมูลไม่สำเร็จ",data:error.message});
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
    
}

//STEP 1 - Check
module.exports.Check = async (req,res) => {
    try {
        const axios = require('axios');
        const requestdata = {
            mobile:req.body.mobile,
            barcode:req.body.barcode
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/check`,
            data:requestdata
        }

        await axios(request).then(response => {
            return res.status(200).send(response.data);
        })
        .catch(error => {
            return res.status(400).send(error.message);
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}

//STEP 2 - Verification
module.exports.Verify = async (req,res) => {
    try {

        const token = req.headers['token'];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const userWallet = await CheckUserWallet(decoded._id);

        // if(userWallet < req.body.price){
        //     return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
        // }

        const axios = require('axios');
        const requestdata = {
            productid : req.body.productid,
            mobile : req.body.mobile,
            price : req.body.price,
            data1 :req.body.data1,
            data2 :req.body.data2,
            data3 :req.body.data3,
            data4 :req.body.data4,
            data5 :req.body.data5
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/verify`,
            data:requestdata
        }

        await axios(request).then(response => {

            const price = Number(req.body.price);

            if(userWallet < price){
                return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
            }else{

                return res.status(200).send(response.data);
            }
        })
        .catch(error => {
            return res.status(400).send(error.message);
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}

module.exports.Confirm = async (req,res) => {
    try {

        const token = req.headers['token'];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const userWallet = await CheckUserWallet(decoded._id);

        const price = Number(req.body.price);

        if(userWallet < price){
            return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
        }

        const axios = require('axios');

        const debitValue = price + req.body.charge
        const requestdata = {
            
                shop_id : decoded._id,
                mobile : req.body.mobile,
                price : req.body.price,
                charge: req.body.charge,
                receive:debitValue,
                payment_type : 'wallet',
                transid: req.body.transid,
                cost_nba: req.body.cost_nba,
                cost_shop: req.body.cost_shop,
                employee : 'Platform-member',
                status : [
                    {
                        name : "ทำรายการ",
                        timestamp : new Date()
                    }
                ],
                timestamp : new Date()
            
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/confirm`,
            data:requestdata
        }

        await axios(request).then(async (response) => {

            if(response){

                console.log(response.data.data)

                const NbaCharge = 5; // charge 5 บาท
                const charge =  Number(response.data.data.detail.charge) + Number(response.data.data.detail.charge2) + NbaCharge
                const debitAmount = charge + Number(response.data.data.detail.price);
    
                const debitData = {
                    mem_id:decoded._id,
                    name:`service barcode ${response.data.data.invoice}`,
                    type:"ออก",
                    amount:debitAmount,
                    detail:`${JSON.stringify(response.data.data)}`,
                    timestamp: `${new Date()}`
        
                }
                
                await DebitWallet(token,debitData)
                
                return res.status(200).send({
                    status:true,
                    data:{
                        
                        serviceid:response.data.data.detail.productid,
                        service_name:response.data.data.detail.productname,
                        price:Number(response.data.data.detail.price),
                        charge:charge,
                        total:charge+Number(response.data.data.detail.price),
                        remainding_wallet : userWallet - debitAmount
                    }
                });
            }
        })
        .catch(error => {
            return res.status(400).send(error.message);
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}