import mongoose from "mongoose";

const paymentEntrySchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['CASH', 'CARD', 'UPI', 'ONLINE'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String // optional for each payment type
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
});

const paymentSchema = new mongoose.Schema({
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
        required: true
    },
    payments: [paymentEntrySchema], // array of payment types and amounts
    notes: {
        type: String
    },
    department: {
        type: String,
        enum: ['OPD', 'IPD'],
        required: true
    }
});

const Payments = mongoose.model('Payments', paymentSchema);
export default Payments