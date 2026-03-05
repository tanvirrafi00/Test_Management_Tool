const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Project = require('./src/models/Project');

// Test configuration
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-development-only';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testflow';

// Test user credentials
const TEST_USER = {
    email: 'qa.engineer@testflow.com',
    password: 'password123'
};

async function testProjectView() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find test user
        console.log('\nFinding test user...');
        const user = await User.findOne({ email: TEST_USER.email });
        if (!user) {
            console.error('✗ Test user not found');
            return;
        }
        console.log(`✓ Found user: ${user.name} (${user.email}) - Role: ${user.role}`);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('✓ Generated JWT token');

        // Find projects accessible to this user
        console.log('\nFinding accessible projects...');
        const projects = await Project.find({
            $or: [
                { createdBy: user._id },
                { qaLead: user._id },
                { productOwner: user._id },
                { teamMembers: user._id }
            ]
        }).populate('teamMembers', 'name email role');

        if (projects.length === 0) {
            console.log('✗ No projects found for this user');
            return;
        }

        console.log(`✓ Found ${projects.length} project(s):`);
        projects.forEach(project => {
            console.log(`  - ${project.name} (${project._id})`);
            console.log(`    Status: ${project.status}`);
            console.log(`    Team Members: ${project.teamMembers?.length || 0}`);
        });

        const projectId = projects[0]._id;
        console.log(`\nTesting Project View for project: ${projects[0].name}`);

        // Test endpoints
        const endpoints = [
            { name: 'Dashboard', path: `/api/projects/${projectId}/dashboard` },
            { name: 'Features', path: `/api/projects/${projectId}/features` },
            { name: 'Test Cases', path: `/api/projects/${projectId}/test-cases` },
            { name: 'Test Plans', path: `/api/projects/${projectId}/test-plans` },
            { name: 'Defects', path: `/api/projects/${projectId}/defects` },
            { name: 'Reports', path: `/api/projects/${projectId}/reports` },
            { name: 'Team', path: `/api/projects/${projectId}/team` }
        ];

        console.log('\nTesting Project View endpoints:');
        console.log('================================');

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://localhost:5001${endpoint.path}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✓ ${endpoint.name}: OK (${response.status})`);
                    if (data.data) {
                        if (Array.isArray(data.data)) {
                            console.log(`  - Items: ${data.data.length}`);
                        } else if (data.data.widgets) {
                            console.log(`  - Widgets available`);
                        } else if (data.data.project) {
                            console.log(`  - Project data available`);
                        }
                    }
                } else {
                    console.log(`✗ ${endpoint.name}: FAILED (${response.status})`);
                    const error = await response.text();
                    console.log(`  - Error: ${error}`);
                }
            } catch (error) {
                console.log(`✗ ${endpoint.name}: ERROR`);
                console.log(`  - ${error.message}`);
            }
        }

        console.log('\n================================');
        console.log('Project View testing completed!');

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the test
testProjectView().catch(console.error);
