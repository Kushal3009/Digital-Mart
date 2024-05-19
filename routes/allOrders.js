const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { Result } = require("express-validator");

router.get('/',(req,res)=>{
    const seller_email = req.session.email;
    db.query('select seller_id from seller where seller_email = ?',[seller_email],(err,reu)=>{
        if(err){
            console.log(err)
        }else{
            const seller_id = reu[0].seller_id

            db.query(`select p.product_image, p.product_name, o.quantity, b.buyer_address from orders o 
            join product p on o.product_id = p.product_id
            join buyer b on o.buyer_id = b.buyer_id where seller_id = ?;`,[seller_id],(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    res.render('allOrders',{orders:result})
                }
            })
        }
    })
    // res.render('allOrders') 
})

module.exports = router