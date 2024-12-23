const express = require('express');
const mongoose = require('mongoose');
const routes = require('./src/routes/allRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use('/api', routes);

// MongoDB connection
const dbConnect = async () => {
  try {
    await mongoose.connect("mongodb+srv://User2:kanersdoghouse@bare-bones.pxrwg.mongodb.net/?retryWrites=true&w=majority&appName=Bare-Bones", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start the server after connecting to the database
dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});