import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";


// 🔐 Role options
const ROLES = ['user', 'moderator', 'admin'];

// 🧼 Helper to sanitize and format names
function cleanName(value) {
    return value
        .replace(/[^\p{L} ]+/gu, '')         // Remove non-letter characters (emojis, symbols, numbers)
        .replace(/\s+/g, ' ')                // Collapse multiple spaces to one
        .trim()                              // Trim leading/trailing spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(' ');
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
    program: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Use email for login instead of username
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

const User = mongoose.model("User", userSchema);
export default User;
