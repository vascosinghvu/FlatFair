import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    console.log(profile);

    useEffect(() => {
        fetch(`${API_URL}/profile`, {
            credentials: 'include',
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