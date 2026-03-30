const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');
const { sendPasswordEmail } = require('./utils/sendMailHandler');

// Hàm tạo chuỗi ngẫu nhiên 16 ký tự
function generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Hàm import User
async function importUser(username, email) {
    try {
        // Kết nối MongoDB
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C2');

        // Kiểm tra user đã tồn tại
        const existingUser = await userModel.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            console.log('✗ User already exists!');
            console.log('Username:', existingUser.username);
            console.log('Email:', existingUser.email);
            console.log('User ID:', existingUser._id);
            await mongoose.disconnect();
            process.exit(0);
        }

        // Tạo password ngẫu nhiên 16 ký tự
        const randomPassword = generateRandomPassword(16);

        // Lấy hoặc tạo role "user"
        let userRole = await roleModel.findOne({ name: 'user' });
        if (!userRole) {
            console.log('Role "user" not found. Creating it...');
            userRole = new roleModel({
                name: 'user',
                description: 'Regular user role',
                isDeleted: false
            });
            await userRole.save();
            console.log('Role "user" created successfully!');
        }

        // Tạo user mới (password sẽ được mã hóa tự động bởi pre-save hook)
        const newUser = new userModel({
            username: username,
            email: email,
            password: randomPassword,
            role: userRole._id,
            avatarUrl: 'https://i.sstatic.net/l60Hf.png',
            fullName: '',
            status: false,
            loginCount: 0
        });

        // Lưu user vào database
        await newUser.save();

        // Gửi email password cho user
        console.log('\n📧 Sending password email...');
        await sendPasswordEmail(email, username, randomPassword, email);

        console.log('✓ User imported successfully!');
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password (Plain Text, Please save it):', randomPassword);
        console.log('Password Length:', randomPassword.length);
        console.log('Role:', userRole.name);
        console.log('User ID:', newUser._id);
        console.log('✓ Email sent successfully!');

        // Đóng kết nối
        await mongoose.disconnect();
        
        return newUser;

    } catch (error) {
        console.error('Error importing user:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Chạy import
const args = process.argv.slice(2);
const username = args[0] || 'testuser';
const email = args[1] || 'testuser@example.com';

console.log(`Importing user with username: ${username}, email: ${email}\n`);
importUser(username, email);
