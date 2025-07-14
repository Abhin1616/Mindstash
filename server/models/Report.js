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
    reportType: {
        type: String,
        enum: ['duplicate', 'irrelevant', 'incorrect_content', 'offensive', 'spam', 'other'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 200,
        trim: true
    },
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
