const axios = require('axios');

module.exports.Exchange = async (req, res) => {
    try {
        const request = {
            method: 'post',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
            },
            url: `${process.env.SHOP_API}/exchangepoint/exchange`,
            data:{tel:req.user.tel}
        }
        await axios(request).then(async (response) => {
            console.log(response.data)
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}