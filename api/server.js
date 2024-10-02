const mongoose = require('mongoose')

const dbConnect = async () => {
    try {
        await mongoose.connect("mongodb+srv://User2:kanersdoghouse@bare-bones.pxrwg.mongodb.net/?retryWrites=true&w=majority&appName=Bare-Bones", {
        })
        console.log('MongoDB Connected')
    } catch (error) {
        console.error(error)
    }
  }
  
  dbConnect()