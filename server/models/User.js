import mongoose from "mongoose";


const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// 🔁 Allowed values
const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE'];
const ROLES = ['user', 'moderator', 'admin'];

// Helper to clean up name input (removes extra spaces)
function cleanName(value) {
    return value.replace(/\s+/g, ' ').trim();
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: false,
        minlength: 2,
        maxlength: 40,
        set: cleanName,
        match: /^[A-Za-z]{2,}(?: [A-Za-z]{2,}){0,3}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,8}$/
    },
    role: {
        type: String,
        enum: ROLES,
        default: 'user'
    },
    branch: {
        type: String,
        enum: BRANCHES,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model("User", userSchema);
