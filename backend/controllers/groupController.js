const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body; // members is array of User IDs
        const group = new Group({ name, members });
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('members');
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        const { userId } = req.params;
        const groups = await Group.find({ members: userId }).populate('members');
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
