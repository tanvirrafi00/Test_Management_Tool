const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    featureId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Feature name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Deprecated', 'In Development', 'Completed'],
        default: 'In Development'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requirementLink: {
        type: String,
        trim: true
    },
    designDocument: {
        type: String,
        trim: true
    },
    storyReference: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-generate feature ID before saving
featureSchema.pre('save', async function (next) {
    if (!this.featureId) {
        const count = await mongoose.model('Feature').countDocuments();
        this.featureId = `FEAT-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Feature', featureSchema);
