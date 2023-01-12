const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const moment = require("moment");



const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());

// connecting mongodb database
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/budgettracker",
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
    console.log('mongodb database connected successfully!');
}).catch((err) => {
    console.log(err);
})
// Creating Transaction Schema
const transection = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,

    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});
const Transection = mongoose.model("Transection", transection);

// Creating User Schema For Register and Login
const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
 
}, { timestamps: true });
const User = mongoose.model("User", user);



// Creating transactions
app.post("/api/v1/transection", async (req, res) => {
    const transection = await Transection.create(req.body);
    res.status(200).json({
        success: true,
        transection
    })
})
//getting all transections
app.post("/api/v1/gettransection", async (req, res) => {
    try {
        const { category, byDate } = req.body;
        const transection = await Transection.find({
            ...(byDate !== 'default' && {
                date: {
                    $lte: moment().subtract(Number(byDate), 'd').toDate(),
                }
            }),
            ...(category !== 'all' && { category })
        });
        res.status(200).json({
            success: true,
            transection
        })
    } catch (error) {
        console.log(error);
    }

})
//update transections
app.put("/api/v1/updatetransection/:id", async (req, res) => {
    let transection = await Transection.findById(req.params.id);
    if (!transection) {
        return res.status(500).json({
            success: false,
            message: "Transaction Not Found!"
        })
    }
    transection = await Transection.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json({
        success: true,
        message: "Transaction Updated Successfully!"
    })
})
//delete transections
app.delete("/api/v1/deletetransection/:id", async (req, res) => {
    const transection = await Transection.findById(req.params.id);
    if (!transection) {
        return res.status(500).json({
            success: false,
            message: "Transaction Not Found!"
        })
    }
    await transection.remove();
    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully!"
    })
})

// Login user
app.post("/api/v1/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found!"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            error
        })
    }
})
// Register Routes
app.post("/api/v1/register", async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({
            success: true,
            newUser,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            error,
        })
    }
 })


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})