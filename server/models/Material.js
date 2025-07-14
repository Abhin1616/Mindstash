import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 300
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image'],
        required: true
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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

}, { timestamps: true });

const Material = mongoose.model("Material", materialSchema);
export default Material;
