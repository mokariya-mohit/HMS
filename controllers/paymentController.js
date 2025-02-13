// const paypal = require('@paypal/checkout-server-sdk');
// const Bill = require('../models/Bill');

// // PayPal environment setup (use sandbox for testing)
// const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
// const client = new paypal.core.PayPalHttpClient(environment);

// // Create a payment
// exports.createPayment = async (req, res) => {
//     const { billId } = req.body;
//     try {
//         const bill = await Bill.findById(billId);
//         if (!bill) {
//             return res.status(404).json({ error: 'Bill not found' });
//         }

//         const request = new paypal.orders.OrdersCreateRequest();
//         request.prefer('return=representation');
//         request.requestBody({
//             intent: 'CAPTURE',
//             purchase_units: [{
//                 amount: {
//                     currency_code: 'USD',
//                     value: bill.finalAmount.toFixed(2),
//                 },
//                 description: `Payment for bill ${billId}`,
//             }],
//             application_context: {
//                 return_url: 'http://localhost:3000/payments/success', // Adjust accordingly
//                 cancel_url: 'http://localhost:3000/payments/cancel'  // Adjust accordingly
//             }
//         });

//         const order = await client.execute(request);
//         console.log('Order ID:', order.result.id); // Log the order ID

//         // Return the approval URL to redirect the user
//         const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
//         res.status(201).json({ orderID: order.result.id, approvalUrl }); // Include approval URL
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Payment creation failed' });
//     }
// };

// // Capture PayPal payment
// exports.capturePayment = async (req, res) => {
//     const { orderID } = req.body;
//     console.log('Capturing order ID:', orderID);

//     if (!orderID) {
//         return res.status(400).json({ error: 'Order ID is required to capture payment' });
//     }

//     try {
//         const request = new paypal.orders.OrdersCaptureRequest(orderID);
//         request.requestBody({});
//         const capture = await client.execute(request);

//         console.log('Payment captured:', capture);
//         const billId = capture.result.purchase_units[0].description.split(' ')[3];
//         const bill = await Bill.findById(billId);
//         if (!bill) {
//             return res.status(404).json({ error: 'Bill not found' });
//         }

//         bill.paymentStatus = 'paid';
//         await bill.save();

//         res.status(200).json({ message: 'Payment successful', capture });
//     } catch (error) {
//         console.error('Error capturing payment:', error);
//         res.status(500).json({ error: 'Payment capture failed' });
//     }
// };
const paypal = require('@paypal/checkout-server-sdk');
const Bill = require('../models/Bill'); // Ensure your Bill model is imported correctly

// PayPal environment setup (use sandbox for testing)
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

// Create a payment
exports.createPayment = async (req, res) => {
    const { billId } = req.body;

    // Mock test data for demonstration
    const mockBill = {
        finalAmount: 10.00, // Mock amount for testing
        id: billId || 'mockBillId', // Use a mock bill ID if needed
    };

    try {
        const bill = mockBill; // Use mock data instead of fetching from DB

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: bill.finalAmount.toFixed(2),
                },
                description: `Payment for bill ${bill.id}`,
            }],
            application_context: {
                return_url: 'http://localhost:3000/payments/success', // Adjust accordingly
                cancel_url: 'http://localhost:3000/payments/cancel'  // Adjust accordingly
            }
        });

        const order = await client.execute(request);
        console.log('Order ID:', order.result.id); // Log the order ID

        // Return the approval URL to redirect the user
        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
        res.status(201).json({ orderID: order.result.id, approvalUrl }); // Include approval URL
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment creation failed' });
    }
};

// Capture PayPal payment
exports.capturePayment = async (req, res) => {
    const { orderID, billId } = req.body; // Ensure billId is received in the request body

    if (!orderID || !billId) {
        return res.status(400).json({ error: 'Order ID and Bill ID are required to capture payment' });
    }

    try {
        // Normally, here you would capture the payment with the PayPal API
        console.log('Simulating capturing order ID:', orderID);

        // Simulate capturing the payment and updating the payment status
        const bill = await Bill.findById(billId); // Fetch the actual bill from the database
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Simulate the payment status update
        bill.paymentStatus = 'paid'; // Update the payment status
        await bill.save(); // Save the changes to the database

        console.log(`Bill ID ${bill.id} payment status updated to '${bill.paymentStatus}'`);
        res.status(200).json({ message: 'Payment successful', orderID });
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ error: 'Payment capture failed' });
    }
};
