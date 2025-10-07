const express = require("express");
const dotenv = require("dotenv");
const app=express();
const cors = require("cors");
const path = require("path");
const usersRoute = require("./routes/user.js");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const productRoute = require("./routes/product.js");
const paymentRoute = require("./routes/payments.js")

dotenv.config();


//middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("src/uploads")));
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: process.env.FRONT_URL, 
    credentials: true,
	methods:["POST","GET"],
}));


//routes
app.use("/api/users",usersRoute);
app.use("/api/products",productRoute);
app.use("/api/payments",paymentRoute);


const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);
		console.log("connected to mongodb");
	} catch (error) {
		throw error;
	}
};

mongoose.connection.on("disconnected",()=>{
	console.log("mongoDB disconnected");
});

app.get("/", (req, res) => {
  res.send("VastraVilas Backend is running.");
});

app.listen(process.env.PORT,async() => {
	await connect();
	console.log(`server started on port ${process.env.PORT}..`);
})
