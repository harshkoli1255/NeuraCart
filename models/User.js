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

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:["customer","admin"],
        default:"customer"
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