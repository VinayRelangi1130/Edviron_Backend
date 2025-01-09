const mongoose = require('mongoose');

// Defining the schema for your data
const transactionSchema = new mongoose.Schema({
    sNo: {
        type: Number,         // S.No (int)
        required: true,
        unique: true          // Ensure that S.No is unique
    },
    instituteName: {
        type: String,         // Institute Name (varchar 300)
        required: true,
        maxlength: 300        // Maximum length of 300 characters
    },
    dateTime: {
        type: Date,           // Date&Time (DD, M, YY & H, M, S AM/PM)
        required: true
    },
    orderId: {
        type: String,         // Order ID (text)
        required: true
    },
    orderAmount: {
        type: Number,         // Order Amount (int)
        required: true
    },
    transactionAmount: {
        type: Number,         // Transaction Amount (int)
        required: true
    },
    paymentMethod: {
        type: String,         // Payment Method (varchar 250)
        required: true,
        maxlength: 250        // Maximum length of 250 characters
    },
    status: {
        type: String,         // Status (varchar 200)
        required: true,
        maxlength: 200        // Maximum length of 200 characters
    },
    studentName: {
        type: String,         // Student Name (varchar 250)
        required: true,
        maxlength: 250        // Maximum length of 250 characters
    },
    phoneNo: {
        type: Number,         // Phone No (int 10 digit)
        required: true,
        validate: {
            validator: function(v) {
                return /\d{10}/.test(v);  // Validate that phone number is 10 digits
            },
            message: 'Phone number must be 10 digits'
        }
    },
    vendorAmount: {
        type: Number,         // Vendor Amount (int)
        required: true
    }
});

// Create the model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;  // Export the model to use in other files
