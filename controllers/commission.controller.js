const axios = require('axios');
const {Commission} = require("../models/commission.model");

module.exports.GetCommissionByTel = async (req, res) => {
    try {
        const tel = req.user.tel
        console.log('เบอร์โทรศัพท์ : ', tel);
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/commission/totalcommission`,
            data: { tel: tel }
        }
        await axios(request).then(async (response) => {
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}

module.exports.GetUnsummedCommissionsByTel = async (req, res) => {
    try {
        const token = req.headers.token;
        console.log(token)
        const tel = req.user.tel
        const request = {
            method: 'get',
            headers: {
                'auth-token': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/commission/listcommission`,
            // data: { tel: tel }
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

module.exports.GetAllSaleByTel = async (req, res) => {
    try {
        const tel = req.user.tel
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/commission/totalallsalebytel`,
            data: { tel: tel }
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


module.exports.GetCommissionByOrderId = async (req, res) => {
    try {
        const id = req.params.id
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/commission/listbyorderid/${id}`,
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

module.exports.GetAll = async (req, res) => {
    try {
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/commission/list`,
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

module.exports.GetHappyPointBytel = async (req, res) => {
    try {
        const tel = req.user.tel

        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/commission/happypoint`,
            data: { tel: tel }
        }
        await axios(request).then(async (response) => {
            console.log(response.data)
            return res.status(200).send(response.data)
        })
    } catch (error) {
        console.error(error.message);
        return res.status(403).send({ code: error.code, data: error.message });
    };
}
