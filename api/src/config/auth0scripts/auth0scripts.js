// Callback Urls: http://localhost:3000/dashboard, http://localhost:3000/middle
// Allowed Logout Urls: http://localhost:3000, https://flat-fair-csac.vercel.app/, https://flat-fair-csac.vercel.app, https://flat-fair-csac.vercel.app/home, https://flat-fair-csac.vercel.app/login
// Allowed Web Origins: http://localhost:3000, http://localhost:8000, http://localhost:8000/create-group, http://localhost:8000/curUserInfo/get-user, https://flat-fair-csac.vercel.app, http://localhost:8000/user

function create(user, callback) {
    const MongoClient = require('mongodb').MongoClient;
    const bcrypt = require('bcrypt');
    const uri = configuration.MONGO_URI; // Your MongoDB connection string

    MongoClient.connect(uri, function (err, client) {
        if (err) return callback(err);

        const db = client.db('FlatFairDB'); // Your database name
        const users = db.collection('users');

        // Hash the user's password before storing it
        bcrypt.hash(user.password, 10, function (err, hashedPassword) {
            if (err) return callback(err);

            // Prepare the user document based on your schema
            const newUser = {
                user_id: '', // This will be populated after insertion
                email: user.email,
                name: user.name || user.email.split('@')[0], // Default to part of email if name not provided
                password: hashedPassword,
                groups: [], // Initialize as an empty array
                friends: [], // Initialize as an empty array
                expenses: [], // Initialize as an empty array
                createdAt: new Date(), // Optionally track creation date
            };

            // Insert the new user into the MongoDB collection
            users.insertOne(newUser, function (err, result) {
                if (err) return callback(err);

                // Update user_id with the MongoDB ObjectId and save it
                const insertedUserId = 'mongo|' + result.insertedId;
                users.updateOne(
                    { _id: result.insertedId },
                    { $set: { user_id: insertedUserId } },
                    function (err) {
                        if (err) return callback(err);

                        // Return the user profile without the password
                        callback(null, {
                            user_id: insertedUserId,
                            email: newUser.email,
                            name: newUser.name,
                            groups: newUser.groups,
                            friends: newUser.friends,
                            expenses: newUser.expenses,
                        });
                    }
                );
            });
        });
    });
}
