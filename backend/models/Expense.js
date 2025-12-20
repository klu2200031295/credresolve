const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
        required: true
    },
    // For EQUAL: Can be empty (implies all group members split equally) or specific list
    // For EXACT: Map of UserId -> Amount
    // For PERCENTAGE: Map of UserId -> Percentage
    splitDetails: {
        type: Map,
        of: Number, // Stores amount or percentage depending on type
        default: {}
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
