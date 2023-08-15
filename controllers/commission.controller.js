const axios = require('axios');

module.exports.GetCommissionByTel = async (req, res) => {
    try {
        const tel = req.params.tel
        console.log("req.params.telreq.params.telreq.params.telreq.params.tel", req.params.tel)
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/commission/totalcommission/${tel}`,
        }
        await axios(request).then(async (response) => {
            console.log(response)
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}

module.exports.GetUnsummedCommissionsByTel = async (req, res) => {
    try {
        const tel = req.params.tel
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/commission/list/${tel}`,
        }
        await axios(request).then(async (response) => {
            console.log(response)
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}