const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Comprehensive Health Check
exports.healthCheck = async (req, res) => {
    const startTime = Date.now();
    const checks = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../../package.json').version,
        checks: {}
    };

    let overallStatus = 200;

    try {
        // Database Connection Check
        try {
            const [rows] = await db.query('SELECT 1 as health');
            checks.checks.database = {
                status: 'OK',
                message: 'Database connection successful',
                responseTime: Date.now() - startTime
            };
        } catch (dbError) {
            checks.checks.database = {
                status: 'ERROR',
                message: 'Database connection failed',
                error: dbError.message,
                responseTime: Date.now() - startTime
            };
            overallStatus = 503;
        }

        // Database Tables Check
        try {
            const tables = ['users', 'balances', 'services', 'banners', 'transactions'];
            const tableChecks = {};
            
            for (const table of tables) {
                const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
                tableChecks[table] = {
                    status: 'OK',
                    count: rows[0].count
                };
            }
            
            checks.checks.tables = {
                status: 'OK',
                message: 'All required tables exist',
                details: tableChecks
            };
        } catch (tableError) {
            checks.checks.tables = {
                status: 'ERROR',
                message: 'Table check failed',
                error: tableError.message
            };
            overallStatus = 503;
        }

        // Uploads Directory Check
        const uploadsDir = path.join(__dirname, '../../uploads');
        try {
            const stats = fs.statSync(uploadsDir);
            const isWritable = fs.constants && (fs.accessSync(uploadsDir, fs.constants.W_OK), true);
            
            checks.checks.uploads = {
                status: 'OK',
                message: 'Uploads directory is accessible',
                path: uploadsDir,
                exists: stats.isDirectory(),
                writable: true
            };
        } catch (uploadsError) {
            checks.checks.uploads = {
                status: 'ERROR',
                message: 'Uploads directory check failed',
                error: uploadsError.message,
                path: uploadsDir
            };
            overallStatus = 503;
        }

        // Environment Variables Check
        const requiredEnvVars = [
            'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'
        ];
        
        let envStatus = 'OK';
        let missingVars = [];
        
        requiredEnvVars.forEach(envVar => {
            if (!process.env[envVar]) {
                envStatus = 'WARNING';
                missingVars.push(envVar);
            }
        });
        
        checks.checks.environment = {
            status: envStatus,
            message: envStatus === 'OK' ? 'All required environment variables are set' : `Missing environment variables: ${missingVars.join(', ')}`,
            checkedCount: requiredEnvVars.length,
            missingCount: missingVars.length
        };

        // System Resources Check
        checks.checks.system = {
            status: 'OK',
            message: 'System resources',
            details: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB'
                },
                pid: process.pid
            }
        };

        // Overall status determination
        const hasErrors = Object.values(checks.checks).some(check => check.status === 'ERROR');
        const hasWarnings = Object.values(checks.checks).some(check => check.status === 'WARNING');
        
        if (hasErrors) {
            checks.status = 'ERROR';
            overallStatus = 503;
        } else if (hasWarnings) {
            checks.status = 'WARNING';
            overallStatus = 200;
        }

        checks.responseTime = Date.now() - startTime + 'ms';

        res.status(overallStatus).json(checks);

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime + 'ms'
        });
    }
};

// Simple Health Check (for load balancers)
exports.simpleHealthCheck = (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
};