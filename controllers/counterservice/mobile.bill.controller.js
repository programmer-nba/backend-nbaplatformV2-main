const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');

//START 1 - check
module.exports.Check = async (req,res)=>{
    try {

        const token = req.headers['token'];

        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
    
        const userWallet = await CheckUserWallet(decoded._id);
            console.log(userWallet);
    
            if(userWallet < req.body.price){
                return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
            }
            
        var axios = require('axios');
        const dataRequest = {
            productid:req.body.productid,
            mobile: req.body.mobile
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
            },
            url:`${process.env.SHOP_API}/counter_service/mobile_bill/check`,
            data:dataRequest
        } 
        await axios(request).then(response => {
                    return res.status(200).send({message:'เช็คข้อมูลสำเร็จ',data:response.data});
                })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'Server error'});
    }
}

//STEP 2 - Recieved Transaction
module.exports.GetTransection = async (req,res) => {
    try {
    const token = req.headers['token'];

    const decoded = jwt.verify(token,process.env.TOKEN_KEY);

    const userWallet = await CheckUserWallet(decoded._id);
        console.log(userWallet);

        if(userWallet < req.body.price){
            return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
        }else{
            console.log(`${decoded._id} ต้องการทำรายการเติมเงินมือถือ`)
        }

    const data = {
        
        mobile : req.body.mobile,
        price: req.body.price,
        productid: req.body.productid

    }

var axios = require('axios');
const request = {
    method:'post',
    headers:{
        'auth-token':process.env.SHOP_API_TOKEN,
    },
    url:`${process.env.SHOP_API}/counter_service/mobile_topup/verify`,
    data:data
}
await axios(request).then(response => {
    return res.status(200).send(response.data);
})
.catch(error=>{
    return res.status(403).send(error.message);
});

} catch (error) {
    console.error(error);
    return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
        
}

}


//STEP 3 - Confirm
module.exports.Confirm = async (req,res) => {
    try {

        // check user money
        const token = req.headers['token'];

        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
    
        const userWallet = await CheckUserWallet(decoded._id);
            console.log(userWallet);
    
            if(userWallet < req.body.price){
                return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
            }else{
                console.log(`${decoded._id} ต้องการทำรายการเติมเงินมือถือ`)
            }


        const requestdata = {

            shop_id: decoded._id,
            payment_type : "wallet",
            type : "เติมเงินมือถือ",
            mobile : req.body.mobile,
            price : req.body.price,
            charge : req.body.charge,
            receive : (req.body.price + req.body.charge + req.body.profit_nba + req.body.profit_shop),
            transid: req.body.transid,
            profit_nba: (req.body.profit_nba + req.body.profit_shop),
            profit_shop: 0,
            cost: req.body.cost,
            employee : "Platform-member",
            timestamp : `${new Date()}`
 
        }

        console.log(requestdata);
    
    var axios = require('axios');
    const request = {
        method:'post',
        headers:{
            'auth-token':process.env.SHOP_API_TOKEN,
            'Content-Type': 'application/json'
        },
        url:`${process.env.SHOP_API}/counter_service/mobile_topup/confirm`,
        data:requestdata
    }
    await axios(request).then(async response => {
        //create wallet history
        let percent =3;
        if(response.data.data.productid ==="p00003" || response.data.data.productid === "p00016"){
            percent = 2;
        }
        const debitAmount = response.data.data.price - (response.data.data.price*(percent - 0.5)/100)
   
        const debitData = {
            mem_id:decoded._id,
            name:`service mobile topup ${response.data.invoice}`,
            type:"ออก",
            amount:debitAmount,
            detail:`${JSON.stringify(response.data.data.detail)}`,
            timestamp: `${new Date()}`

        }

      await DebitWallet(token,debitData).then(result=>{
        console.log('debite wallet result: ',result);
      })
       
        return res.status(200).send(response.data);
    })
    .catch(error=>{
        console.error(error);
        return res.status(403).send({code:error.code,data:error.message});
    });
    
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
            
    }
}
