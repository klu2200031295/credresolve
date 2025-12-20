const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Helper to simplify debts
function simplifyDebts(balances) {
    // balances is { user: netAmount } (+ve means receive, -ve means owe)
    const debtors = [];
    const creditors = [];

    for (const [user, amount] of Object.entries(balances)) {
        if (amount < -0.01) debtors.push({ user, amount });
        if (amount > 0.01) creditors.push({ user, amount });
    }

    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const transactions = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        transactions.push({
            from: debtor.user,
            to: creditor.user,
            amount: Number(amount.toFixed(2))
        });

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return transactions;
}

exports.getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId });

        // Calculate raw net balances
        const balances = {}; // { userId: netAmount }

        for (const expense of expenses) {
            const payerId = expense.payer.toString();
            const amount = expense.amount;

            // Payer gets +amount
            balances[payerId] = (balances[payerId] || 0) + amount;

            if (expense.splitType === 'EQUAL') {
                // Note: Ideally we need the group members list if splitDetails is empty. 
                // For now assumes splitDetails contains list of involved users or we fetch group.
                // Let's assume for MVP: splitDetails has keys for all involved users if partially involved, 
                // OR we fetch all group members if "splitDetails" is empty.
                // To keep it simple: We will assume the frontend sends the list of involved users in `splitDetails` even for EQUAL, 
                // or we query the group.

                // Let's fetch group members if needed, but for performance, let's assume `splitDetails` (as a map or object) in the expense 
                // keys are the users involved.
                // Actually, for EQUAL, usually it is "All group members". 
                // Let's load the group to be safe if we want to support "Split equally among all".

                let involvedUsers = [];
                if (expense.splitDetails && expense.splitDetails.size > 0) {
                    involvedUsers = Array.from(expense.splitDetails.keys());
                } else {
                    // Fetch group members
                    const group = await Group.findById(groupId);
                    involvedUsers = group.members.map(m => m.toString());
                }

                const splitAmount = amount / involvedUsers.length;
                for (const uid of involvedUsers) {
                    balances[uid] = (balances[uid] || 0) - splitAmount;
                }

            } else if (expense.splitType === 'EXACT') {
                for (const [uid, share] of expense.splitDetails) {
                    balances[uid] = (balances[uid] || 0) - share;
                }
            } else if (expense.splitType === 'PERCENTAGE') {
                for (const [uid, percentage] of expense.splitDetails) {
                    const share = (amount * percentage) / 100;
                    balances[uid] = (balances[uid] || 0) - share;
                }
            }
        }

        const simplified = simplifyDebts(balances);
        res.status(200).json({ balances, simplified });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
