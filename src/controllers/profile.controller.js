const { validationResult } = require('express-validator');
const db = require('../config/database');

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 104,
                message: 'User tidak ditemukan',
                data: null
            });
        }

        res.status(200).json({
            status: 0,
            message: 'Sukses',
            data: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 102,
                message: errors.array()[0].msg,
                data: null
            });
        }

        const userId = req.user.userId;
        const { first_name, last_name } = req.body;

        // Update profile
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
            [first_name, last_name, userId]
        );

        // Get updated profile
        const [users] = await db.query(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            status: 0,
            message: 'Update Profile berhasil',
            data: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 102,
                message: 'File tidak ditemukan',
                data: null
            });
        }

        const userId = req.user.userId;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Update profile image
        await db.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageUrl, userId]
        );

        // Get updated profile
        const [users] = await db.query(
            'SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            status: 0,
            message: 'Update Profile Image berhasil',
            data: users[0]
        });
    } catch (error) {
        console.error('Update profile image error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};