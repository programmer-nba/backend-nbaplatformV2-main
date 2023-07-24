const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');

//STEP 0- get Mobile topup service
module.exports.GetMobileTopup = async (req,res) => {
    
}

//STOP 1 - Check
module.exports.Check = async (req,res) => {
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


//STEP 2 - Confirm
module.exports.Confirm = async (req,res) => {
    try {

        // check user money
        const token = req.headers['token'];

        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
    
        const userWallet = await CheckUserWallet(decoded._id);
            console.log(userWallet);
            const price = Number(req.body.price);
            if(userWallet < price){
                return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
            }else{
                console.log(`${decoded._id} ต้องการคอนเฟิร์มทำรายการเติมเงินมือถือ`)
            }

            //กำไร NBA 0.5 % ของราคาขาย
            const profit_nba = price * 0.5 / 100;

            const discount = {
                "p00001":2.5,
                "p00002":2.5,
                "p00003":1.5
            }
            const cost = price - (price * 2.5 / 100);

        const requestdata = {

            shop_id: decoded._id,
            payment_type : "wallet",
            type : "เติมเงินมือถือ",
            mobile : req.body.mobile,
            price : price,
            charge : 0,
            receive : cost,
            transid: req.body.transid,
            profit_nba: profit_nba,
            profit_shop: 0,
            cost: cost,
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
        console.log('response data',response.data);
        console.log('response detail',response.data.data.detail);
        //create wallet history
        if(response.data.data.detail.error_code !=="E00"){
            return res.status(403).send({status:false,code:response.data.data.error_code,data:response.data.data});
        }
        let percent =3;
        if(response.data.data.detail.productid ==="p00003" || response.data.data.detail.productid === "p00016"){
            percent = 2;
        }
        const debitAmount = response.data.data.detail.price - (response.data.data.detail.price*(percent-0.5)/100)
   
        const debitData = {
            mem_id:decoded._id,
            name:`service mobile topup ${response.data.data.invoice}`,
            type:"ออก",
            amount:debitAmount,
            detail:`${JSON.stringify(response.data.data.detail)}`,
            timestamp: `${new Date()}`

        }

      
      await DebitWallet(token,debitData);
            
            return res.status(200).send({
                status:true,
                data:{
                    serviceid:response.data.data.detail.productid,
                    service_name:response.data.data.detail.productname,
                    price:response.data.data.detail.price,
                    discount:response.data.data.detail.price*2.5/100,
                    debit:response.data.data.cost,
                    remainding_wallet:(userWallet - response.data.data.cost)               
                }})
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
