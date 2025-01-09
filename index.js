const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Transaction = require("./database/mongo");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection -> mongoURI: This variable holds your MongoDB connection string.
//  This is what allows your Node.js app to connect to your MongoDB database.
const mongoURI = "mongodb+srv://test-user:edviron@edvironassessment.ub8p5.mongodb.net/?retryWrites=true&w=majority&appName=edvironAssessment"
//   "mongodb+srv://rvinay1130:RITAMLs6HzI79N6U@edviron.lzfk4.mongodb.net/?retryWrites=true&w=majority&appName=edviron";

//mongoose.connect(mongoURI):
// This function establishes a connection with the MongoDB database using the provided URI.
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err));


//fetch all transaction details
  app.get('/getall', async (req, res) => {
    console.log("GET /transactions route hit");

    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
});


// Endpoint to list all collections in the database
app.get('/collections', async (req, res) => {
    try {
        // Get the database instance from the Mongoose connection
        const db = mongoose.connection.db;

        // List all collections in the database
        const collections = await db.listCollections().toArray();
        const collection = mongoose.connection.listDatabases();
        // console.log(collections)
        console.log(collection)
        // Extract and return the collection names
        // const collectionNames = collections.map((collection) => collection.name);
        res.status(200).json({ collection });
    } catch (err) {
        // Handle any errors
        res.status(500).json({ error: 'Failed to fetch collections', details: err.message });
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


// POST route to handle the webhook for status updates
app.post('/webhook/status-update', async (req, res) => {
    const { orderId, status } = req.body;  // Extract orderId and status from the request body

    if (!orderId || !status) {
        // If orderId or status is missing, return an error response
        return res.status(400).json({ error: 'orderId and status are required' });
    }

    try {
        // Find the transaction by orderId
        const transaction = await Transaction.findOne({ orderId: orderId });

        // If the transaction doesn't exist, return a 404 error
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update the transaction status
        transaction.status = status;

        // Save the updated transaction
        await transaction.save();

        // Return a success response
        res.status(200).json({ message: 'Transaction status updated successfully', orderId: orderId, status: status });
    } catch (err) {
        // If an error occurs, return a 500 error
        res.status(500).json({ error: 'Failed to update transaction status', details: err.message });
    }
});


// Manually update the status of a transaction
app.post('/manual-status-update', async (req, res) => {
    // Destructure orderId and new status from the request body
    const { orderId, status } = req.body;

    // Check if both orderId and status are provided
    if (!orderId || !status) {
        return res.status(400).json({ error: 'Both orderId and status are required' });
    }

    try {
        // Find the transaction by its orderId
        const transaction = await Transaction.findOne({ orderId: orderId });

        // If no transaction is found with the given orderId, return an error
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update the status of the transaction
        transaction.status = status;

        // Save the updated transaction back to the database
        await transaction.save();

        // Return a success response with the updated transaction
        res.status(200).json({
            message: 'Transaction status updated successfully',
            orderId: orderId,
            updatedStatus: status
        });
    } catch (err) {
        // Return a 500 error if something goes wrong
        res.status(500).json({
            error: 'Failed to update transaction status',
            details: err.message
        });
    }
});



// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
