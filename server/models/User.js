import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import PROGRAMS from "../config/programs.js";
import cleanName from "../utils/cleanName.js";

const ROLES = ['user', 'moderator'];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 40,
        set: cleanName,
        match: /^[A-Za-z]+(?: [A-Za-z]+)*$/
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
        required: function () {
            return this.profileCompleted;
        },
        validate: {
            validator: value => PROGRAMS.some(p => p.name === value),
            message: "Invalid program"
        }
    },
    branch: {
        type: String,
        required: function () {
            return this.profileCompleted;
        },
        validate: {
            validator: function (value) {
                const program = PROGRAMS.find(p => p.name === this.program);
                return program?.branches.some(b => b.name === value);
            },
            message: "Invalid branch for selected program"
        }
    },
    semester: {
        type: Number,
        required: function () {
            return this.profileCompleted;
        },
        validate: {
            validator: function (value) {
                const program = PROGRAMS.find(p => p.name === this.program);
                const branch = program?.branches.find(b => b.name === this.branch);
                return branch && value >= 1 && value <= branch.semesters;
            },
            message: "Invalid semester for selected program and branch"
        }
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        trim: true,
        maxlength: 300
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

const User = mongoose.model("User", userSchema);
export default User;
