const mongoose = require('mongoose');

const testPlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Test plan name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    releaseVersion: {
        type: String,
        trim: true,
        default: ''
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    testCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase'
    }],
    assignedTesters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-generate test plan ID before saving
testPlanSchema.pre('save', async function (next) {
    if (!this.planId) {
        const count = await mongoose.model('TestPlan').countDocuments();
        this.planId = `TP-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('TestPlan', testPlanSchema);
