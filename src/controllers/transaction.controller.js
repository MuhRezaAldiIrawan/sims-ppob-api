const { validationResult } = require('express-validator');
const db = require('../config/database');

// Generate Invoice Number
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV${day}${month}${year}-${random}`;
};

// Get Balance
exports.getBalance = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [balances] = await db.query(
            'SELECT balance FROM balances WHERE user_id = ?',
            [userId]
        );

        if (balances.length === 0) {
            return res.status(404).json({
                status: 104,
                message: 'Balance tidak ditemukan',
                data: null
            });
        }

        res.status(200).json({
            status: 0,
            message: 'Get Balance Berhasil',
            data: {
                balance: parseFloat(balances[0].balance)
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// Top Up
exports.topUp = async (req, res) => {
    const connection = await db.getConnection();

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
        const { top_up_amount } = req.body;

        // Start transaction
        await connection.beginTransaction();

        // Update balance
        await connection.query(
            'UPDATE balances SET balance = balance + ? WHERE user_id = ?',
            [top_up_amount, userId]
        );

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber();

        // Insert transaction record
        await connection.query(
            'INSERT INTO transactions (user_id, invoice_number, transaction_type, total_amount, description, created_on) VALUES (?, ?, ?, ?, ?, NOW())',
            [userId, invoiceNumber, 'TOPUP', top_up_amount, 'Top Up Balance']
        );

        // Get updated balance
        const [balances] = await connection.query(
            'SELECT balance FROM balances WHERE user_id = ?',
            [userId]
        );

        // Commit transaction
        await connection.commit();

        res.status(200).json({
            status: 0,
            message: 'Top Up Balance berhasil',
            data: {
                balance: parseFloat(balances[0].balance)
            }
        });
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Top up error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    } finally {
        connection.release();
    }
};

// Transaction (Payment)
exports.transaction = async (req, res) => {
    const connection = await db.getConnection();

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
        const { service_code } = req.body;

        // Start transaction
        await connection.beginTransaction();

        // Get service information
        const [services] = await connection.query(
            'SELECT service_code, service_name, service_tariff FROM services WHERE service_code = ?',
            [service_code]
        );

        if (services.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                status: 102,
                message: 'Service atau Layanan tidak ditemukan',
                data: null
            });
        }

        const service = services[0];
        const serviceTariff = parseFloat(service.service_tariff);

        // Get current balance
        const [balances] = await connection.query(
            'SELECT balance FROM balances WHERE user_id = ?',
            [userId]
        );

        const currentBalance = parseFloat(balances[0].balance);

        // Check if balance is sufficient
        if (currentBalance < serviceTariff) {
            await connection.rollback();
            return res.status(400).json({
                status: 102,
                message: 'Saldo tidak mencukupi',
                data: null
            });
        }

        // Deduct balance
        await connection.query(
            'UPDATE balances SET balance = balance - ? WHERE user_id = ?',
            [serviceTariff, userId]
        );

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber();

        // Insert transaction record
        await connection.query(
            'INSERT INTO transactions (user_id, invoice_number, transaction_type, service_code, service_name, total_amount, created_on) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [userId, invoiceNumber, 'PAYMENT', service.service_code, service.service_name, serviceTariff]
        );

        // Commit transaction
        await connection.commit();

        res.status(200).json({
            status: 0,
            message: 'Transaksi berhasil',
            data: {
                invoice_number: invoiceNumber,
                service_code: service.service_code,
                service_name: service.service_name,
                transaction_type: 'PAYMENT',
                total_amount: serviceTariff,
                created_on: new Date().toISOString()
            }
        });
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Transaction error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    } finally {
        connection.release();
    }
};

// Transaction History
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 0;

        let query = `
      SELECT 
        invoice_number,
        transaction_type,
        service_code,
        service_name,
        total_amount,
        created_on
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_on DESC
    `;

        const params = [userId];

        // Add limit and offset if provided
        if (limit > 0) {
            query += ' LIMIT ?';
            params.push(limit);

            if (offset > 0) {
                query += ' OFFSET ?';
                params.push(offset);
            }
        }

        const [transactions] = await db.query(query, params);

        // Format response
        const records = transactions.map(t => ({
            invoice_number: t.invoice_number,
            transaction_type: t.transaction_type,
            description: t.service_name || 'Top Up Balance',
            total_amount: parseFloat(t.total_amount),
            created_on: t.created_on
        }));

        res.status(200).json({
            status: 0,
            message: 'Get History Berhasil',
            data: {
                offset: offset,
                limit: limit,
                records: records
            }
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};