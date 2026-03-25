const Order = require('../models/Order');
const Book = require('../models/Book');
const { stkPush } = require('../services/mpesa');
const { v4: uuidv4 } = require('uuid');

// Initiate Payment
exports.initiatePayment = async (req, res) => {
    const { bookId, phoneNumber } = req.body;

    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const orderId = uuidv4(); // Generate unique ID for this transaction
        
        // Create a pending order in DB
        const newOrder = new Order({
            bookId,
            amount: book.price,
            phoneNumber,
            status: 'Pending'
        });
        await newOrder.save();

        // Trigger STK Push
        const mpesaResponse = await stkPush(phoneNumber, book.price, newOrder._id);

        // Save M-Pesa request IDs to order for tracking
        newOrder.merchantRequestID = mpesaResponse.MerchantRequestID;
        newOrder.checkoutRequestID = mpesaResponse.CheckoutRequestID;
        await newOrder.save();

        res.status(200).json({ 
            message: "STK Push initiated. Check your phone.", 
            orderId: newOrder._id,
            mpesaResponse 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Callback URL for M-Pesa
exports.mpesaCallback = async (req, res) => {
    try {
        console.log("--- MPESA CALLBACK RECEIVED ---");
        console.log(JSON.stringify(req.body, null, 2));

        const { Body } = req.body;
        
        if (Body.stkCallback.ResultCode === 0) {
            // Payment Successful
            const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
            const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
            const checkoutRequestID = Body.stkCallback.CheckoutRequestID;

            // Update Order in DB
            const order = await Order.findOneAndUpdate(
                { checkoutRequestID },
                { 
                    status: 'Paid', 
                    mpesaReceiptNumber 
                },
                { new: true }
            );

            console.log(`Order ${order._id} paid successfully. Receipt: ${mpesaReceiptNumber}`);
        } else {
            // Payment Failed or Cancelled
            const checkoutRequestID = Body.stkCallback.CheckoutRequestID;
            await Order.findOneAndUpdate(
                { checkoutRequestID },
                { status: 'Failed' }
            );
            console.log("Payment Failed:", Body.stkCallback.ResultDesc);
        }

        // Respond to Safaricom to acknowledge receipt
        res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Check Payment Status
exports.checkStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('bookId', 'pdfUrl title');
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ 
            status: order.status,
            book: order.bookId, 
            receipt: order.mpesaReceiptNumber 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};