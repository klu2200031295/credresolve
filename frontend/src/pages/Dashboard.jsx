import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import clsx from 'clsx';

const Dashboard = ({ user }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Group State
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([user._id]); // Auto-select self

    // Quick Add User State
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [addingUser, setAddingUser] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    // ... existing fetchGroups ...

    const handleQuickAddUser = async () => {
        setAddingUser(true);
        try {
            const res = await api.post('/users', { name: newUserName, email: newUserEmail });
            const createdUser = res.data;

            // Add to available users list
            setAvailableUsers([...availableUsers, createdUser]);
            // Auto select the new user
            setSelectedMembers([...selectedMembers, createdUser._id]);

            // Reset form
            setNewUserName('');
            setNewUserEmail('');
            alert(`Added ${createdUser.name}!`);
        } catch (err) {
            console.error("Failed to add user", err);
            alert("Failed to add user. Email might already exist.");
        } finally {
            setAddingUser(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get(`/users/${user._id}/groups`);
            setGroups(res.data);
        } catch (err) {
            console.error("Failed to fetch groups", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const payload = {
                name: newGroupName,
                members: selectedMembers
            };
            const res = await api.post('/groups', payload);
            setGroups([...groups, res.data]);
            setShowCreateModal(false);
            setNewGroupName('');
        } catch (err) {
            console.error("Failed to create group", err);
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = async () => {
        setShowCreateModal(true);
        try {
            const res = await api.get('/users');
            setAvailableUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const toggleMemberSelection = (uid) => {
        if (selectedMembers.includes(uid)) {
            setSelectedMembers(selectedMembers.filter(id => id !== uid));
        } else {
            setSelectedMembers([...selectedMembers, uid]);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Manage your expense groups</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all duration-200 flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Create Group
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No groups yet</h3>
                    <p className="text-gray-500">Create a group to start sharing expenses!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <Link to={`/group/${group._id}`} key={group._id} className="block group">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                                        {group.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {group.members.length} Members
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{group.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Tap to view expenses</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">New Group</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 outline-none"
                                    placeholder="e.g. Vacation Trip"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>

                                {/* Quick Add User Form */}
                                <div className="bg-gray-50 p-3 rounded-xl mb-3 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Add New Person</p>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            placeholder="Name"
                                            className="flex-1 px-3 py-2 text-sm rounded border border-gray-200"
                                            value={newUserName} onChange={e => setNewUserName(e.target.value)}
                                        />
                                        <input
                                            placeholder="Email"
                                            className="flex-1 px-3 py-2 text-sm rounded border border-gray-200"
                                            value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleQuickAddUser}
                                        disabled={!newUserName || !newUserEmail || addingUser}
                                        className="w-full py-1.5 text-xs font-semibold text-primary bg-white border border-primary rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {addingUser ? 'Adding...' : '+ Add Person to List'}
                                    </button>
                                </div>

                                <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1">
                                    {availableUsers.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => toggleMemberSelection(u._id)}
                                            className={clsx(
                                                "flex items-center p-2 rounded-lg cursor-pointer transition-colors",
                                                selectedMembers.includes(u._id) ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-5 h-5 rounded border flex items-center justify-center mr-3",
                                                selectedMembers.includes(u._id) ? "bg-primary border-primary text-white" : "border-gray-300"
                                            )}>
                                                {selectedMembers.includes(u._id) && "✓"}
                                            </div>
                                            <span>{u.name}</span>
                                            <span className="text-xs text-gray-400 ml-auto">{u.email}</span>
                                        </div>
                                    ))}
                                    {availableUsers.length === 0 && (
                                        <div className="text-center py-4 text-sm text-gray-500">
                                            List is empty. Use the form above to add people.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-3 font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/30 transition-all"
                                >
                                    {creating ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
