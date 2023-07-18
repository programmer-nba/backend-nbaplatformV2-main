const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');

//STOP 1 - Check
module.exports.Check = async (req,res) => {
    try {
    const token = req.headers['token'];

    const decoded = jwt.verify(token,process.env.TOKEN_KEY);

    const userWallet = await CheckUserWallet(decoded._id);
        console.log(userWallet);

        if(userWallet < req.body.price || userWallet <=0){
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
    url:`${process.env.SHOP_API}/counter_service/wallet/verify`,
    data:data
}
await axios(request).then(response => {
    return res.status(200).send(response.data);
})
.catch(error=>{
    return res.status(403).send({status:false,message:error.message});
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

           const price = Number(req.body.price);
       
           const userWallet = await CheckUserWallet(decoded._id);
               console.log(userWallet);
       
               if( userWallet < price || userWallet<=0 ){
                   return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
               }else{
                   console.log(`${decoded._id} ต้องการคอนเฟิร์มทำรายการเติมบัตร`)
               }

               const percent_profit = 0.3 ; // SOT discount
               const percent_nba = 0.3;
               const customer_discount = 0;

             
   
        const cost = price - (price*percent_profit/100);
        const profit_nba = price*percent_nba/100;
        const profit_shop = 0;
        const charge = 5;
        const net_price = price + charge;

        const requestdata = {
        shop_id : decoded._id,
        payment_type : 'wallet',
        type: "เติม wallet",
        mobile : req.body.mobile,
        price : price,
        charge: 0,
        receive : net_price,
        profit_nba : profit_nba,
        profit_shop : profit_shop,
        cost : cost,
        employee : 'Platform-member',
        transid : req.body.transid,
        timestamp: `${new Date()}`
 
 
        }

    
    var axios = require('axios');
    const request = {
        method:'post',
        headers:{
            'auth-token':process.env.SHOP_API_TOKEN,
            'Content-Type': 'application/json'
        },
        url:`${process.env.SHOP_API}/counter_service/wallet/confirm`,
        data:requestdata
    }
    await axios(request).then(async (response) => {

        if(response.data.data.detail.error_code !=='E00'){
            return res.status(403).send({code:response.data.data.detail.error_code,data:response.data.data.detail});
        }else{

            const debitAmount = Number(response.data.data.price) + charge;

            const debitData = {
                mem_id:decoded._id,
                name:`service เติม wallet ${response.data.data.invoice}`,
                type:"ออก",
                amount:debitAmount,
                detail:`${JSON.stringify(response.data.data.detail)}`,
                timestamp: `${new Date()}`
    
            }
    
          await DebitWallet(token,debitData);
          

          //get user remainding wallet;

            return res.status(200).send({
                status:true,
                data:{
                    serviceid:response.data.data.detail.productid,
                    service_name:response.data.data.detail.productname,
                    price:response.data.data.detail.price,
                    charge:charge,
                    debit:net_price,
                    remainding_wallet:(userWallet - response.data.data.cost) 
                }});
        }
    })
    .catch(error=>{
        return res.status(403).send({code:error.code,data:error.message});
    });
    
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
            
    }
}
