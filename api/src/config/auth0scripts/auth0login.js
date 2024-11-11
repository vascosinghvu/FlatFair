function login(email, password, callback) {
    const MongoClient = require('mongodb').MongoClient;
    const bcrypt = require('bcrypt');
    const uri = configuration.MONGO_URI; // Your MongoDB connection string

    MongoClient.connect(uri, function (err, client) {
        if (err) return callback(err);

        const db = client.db('FlatFairDB'); // Your database name
        const users = db.collection('users');

        // Find the user by email
        users.findOne({ email: email }, function (err, user) {
            if (err) return callback(err);
            if (!user) return callback(new WrongUsernameOrPasswordError(email));

            // Compare the provided password with the hashed password in the database
            bcrypt.compare(password, user.password, function (err, isValid) {
                if (err) return callback(err);
                if (!isValid) return callback(new WrongUsernameOrPasswordError(email));

                // Construct the user profile based on your schema
                const profile = {
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    groups: user.groups || [],
                    friends: user.friends || [],
                    expenses: user.expenses || [],
                };

                callback(null, profile);
            });
        });
    });
}