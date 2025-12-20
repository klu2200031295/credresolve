const Expense = require('../models/Expense');
const Group = require('../models/Group');

exports.createExpense = async (req, res) => {
    try {
        const { description, amount, payer, group, splitType, splitDetails } = req.body;

        // Validation logic could go here (e.g., check if splitDetails sum up to amount)

        const expense = new Expense({
            description,
            amount,
            payer,
            group,
            splitType,
            splitDetails
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.groupId }).populate('payer', 'name');
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
