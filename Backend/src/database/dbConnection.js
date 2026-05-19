import prisma from "../Lib/prismaClient.js";

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("PostgreSQL connected via Prisma ✅");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;