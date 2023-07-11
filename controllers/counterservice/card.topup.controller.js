const jwt = require('jsonwebtoken');

//STOP 1 - Check
module.exports.Check = async (req,res) => {
    try {

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
    url:`${process.env.SHOP_API}/counter_service/card_topup/verify`,
    data:data
}

console.log(request);

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

        const token = req.headers['token'];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const requestdata = {
            shop_id : decoded._id,
        payment_type : 'wallet',
        type: "บัตรเติมเงิน",
        mobile : req.body.mobile,
        price : req.body.price,
        charge: req.body.charge,
        receive : (req.body.price + req.body.charge + req.body.profit_nba + req.body.profit_shop),
        profit_nba : req.body.profit_nba,
        profit_shop : req.body.profit_shop,
        cost : req.body.cost,
        employee : 'nba partner',
        transid : req.body.transid,
        timestamp: `${new Date()}`
 
 
        }

        console.log(requestdata);
    
    var axios = require('axios');
    const request = {
        method:'post',
        headers:{
            'auth-token':process.env.SHOP_API_TOKEN,
            'Content-Type': 'application/json'
        },
        url:`${process.env.SHOP_API}/counter_service/card_topup/confirm`,
        data:requestdata
    }
    await axios(request).then(response => {
        return res.status(200).send(response.data);
    })
    .catch(error=>{
        return res.status(403).send({code:error.code,data:error.message});
    });
    
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
            
    }
}
