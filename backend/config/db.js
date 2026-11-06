const dns = require("dns");
const mongoose = require("mongoose");

// Some home/ISP DNS servers refuse the lookup that "mongodb+srv://" needs
// (error: querySrv ECONNREFUSED). Use public DNS servers instead.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;