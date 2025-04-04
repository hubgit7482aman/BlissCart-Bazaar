import slugify from 'slugify';
import productModel from '../models/productModel.js'
import fs from 'fs'


export const createProductController=async(req,res)=>{
    try{
        const {name,slug,description,price,category,quantity,shipping}=req.fields;
        const {photo}=req.files;
        //validation
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is Required'})
            case !description:
                return res.status(500).send({error:'description is Required'})
            case !price:
                return res.status(500).send({error:'price is Required'})
            case !category:
                return res.status(500).send({error:'category is Required'})
            case !quantity:
                return res.status(500).send({error:'quantity is Required'})
            case photo && photo.size>1000000:
                return res.status(500).send({error:'image  is Required and should be less than 1MB'});
        }

        const products=new productModel({...req.fields,slug:slugify(name)})
        if(photo){
            products.photo.data=fs.readFileSync(photo.path)
            products.photo.contentType=photo.type

        }
        console.log("Product before save:", products);
        await products.save();
        console.log("Product saved successfully:", products);
        
        res.status(201).send({
            success:true,
            message:"Product Created Successfully",
            products
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in creating product"
        })
    }
};

// get all products
export const getProductController=async(req,res)=>{
    try{
        const products= await productModel.find({}).populate('category').select("-photo").limit(12).sort({createdAt:-1});
        res.status(200).send({
            success: true,
            countTotal: products.length,
            message:"All Products",
            products,

        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in getting Products",
            error:error.message
        })
    }
};

// single product
export const getSingleProductController=async(req,res)=>{
    try{
        const product=await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category");
        res.status(200).send({
            success:true,
            message:"Single Product Fetched",
            product,
        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error while getting single product",
            error
        })
    }
};

// get photo

export const productPhotoController=async(req,res)=>{
    try{
        const product=await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
            res.set('Content-type',product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error while getting photo",
            error
        })
    }
};

// delete product
export const deleteProductController=async(req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success:true,
            message:"Product Deleted successfully",
        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error while deleting the product",
            error
        })
    }
};