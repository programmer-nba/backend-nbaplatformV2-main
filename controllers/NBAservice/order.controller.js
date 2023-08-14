const axios = require('axios');

module.exports.GetAll = async (req, res) => {
    try {
        const id = req.params.id
        const request = {
            method: 'get',
            headers: {
                'auth-token': process.env.SHOP_API_TOKEN
            },
            url: `${process.env.SHOP_API}/orderservice/list/${id}`,
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