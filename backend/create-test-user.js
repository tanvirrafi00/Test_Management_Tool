require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testflow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Create test users
const createTestUsers = async () => {
    try {
        // Clear existing users (optional - comment out if you want to keep existing users)
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create test users
        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@testflow.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'QA Lead',
                email: 'qa.lead@testflow.com',
                password: 'lead123',
                role: 'qa_lead'
            },
            {
                name: 'QA Engineer',
                email: 'qa.engineer@testflow.com',
                password: 'engineer123',
                role: 'qa_engineer'
            },
            {
                name: 'Viewer',
                email: 'viewer@testflow.com',
                password: 'viewer123',
                role: 'viewer'
            }
        ];

        const createdUsers = await User.create(testUsers);
        console.log('✅ Test users created successfully:');
        createdUsers.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });

        console.log('\n📝 Login credentials:');
        console.log('   Admin: admin@testflow.com / admin123');
        console.log('   QA Lead: qa.lead@testflow.com / lead123');
        console.log('   QA Engineer: qa.engineer@testflow.com / engineer123');
        console.log('   Viewer: viewer@testflow.com / viewer123');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

// Run the script
createTestUsers();
