import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import clsx from 'clsx';

const GroupDetails = ({ user }) => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Add Expense State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState(user._id);
    const [splitType, setSplitType] = useState('EQUAL');
    const [splitDetails, setSplitDetails] = useState({}); // { userId: amount/percentage }
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const fetchGroupData = async () => {
        try {
            const [groupRes, expenseRes, balanceRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/groups/${id}/expenses`),
                api.get(`/groups/${id}/balances`)
            ]);
            setGroup(groupRes.data);
            setExpenses(expenseRes.data);
            setBalances(balanceRes.data);
        } catch (err) {
            console.error("Failed to load group data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            // Construct payload based on splitType
            // Note: Backend expects splitDetails as map/object for EXACT/PERCENTAGE
            // For EQUAL, it can be empty implicitly implying all members

            let finalSplitDetails = {};
            if (splitType === 'EXACT' || splitType === 'PERCENTAGE') {
                finalSplitDetails = splitDetails;
            }

            const payload = {
                description,
                amount: Number(amount),
                payer,
                group: id,
                splitType,
                splitDetails: finalSplitDetails
            };

            await api.post('/expenses', payload);

            // Reset and Refresh
            setDescription('');
            setAmount('');
            setShowAddExpense(false);
            fetchGroupData(); // Refresh all data to update balances
        } catch (err) {
            console.error("Failed to add expense", err);
            alert("Failed to add expense. Please check your inputs.");
        } finally {
            setAdding(false);
        }
    };

    const handleSplitChange = (uid, value) => {
        setSplitDetails({
            ...splitDetails,
            [uid]: Number(value)
        });
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!group) return <div className="text-center py-10">Group not found</div>;

    const getUserName = (uid) => {
        const member = group.members.find(m => m._id === uid);
        return member ? member.name : 'Unknown';
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Link to="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {group.members.map(m => m.name).join(', ')}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                >
                    Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expenses List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Expenses</h2>
                    {expenses.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300 text-gray-500">
                            No expenses yet. Add one to get started!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expenses.map(expense => (
                                <div key={expense._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                                            🧾
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                                            <p className="text-xs text-gray-500">
                                                paid by <span className="font-medium text-gray-700">{expense.payer.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900">${expense.amount}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{expense.splitType}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Balances Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Balances</h2>
                        {balances && balances.simplified && balances.simplified.length > 0 ? (
                            <div className="space-y-4">
                                {balances.simplified.map((txn, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                            {getUserName(txn.from).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-gray-600">
                                            <span className="font-medium text-gray-900">{getUserName(txn.from)}</span>
                                            {' '}owes{' '}
                                            <span className="font-medium text-gray-900">{getUserName(txn.to)}</span>
                                        </div>
                                        <div className="font-bold text-green-600">
                                            ${txn.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">You are all settled up!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Add Expense</h3>
                            <button onClick={() => setShowAddExpense(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleAddExpense}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none"
                                        placeholder="e.g. Dinner"
                                        value={description} onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                    <input
                                        type="number" required min="0" step="0.01"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none"
                                        placeholder="0.00"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none bg-white"
                                        value={payer} onChange={e => setPayer(e.target.value)}
                                    >
                                        {group.members.map(m => (
                                            <option key={m._id} value={m._id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Split Type</label>
                                    <div className="flex rounded-lg bg-gray-100 p-1">
                                        {['EQUAL', 'EXACT', 'PERCENTAGE'].map(type => (
                                            <button
                                                key={type} type="button"
                                                onClick={() => setSplitType(type)}
                                                className={clsx(
                                                    "flex-1 py-1 text-sm font-medium rounded-md transition-all",
                                                    splitType === type ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Split Details Inputs */}
                                {(splitType === 'EXACT' || splitType === 'PERCENTAGE') && (
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Split by {splitType === 'EXACT' ? 'Amount ($)' : 'Percentage (%)'}
                                        </p>
                                        {group.members.map(m => (
                                            <div key={m._id} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">{m.name}</span>
                                                <input
                                                    type="number" step="0.01"
                                                    className="w-24 px-2 py-1 rounded border border-gray-200 text-right"
                                                    placeholder="0"
                                                    value={splitDetails[m._id] || ''}
                                                    onChange={e => handleSplitChange(m._id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit" disabled={adding}
                                className="w-full py-3 font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg transition-all"
                            >
                                {adding ? 'Saving...' : 'Save Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;
