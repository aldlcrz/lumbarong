const Wishlist = require('../models/Wishlist');
const { Product, ProductImage } = require('../models/Product');

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.userId;

        const [item, created] = await Wishlist.findOrCreate({
            where: { userId, productId }
        });

        if (!created) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        res.status(201).json({ message: 'Added to wishlist', item });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const deleted = await Wishlist.destroy({
            where: { userId, productId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const items = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: ProductImage, as: 'images' }]
            }]
        });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
