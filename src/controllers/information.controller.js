const db = require('../config/database');

// Get Banner
exports.getBanner = async (req, res) => {
    try {
        const [banners] = await db.query(
            'SELECT banner_name, banner_image, description FROM banners ORDER BY id ASC'
        );

        res.status(200).json({
            status: 0,
            message: 'Sukses',
            data: banners
        });
    } catch (error) {
        console.error('Get banner error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// Get Services
exports.getServices = async (req, res) => {
    try {
        const [services] = await db.query(
            'SELECT service_code, service_name, service_icon, service_tariff FROM services ORDER BY id ASC'
        );

        res.status(200).json({
            status: 0,
            message: 'Sukses',
            data: services
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};