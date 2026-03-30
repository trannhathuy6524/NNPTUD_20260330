const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');
const bcrypt = require('bcrypt');
const { sendPasswordEmail } = require('./sendMailHandler');

// Hàm tạo password ngẫu nhiên 16 ký tự
function generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

module.exports = {
    ImportUser: async function (username, email) {
        try {
            // Kiểm tra user đã tồn tại
            const existingUser = await userModel.findOne({
                $or: [{ username: username }, { email: email }]
            });

            if (existingUser) {
                return {
                    success: false,
                    message: 'Username or email already exists',
                    data: null
                };
            }

            // Tạo password ngẫu nhiên 16 ký tự
            const randomPassword = generateRandomPassword(16);
            const hashedPassword = bcrypt.hashSync(randomPassword, 10);

            // Lấy hoặc tạo role "user"
            let userRole = await roleModel.findOne({ name: 'user' });
            if (!userRole) {
                userRole = new roleModel({
                    name: 'user',
                    description: 'Regular user role',
                    isDeleted: false
                });
                await userRole.save();
            }

            // Tạo user mới
            const newUser = new userModel({
                username: username,
                email: email,
                password: hashedPassword,
                role: userRole._id,
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                fullName: '',
                status: false,
                loginCount: 0
            });

            await newUser.save();

            // Gửi email password cho user
            try {
                await sendPasswordEmail(email, username, randomPassword, email);
            } catch (emailError) {
                console.error('Warning: Failed to send email:', emailError.message);
            }

            return {
                success: true,
                message: 'User imported successfully and email sent',
                data: {
                    username: username,
                    email: email,
                    plainPassword: randomPassword,
                    plainPasswordLength: randomPassword.length,
                    role: userRole.name,
                    userId: newUser._id
                }
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }
};
