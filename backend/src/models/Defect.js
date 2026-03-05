const mongoose = require('mongoose');

const defectSchema = new mongoose.Schema({
    defectId: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Defect title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    stepsToReproduce: {
        type: String,
        trim: true,
        default: ''
    },
    expectedResult: {
        type: String,
        trim: true,
        default: ''
    },
    actualResult: {
        type: String,
        trim: true,
        default: ''
    },
    severity: {
        type: String,
        enum: ['trivial', 'minor', 'major', 'critical'],
        default: 'minor'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'fixed', 'retest', 'closed', 'archived'],
        default: 'open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    linkedTestCase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase',
        default: null
    },
    linkedExecution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Execution',
        default: null
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    feature: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        text: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Auto-generate defect ID before saving
defectSchema.pre('save', async function (next) {
    if (!this.defectId) {
        const count = await mongoose.model('Defect').countDocuments();
        this.defectId = `BUG-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Defect', defectSchema);
