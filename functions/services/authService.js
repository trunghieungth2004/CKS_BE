const { auth, FIREBASE_API_KEY } = require('../config/firebase');
const userRepository = require('../repositories/userRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const register = async (userData) => {
    const { email, password, username, role_id, store_code, store_name } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new Error('Email already registered');
    }

    const userRecord = await auth.createUser({
        email,
        password,
        displayName: username || email.split('@')[0],
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDoc = {
        email,
        username: username || email.split('@')[0],
        password_hash: hashedPassword,
        role_id: role_id || 4,
        created_at: new Date().toISOString(),
    };

    await userRepository.createWithId(userRecord.uid, userDoc);

    if ((role_id || 4) === 4) {
        await storeStaffRepository.create({
            user_id: userRecord.uid,
            store_code: store_code || '',
            store_name: store_name || ''
        });
    }

    const customToken = await auth.createCustomToken(userRecord.uid);

    return {
        user_id: userRecord.uid,
        email: userDoc.email,
        username: userDoc.username,
        role_id: userDoc.role_id,
        token: customToken,
    };
};

const login = async (email, password) => {
    const userData = await userRepository.findByEmail(email);
    if (!userData) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const customToken = await auth.createCustomToken(userData.user_id);

    const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
        {
            token: customToken,
            returnSecureToken: true,
        }
    );

    const idToken = response.data.idToken;

    return {
        user_id: userData.user_id,
        firebaseUid: userData.user_id,
        email: userData.email,
        username: userData.username,
        role_id: userData.role_id,
        token: idToken,
    };
};

const verifyToken = async (idToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        
        const userData = await userRepository.findById(decodedToken.uid);
        if (!userData) {
            throw new Error('User not found');
        }

        return {
            user_id: userData.user_id,
            firebaseUid: userData.user_id,
            email: userData.email,
            username: userData.username,
            role_id: userData.role_id,
        };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    register,
    login,
    verifyToken,
};
