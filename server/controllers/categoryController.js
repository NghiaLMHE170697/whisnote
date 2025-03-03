const Category = require("../models/Category");

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json({
                status: 'success',
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error getting categories'
            });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Category not found'
                });
            }
            res.status(200).json({
                status: 'success',
                data: category
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error getting category'
            });
        }
    }
};

module.exports = categoryController;
