const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( {
    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },

    googleId: {
        type: String,
        sparse: true,
        unique: true
    },

    password: {
        type: String,
        required: function() {
            // Password is only required if the user didn't sign up via Google
            return !this.googleId;
        }
    },

    role:{
        type:String,
        enum:["buyer", "seller", "admin"],
        default:"buyer"
    },

    avatar:{
        type:String,
        default:""
    },
    
    // AI & Personalization Features
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    
    searchHistory: [{
        query: String,
        timestamp: { type: Date, default: Date.now }
    }],
    
    viewedProducts: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        timestamp: { type: Date, default: Date.now }
    }],
    
    preferences: {
        categories: [String],
        brands: [String],
        sizes: [String]
    }
},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);