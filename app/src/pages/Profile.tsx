import React, { useState, useEffect } from 'react';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    console.log(profile);

    useEffect(() => {
        fetch('http://localhost:8000/profile', {
            credentials: 'include', // Ensures cookies are included
        })
            .then((res) => {
                console.log("res", res);
                return res.json();
            })
            .then((data) => setProfile(data))
            .catch((error) => console.error('Error fetching profile:', error));
    }, []);
    //
    return (
        <div>
            {profile ? (
                <div>
                    <h1>Profile</h1>
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
};

export default Profile;