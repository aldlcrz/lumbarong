const User = require('../models/User');
const Address = require('../models/Address');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (err) {
        console.error('getProfile Error:', err);
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, shopName, shopDescription, gcashNumber, facebook, instagram, tiktok, twitter } = req.body;
        const user = await User.findByPk(req.user.id);

        await user.update({
            name: name || user.name,
            phone: phone || user.phone,
            address: address || user.address,
            shopName: shopName || user.shopName,
            shopDescription: shopDescription || user.shopDescription,
            gcashNumber: gcashNumber || user.gcashNumber,
            facebook: facebook || user.facebook,
            instagram: instagram || user.instagram,
            tiktok: tiktok || user.tiktok,
            twitter: twitter || user.twitter
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('updateProfile Error:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { UserId: req.user.id },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(addresses);
    } catch (err) {
        console.error('getAddresses Error:', { userId: req.user?.id, error: err });
        res.status(500).json({ message: 'Error fetching addresses', error: err.message });
    }
};

exports.createAddress = async (req, res) => {
    try {
        const { fullName, phoneNumber, street, barangay, city, province, postalCode, label, isDefault } = req.body;

        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { UserId: req.user.id } });
        }

        const address = await Address.create({
            UserId: req.user.id,
            fullName,
            phoneNumber,
            street,
            barangay,
            city,
            province,
            postalCode,
            label,
            isDefault: isDefault || false
        });

        res.json(address);
    } catch (err) {
        console.error('createAddress Error:', err);
        res.status(500).json({ message: 'Error creating address', error: err.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phoneNumber, street, barangay, city, province, postalCode, label, isDefault } = req.body;

        const address = await Address.findOne({ where: { id, UserId: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { UserId: req.user.id } });
        }

        await address.update({
            fullName,
            phoneNumber,
            street,
            barangay,
            city,
            province,
            postalCode,
            label,
            isDefault
        });

        res.json(address);
    } catch (err) {
        console.error('updateAddress Error:', err);
        res.status(500).json({ message: 'Error updating address', error: err.message });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.update({ isDefault: false }, { where: { UserId: req.user.id } });
        const address = await Address.findOne({ where: { id, UserId: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        await address.update({ isDefault: true });
        res.json({ message: 'Default address updated' });
    } catch (err) {
        console.error('setDefaultAddress Error:', err);
        res.status(500).json({ message: 'Error setting default address', error: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.destroy({ where: { id, UserId: req.user.id } });
        res.json({ message: 'Address removed successfully' });
    } catch (err) {
        console.error('deleteAddress Error:', err);
        res.status(500).json({ message: 'Error deleting address', error: err.message });
    }
};
