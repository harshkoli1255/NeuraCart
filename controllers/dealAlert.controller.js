const DealAlert = require("../models/DealAlert");

exports.createAlert = async (req, res, next) => {
    try {
        const { category, minDiscount } = req.body;
        
        // Validation
        if (!category) {
            return res.status(400).json({ success: false, error: "Category is required." });
        }
        
        const parsedDiscount = parseInt(minDiscount, 10);
        if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
            return res.status(400).json({ success: false, error: "Discount must be a number between 0 and 100." });
        }
        
        // Authentication check (double safeguard)
        if (!req.user) {
            return res.status(401).json({ success: false, error: "You must be logged in to activate deal alerts." });
        }
        
        // Save alert preference in MongoDB
        const alert = new DealAlert({
            user: req.user._id,
            email: req.user.email,
            category: category,
            minDiscount: parsedDiscount
        });
        
        await alert.save();
        
        return res.status(201).json({
            success: true,
            message: "Deal alerts activated successfully!",
            data: alert
        });
    } catch (error) {
        console.error("Create Deal Alert Controller Error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to activate deal alerts. Please try again."
        });
    }
};
