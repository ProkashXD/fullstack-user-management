const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String, 
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true,
        min: [1, "Age must be at least 1"],
        max: [120, "Age cannot exceed 120"],
        validate: {
            validator: Number.isInteger,
            message: "Age must be a whole number"
        }
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;