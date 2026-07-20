// Authentication business logic.

const bcrypt=require("bcrypt");
const hashedPassword=await bcrypt.hash(password,12);