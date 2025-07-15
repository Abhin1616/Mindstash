import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 200,
        trim: true
    },
    brokenRules: [{
        type: String,
        default: []
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    moderatorComment: {
        type: String,
        maxlength: 300,
        default: ""
    }
}, { timestamps: true });

// 🔒 Ensure only one report per user per material
reportSchema.index({ material: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
