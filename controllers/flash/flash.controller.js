const {default: axios} = require("axios");
const Qs = require("qs");
const {response} = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

exports.ping = async (req, res) => {
  try {
    const config = {
      method: "post",
      url: `${process.env.FLASH_URL}/open/v1/ping`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Language": "lo",
      },
    };
    await axios(config)
      .then((response) => {
        return res.status(200).send({status: true, result: response.data});
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.check = async (req, res) => {
  try {
    const day = new Date().getTime();
    const config = {
      method: "post",
      url: `${process.env.FLASH_URL}`,
      params: JSON.stringify({
        mchId: `${process.env.FLASH_MCHID}`,
        nonceStr: `${day}`,
        sign: `${process.env.FLASH_SECRET_KEY}`,
      }),
    };
    // console.log(config);
    const response = await axios(config);
    console.log(response);
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.address_core = async (req, res) => {
  try {
    const config = {
      method: "post",
      url: `${process.env.FLASH_URL}/gw/fda/open/standard/address_core/url/query`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      //   data: JSON.stringify({
      //     mchId: `${process.env.FLASH_MCHID}`,
      //     sign: `${process.env.FLASH_SECRET_KEY}`,
      //   }),
    };
    console.log(config);
    await axios(config)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
