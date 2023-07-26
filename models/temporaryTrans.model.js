const mongoose = require('mongoose');
const Joi = require('joi');

const temporaryTrans = new mongoose.Schema({
    transid: {type: String, required: true},
    mobile: {type: String, required: true},
    price: {type: Number, required: true}
})

const TempTrans = mongoose.model('temporaryTrans', temporaryTrans)

const validate  = (data) => {
    const schema = Joi.object({
        transid: Joi.string().required().label('ไม่พบ transid'),
        mobile: Joi.string().required().label('ไม่พบเบอร์โทร'),
        price: Joi.string().required().label('ไม่พบราคา'),
    })
    return schema.validate(data);
}

module.exports = { TempTrans, validate }

