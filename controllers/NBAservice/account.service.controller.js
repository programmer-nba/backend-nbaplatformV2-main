const { Member } = require("../../models/member.model");
const jwt = require('jsonwebtoken')
const axios = require('axios');

module.exports.GetService = async (req, res) => {
    try {
        var axios = require('axios');
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/accountservice/category/list`,
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

module.exports.GetServiceByCateId = async (req, res) => {
    const id = req.params.id
    try {
        var axios = require('axios');
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/accountservice/package/listbycate/${id}`,
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

module.exports.order = async (req, res) => {
    try {
        const id = req.body.packageid;
        let data = {
            customer_name: req.body.customer_name?req.body.customer_name:"",
            customer_tel: req.body.customer_tel?req.body.customer_tel:"",
            customer_address: req.body.customer_address?req.body.customer_address:"",
            shopid: req.user._id,
            packageid: req.body.packageid,
            quantity: req.body.quantity
        };

        const packageRequestData = {
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/accountservice/package/list/${id}`,
        };
        const packageResponse = await axios(packageRequestData);
        console.log(packageResponse.data);
        if (packageResponse) {
            // Check user wallet
            const token = req.headers['token'];
            try {
                const decoded = jwt.verify(token, process.env.TOKEN_KEY);
                const user = await Member.findById(decoded._id);
                const price = packageResponse.data.data.price * Number(req.body.quantity)
                if (price && user.wallet < price) {
                    return res.status(403).send({ message: 'ยอดเงินในกระเป๋าไม่เพียงพอ' })
                } else {
                    const newwallet = user.wallet - price
                    await Member.findByIdAndUpdate(user._id, { wallet: newwallet })
                }
            } catch (err) {
                return res.status(403).send({ message: err });
            }
        } else {
            return res.status(403).send({ message: 'บางอย่างผิดพลาด' })
        }

        const orderRequestConfig = {
            headers: {
                'auth-token': 'Bearer ' + process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url: `${process.env.SHOP_API}/accountservice/order`,
            data: data
        };
        const orderResponse = await axios.post(orderRequestConfig.url, data, {
            headers: {
                'auth-token': 'Bearer ' + process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        console.log(orderResponse.data);

        return res.status(200).send(orderResponse.data);
    } catch (error) {
        console.error(error);
        return res.status(403).send({ code: error.code, data: error.message });
    }
};