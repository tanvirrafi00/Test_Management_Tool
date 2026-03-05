const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'On Hold', 'Completed', 'Archived'],
        default: 'Draft'
    },
    productOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    qaLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date
    },
    expectedEndDate: {
        type: Date
    },
    repositoryUrl: {
        type: String,
        trim: true
    },
    documentationLink: {
        type: String,
        trim: true
    },
    jiraReference: {
        type: String,
        trim: true
    },
    environmentDetails: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
