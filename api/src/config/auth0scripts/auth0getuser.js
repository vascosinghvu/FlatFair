function getByEmail(email, callback) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = configuration.MONGO_URI; // Ensure your MongoDB URI is stored in Auth0's configuration settings

    MongoClient.connect(uri, function (err, client) {
        if (err) return callback(err);

        const db = client.db('Bare-Bones'); // Your database name
        const users = db.collection('users');

        // Find the user by email
        users.findOne({ email: email }, function (err, user) {
            if (err) return callback(err);
            if (!user) return callback(null); // User not found, return null

            // Construct the user profile to return to Auth0
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
}
