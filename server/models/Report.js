// models/Report.js

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
        maxlength: 200
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🛡️ Prevent duplicate report on same material by same user
reportSchema.index({ material: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
