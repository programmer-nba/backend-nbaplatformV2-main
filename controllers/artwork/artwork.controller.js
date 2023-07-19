const mongoose = require('mongoose');
//get Artwork category

module.exports.GetCategory = async (req,res) => {
    try {

        var axios = require('axios');
        const request = {
            method:'get',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
            },
            url:`${process.env.SHOP_API}/artwork/product-graphic/category`,
  
        }
        
        
        await axios(request).then(response => {
            return res.status(200).send(response.data);
        })
        .catch(error=>{
            return res.status(403).send(error.message);
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}

//get Product graphic pricelist by category id

module.exports.getProductGraphicByCategoryId = async (req,res) => {
    try {
        const id = req.params.id;
        if(!mongoose.isValidObjectId(id)){
            return res.status(403).send({message:"Invalid id"});
        }

        //send api get product price list

        var axios = require('axios');
        const request = {
            method:'get',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
            },
            url:`${process.env.SHOP_API}/artwork/product-graphic/product/category/${id}`,
  
        }
        
        
        await axios(request).then(response => {
            return res.status(200).send(response.data);
        })
        .catch(error=>{
            return res.status(403).send({message:error.message});
        });

        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}