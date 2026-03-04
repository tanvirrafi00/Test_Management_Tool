const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    testCaseId: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Test case title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    preconditions: {
        type: String,
        trim: true,
        default: ''
    },
    testSteps: [{
        stepNumber: {
            type: Number,
            required: true
        },
        action: {
            type: String,
            required: true
        },
        expectedResult: {
            type: String,
            required: true
        }
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    severity: {
        type: String,
        enum: ['trivial', 'minor', 'major', 'critical'],
        default: 'minor'
    },
    status: {
        type: String,
        enum: ['draft', 'ready', 'deprecated'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true
    }],
    version: {
        type: Number,
        default: 1
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
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Auto-generate test case ID before saving
testCaseSchema.pre('save', async function (next) {
    if (!this.testCaseId) {
        const count = await mongoose.model('TestCase').countDocuments();
        this.testCaseId = `TC-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('TestCase', testCaseSchema);
