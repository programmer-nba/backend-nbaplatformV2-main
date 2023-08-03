module.exports.GetService = async (req, res) => {
    try {
        var axios = require('axios');
        const request = {
            method:'get',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/facebookservice/list`,
        }
        await axios(request).then(async (response) => {
            console.log(response)
            return res.status(200).send( response.data )
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({code:error.code,data:error.message});
    };
}

module.exports.order = async (req, res) => {
    try {
        const axios = require('axios');
let data = JSON.stringify({
  "packageid": req.body.packageid,
  "quantity": req.body.quantity
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: `${process.env.SHOP_API}/facebookservice/order`,
  headers: { 
    'auth-token':process.env.SHOP_API_TOKEN,
    'Content-Type': 'application/json'
  },
  data : data
};

await axios.request(config)
.then((response) => {
  return res.status(200).send(response.data)
}) 
.catch((error) => {
  console.log(error);
  return res.status(403).send(error)
});

    } catch (error) {
        console.error(error);
        return res.status(403).send({code:error.code,data:error.message});
    };
}