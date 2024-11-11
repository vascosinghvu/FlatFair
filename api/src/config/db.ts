import mongoose from "mongoose"
// import dotenv from "dotenv"
// import path from "path"
// import { connect } from "http2"

require("dotenv").config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export default connectDB
