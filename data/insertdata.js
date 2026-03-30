const mongoose = require("mongoose");
const Product = require("../models/product");
const connectDB= require("../config/db");
const product = require("../models/product");


connectDB();
async function insertMultipleProduct(){
    try {

        const products=[
            {
                productname:'Coca',
                qty:100,
                price:0.50,
                discription:"Test product Coca",

            },
            {
                productname:'Kingkong',
                qty:90,
                price:0.60,
                discription:"Test product kingkong",

            },
            {
                productname:'Sting',
                qty:70,
                price:0.70,
                discription:"Test product Sting",

            },
        ];
        const result = await product.insertMany(products);
        console.log("Insert products",result);
    } catch (error) {
        console.error("Insert Data failed",error);
    }
}
module.exports = insertMultipleProduct;