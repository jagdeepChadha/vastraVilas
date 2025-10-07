const Product = require('../models/Product');
const path = require('path');

const getproducts = async (req, res) => {
    try {
      let { page, limit, gender, category, brand, minPrice, maxPrice, size, color, search } = req.query;
  
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const skip = (page - 1) * limit;
  
      let filter = [];
  
      if (search) {
        filter.push({
          $search: {
            index: "products",
            text: {
              query: search,
              path: {
                wildcard: "*",
              },
              fuzzy: { maxEdits: 2 },
            },
          },
        });
      }
  
      let matchStage = {};
      if (category) matchStage.category = category;
      if (brand) matchStage.brand = brand;
      if (size) matchStage.sizes = { $elemMatch: { size: size } };
      if (color) matchStage.color = color;
      if (minPrice || maxPrice) {
        matchStage.price = {};
        if (minPrice) matchStage.price.$gte = parseInt(minPrice);
        if (maxPrice) matchStage.price.$lte = parseInt(maxPrice);
      }
  
      let products = [];
      if (gender) {
        let primaryGender = gender;
        let secondaryGender = gender === "Male" ? "Female" : "Male";
  
        let totalPrimaryGenderProducts = await Product.countDocuments({ ...matchStage, gender: primaryGender });
  
        if ((page - 1) * limit < totalPrimaryGenderProducts) {
          products = await Product.aggregate([
            ...filter,
            { $match: { ...matchStage, gender: primaryGender } },
            {
              $lookup: {
                from: "productreviews",
                localField: "_id",
                foreignField: "product",
                as: "reviews",
              },
            },
            { $sort: { discount: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $addFields: {
                rating: { $avg: "$reviews.rating" },
              },
            },
          ]);
        }
  
        if (products.length < limit) {
          let remainingLimit = limit - products.length;
          let secondarySkip = Math.max(0, skip - totalPrimaryGenderProducts);
          let secondaryProducts = await Product.aggregate([
            ...filter,
            { $match: { ...matchStage, gender: secondaryGender } },
            {
              $lookup: {
                from: "productreviews",
                localField: "_id",
                foreignField: "product",
                as: "reviews",
              },
            },
            { $sort: { discount: -1 } },
            { $skip: secondarySkip },
            { $limit: remainingLimit },
            {
              $addFields: {
                rating: { $avg: "$reviews.rating" },
              },
            },
          ]);
          products.push(...secondaryProducts);
        }
      } else {
        products = await Product.aggregate([
          ...filter,
          { $match: matchStage },
          {
            $lookup: {
              from: "productreviews",
              localField: "_id",
              foreignField: "product",
              as: "reviews",
            },
          },
          { $sort: { discount: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              rating: { $avg: "$reviews.rating" },
            },
          },
        ]);
      }
  
      const totalProducts = await Product.countDocuments(matchStage);
  
      res.status(200).json({
        products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        totalProducts,
      });
    } catch (error) {
      console.error("Error in getproducts:", error.message);
      res.status(500).json({ error: error.message });
    }
  };


  const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id).populate({
            path: "reviews",
            select: "rating comment user",
            populate: { path: "user", select: "name" } 
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ error: error.message });
    }
};


const addproducts = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);

        const { name, brand, price, sizeType, sizes, color, gender, category, discount } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        const imagePath = path.join('uploads', req.file.filename);

        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
            if (!Array.isArray(parsedSizes)) {
                throw new Error("Sizes should be an array.");
            }
        } catch (err) {
            return res.status(400).json({ error: "Invalid sizes format. It should be a valid JSON array." });
        }

        const newProduct = new Product({
            name,
            brand,
            price,
            sizeType,
            sizes: parsedSizes,
            color,
            gender,
            category,
            discount,
            image: imagePath
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
        console.log("Product Added Successfully", newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateproduct = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.body.sizes) {
            try {
                updateData.sizes = JSON.parse(req.body.sizes);
                if (!Array.isArray(updateData.sizes)) {
                    throw new Error("Sizes should be an array.");
                }
            } catch (err) {
                return res.status(400).json({ error: "Invalid sizes format. It should be a valid JSON array." });
            }
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteproduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const filterproducts = async (req, res) => {
    try {
        const { category, color, size } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (color) filter.color = color;
        if (size) filter.sizes = size;

        const categories = await Product.distinct("category");
        const sizes = await Product.distinct("sizes", filter);
        const colors = await Product.distinct("color", filter);

        res.json({ categories, sizes, colors });
    } catch (error) {
        console.error("Error fetching filters:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        res.json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};


module.exports = {
    getproducts,
    addproducts,
    updateproduct,
    deleteproduct,
    filterproducts,
    getSingleProduct,
    getCategories
};
