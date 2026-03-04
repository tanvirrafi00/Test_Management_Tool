const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
    executionId: {
        type: String,
        unique: true,
        required: true
    },
    testCase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase',
        required: true
    },
    testPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestPlan',
        required: true
    },
    executedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['not_run', 'pass', 'fail', 'blocked', 'retest'],
        default: 'not_run'
    },
    comments: {
        type: String,
        trim: true,
        default: ''
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    linkedDefect: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Defect',
        default: null
    },
    executionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Auto-generate execution ID before saving
executionSchema.pre('save', async function (next) {
    if (!this.executionId) {
        const count = await mongoose.model('Execution').countDocuments();
        this.executionId = `EX-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Execution', executionSchema);
