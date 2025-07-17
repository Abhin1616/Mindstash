import mongoose from "mongoose";

const materialSnapshotSchema = new mongoose.Schema({
    title: {
        type: String,
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
        type: String,
        required: true
    },
    uploadedBy: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }
}, { _id: false });

const reportSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true
    },
    materialSnapshot: {
        type: materialSnapshotSchema,
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
        required: true
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

reportSchema.index({ material: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
