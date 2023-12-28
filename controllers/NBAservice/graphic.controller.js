const {Member} = require("../../models/member.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");

module.exports.GetService = async (req, res) => {
  try {
    let token = req.headers["token"];
    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic`,
    };
    await axios(request).then(async (response) => {
      console.log(response.data);
      return res.status(200).send(response.data.data);
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send({code: error.code, data: error.message});
  }
};

module.exports.GetCategory = async (req, res) => {
  try {
    let token = req.headers["token"];
    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/category`,
    };
    await axios(request).then(async (response) => {
      console.log(response.data);
      return res.status(200).send(response.data.data);
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send({code: error.code, data: error.message});
  }
};

module.exports.order = async (req, res) => {
  try {
    const id = req.body.product_detail[0].packageid;
    const packageRequestData = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
        "Content-Type": "application/json",
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/price/byid/${id}`,
    };
    const packageResponse = await axios(packageRequestData);
    console.log(packageResponse.data.data);
    if (packageResponse) {
      // Check user wallet
      const token = req.headers["token"];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const user = await Member.findById(decoded._id);
      const price =
        packageResponse.data.data.price *
        Number(req.body.product_detail[0].quantity);
      if (price && user.wallet < price) {
        return res.status(403).send({message: "ยอดเงินในกระเป๋าไม่เพียงพอ"});
      } else {
        const newwallet = user.wallet - price;
        await Member.findByIdAndUpdate(user._id, {wallet: newwallet});
      }
      console.log(price);

      let data = {
        customer_contact: req.body.customer_contact,
        customer_name: req.body.customer_name ? req.body.customer_name : "",
        customer_tel: req.body.customer_tel ? req.body.customer_tel : "",
        customer_address: req.body.customer_address
          ? req.body.customer_address
          : "",
        customer_iden_id: req.body.customer_iden_id,
        customer_line: req.body.customer_line,
        shopid: req.user._id,
        shop_partner_type: "One Stop Service",
        branch_name: req.body.branch_name ? req.body.branch_name : "",
        branch_id: req.body.branch_id ? req.body.branch_id : "",
        product_detail: [
          {
            packageid: id,
            quantity: req.body.product_detail[0].quantity,
            width: req.body.product_detail[0].width,
            hight: req.body.product_detail[0].hight,
          },
        ],
        paymenttype: req.body.paymenttype,
        moneyreceive: req.body.moneyreceive,
      };

      const orderRequestConfig = {
        headers: {
          "auth-token": "Bearer " + process.env.SHOP_API_TOKEN,
          "Content-Type": "application/json",
        },
        url: `${process.env.SHOP_API}/artwork/product-graphic/order`,
        data: data,
      };
      const orderResponse = await axios.post(orderRequestConfig.url, data, {
        headers: {
          "auth-token": "Bearer " + process.env.SHOP_API_TOKEN,
          "Content-Type": "application/json",
        },
      });
      console.log(orderResponse.data);

      return res.status(200).send(orderResponse.data);
    } else {
      return res.status(403).send({message: "บางอย่างผิดพลาด"});
    }
  } catch (error) {
    console.error(error);
    return res.status(403).send({code: error.code, data: error.message});
  }
};
