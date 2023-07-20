const mongoose = require("mongoose");
const CheckUserWallet = require("../../lib/checkwallet");
const {DebitWallet} = require("../../lib/transection/debit.wallet");

//get Artwork category

module.exports.GetCategory = async (req, res) => {
  try {
    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/category`,
    };

    await axios(request)
      .then((response) => {
        return res.status(200).send(response.data);
      })
      .catch((error) => {
        return res.status(403).send(error.message);
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

//get Product graphic pricelist by category id

module.exports.getProductGraphicByCategoryId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(403).send({message: "Invalid id"});
    }

    //send api get product price list

    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/product/category/${id}`,
    };

    await axios(request)
      .then((response) => {
        return res.status(200).send(response.data);
      })
      .catch((error) => {
        return res.status(403).send({message: error.message});
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

//create Preorder

module.exports.CreatePreorder = async (req, res) => {
  try {
    console.log("user", req.user);

    console.log({product: req.body.product_price_id, amount: req.body.amount});

    const priceId = req.body.product_price_id;
    const amount = req.body.amount;

    if (!mongoose.isValidObjectId(priceId)) {
      return res.status(403).send({message: "Invalid price id"});
    }

    //send api get product price list

    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/price/byid/${priceId}`,
    };

    await axios(request)
      .then(async (response) => {
        if (response) {
          const userWallet = await CheckUserWallet(req.user._id);

          const price = Number(response.data.data.price);

          if (userWallet < price || userWallet <= 0) {
            return res.status(403).send({message: "มีเงินไม่เพียงพอ"});
          }

          const total = response.data.data.price * amount;

          const requestData = {
            shop_id: req.user._id, //id ร้านค้า
            partner_tel: req.user.tel, //'plateform member telephone',
            artwork_type: req.body.artwork_type, //artwork type name string
            cus_name: req.body.cus_name, //plateform member name
            cus_tel: req.body.cus_tel, //plateform member telephone
            cus_address: req.body.cus_address, //platform member address
            payment_type: "wallet", //วิธีการชำระเงิน
            total: total, //ยอดรวมสุทธิ number,
            receive: total, //ยอดเงินที่รับมา
            discount: 0, //ส่วนลด
            order_detail: [{...response.data.data, amount: amount}], //รายละเอียดการสั่งซื้อ
            status: [
              {
                name: "รอตรวจสอบ",
                timestapme: new Date(),
              },
            ], //status
            courier_name: "", //ชื่อชนส่ง
            tracking_code: "", //หมายเลขที่ติดตามการส่งสินค้า
            timestamp: new Date(), //new Date()
            employee: req.user.name,
            employee_nba: "", //ชื่อพนักงานที่รับงานฝั่ง nba
            remark: "", //รายละเอียดเพิ่มเติม
          };

          console.log(requestData);

          //send create preorder to shop
          const preorderConfig = {
            method: "post",
            headers: {
              "auth-token": process.env.SHOP_API_TOKEN,
              "Content-Type": "application/json",
            },
            url: `${process.env.SHOP_API}/artwork/create-preorder`,
            data: requestData,
          };

          axios(preorderConfig)
            .then(async (result) => {
              if (result) {
                //debit user wallet
                const debitData = {
                  mem_id: req.user._id,
                  name: `service artwork ${result.data.data.invoice}`,
                  type: "ออก",
                  amount: price,
                  detail: `${JSON.stringify(response.data.data.order_detail)}`,
                  timestamp: `${new Date()}`,
                };

                const token = req.headers["token"];

                await DebitWallet(token, debitData);
                return res
                  .status(200)
                  .send({message: "ส่ง preorder สำเร็จ", data: result.data});
              }
            })
            .catch((error) => {
              return res
                .status(500)
                .send({message: "ส่ง preorder ไม่สำเร็จ", data: error});
            });
        } else {
          return res.status(403).send({message: "network error"});
        }
      })
      .catch((error) => {
        return res.status(403).send({message: error.message});
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};
