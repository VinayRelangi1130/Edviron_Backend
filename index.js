const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Transaction = require("./database/mongo");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection -> mongoURI: This variable holds your MongoDB connection string.
//  allows your Node.js app to connect to your MongoDB database.
const mongoURI =  "mongodb+srv://rvinay1130:RITAMLs6HzI79N6U@edviron.lzfk4.mongodb.net/?retryWrites=true&w=majority&appName=edviron";
// const mongoURI = "mongodb+srv://test-user:edviron@edvironassessment.ub8p5.mongodb.net/?retryWrites=true&w=majority&appName=edvironAssessment"

//mongoose.connect(mongoURI):
// This function establishes a connection with the MongoDB database using the provided URI.
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err));


//fetch all transaction details
app.get('/getall', async (req, res) => {
    try {
        const transactions = await Transaction.find();

        res.status(200).json(transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
});

// create new posts 
app.post("/transactions", async (req, res) => {
  const {
    sNo,
    instituteName,
    dateTime,
    orderId,
    orderAmount,
    transactionAmount,
    paymentMethod,
    status,
    studentName,
    phoneNo,
    vendorAmount,
  } = req.body;

  try {
    const newTransaction = new Transaction({
      sNo,
      instituteName,
      dateTime: new Date(dateTime), // Ensure it's in a valid Date format
      orderId,
      orderAmount,
      transactionAmount,
      paymentMethod,
      status,
      studentName,
      phoneNo,
      vendorAmount,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction); // Return the created transaction
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// fetch all transactions by instituteName
app.get('/transactions-by-school/:instituteName', async (req, res) => {
    const { instituteName } = req.params;  // Get instituteName from the URL params

    try {
        // Find all transactions for the given instituteName
        const transactions = await Transaction.find({ instituteName: instituteName });

        // Check if any transactions exist for the given instituteName
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'No transactions found for this institute' });
        }

        // Return the list of transactions for the specified institute
        res.status(200).json(transactions);
    } catch (err) {
        // If an error occurs, send a 500 status with the error message
        res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
});

// fetch the transaction status by orderId
app.get('/status/:orderId', async (req, res) => {
    const { orderId } = req.params;  // Get orderId from the URL params

    try {
        // Find the transaction by orderId
        const transaction = await Transaction.findOne({ orderId: orderId });

        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Return the status of the found transaction
        res.status(200).json({
            orderId: transaction.orderId,
            status: transaction.status,  // Return the status
        });
    } catch (err) {
        // If an error occurs, send a 500 status with the error message
        res.status(500).json({ error: 'Failed to fetch transaction status', details: err.message });
    }
});

// // POST route to handle the webhook for status updates
// Webhook for status updates
app.post('/webhook/status-update', async (req, res) => {
    const { status, order_info } = req.body;

    // Validate the payload format
    if (!order_info || !order_info.order_id) {
        return res.status(400).json({ error: 'Invalid payload format' });
    }

    try {
        // Find the transaction by order_id
        const transaction = await Transaction.findOne({ orderId: order_info.order_id });

        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found for the given order ID' });
        }

        // Update the transaction with the new status and additional details
        transaction.status = status === 200 ? "Completed" : "Failed"; // Assuming 200 means success
        transaction.transactionAmount = order_info.transaction_amount;
        transaction.paymentMethod = order_info.gateway; // Update gateway as payment method
        transaction.bankReference = order_info.bank_reference; // Add bank reference

        // Save the updated transaction
        await transaction.save();

        // Return a success response
        res.status(200).json({ message: 'Transaction status updated successfully', transaction });
    } catch (err) {
        // Handle any errors during the update
        console.error("Error updating transaction status:", err);
        res.status(500).json({ error: 'Failed to update transaction status', details: err.message });
    }
});


// // Manually update the status of a transaction
// Manual status update for a transaction
app.post('/manual-status-update', async (req, res) => {
    const { orderId, status } = req.body;

    // Validate the input
    if (!orderId || !status) {
        return res.status(400).json({ error: 'Both orderId and status are required' });
    }

    try {
        // Find the transaction by orderId
        const transaction = await Transaction.findOne({ orderId });

        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update the status of the transaction
        transaction.status = status;

        // Save the updated transaction
        await transaction.save();

        // Return a success response
        res.status(200).json({
            message: 'Transaction status updated successfully',
            transaction,
        });
    } catch (err) {
        // Handle errors
        console.error("Error updating transaction status manually:", err);
        res.status(500).json({ error: 'Failed to update transaction status', details: err.message });
    }
});



// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

