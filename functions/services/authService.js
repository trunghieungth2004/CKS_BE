const { auth, db, FIREBASE_API_KEY } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const register = async (userData) => {
    const { email, password, username, role } = userData;

    const existingUserSnapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

    if (!existingUserSnapshot.empty) {
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
        password: hashedPassword,
        role: role || 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);

    const customToken = await auth.createCustomToken(userRecord.uid);

    return {
        userId: userRecord.uid,
        email: userDoc.email,
        username: userDoc.username,
        role: userDoc.role,
        token: customToken,
    };
};

const login = async (email, password) => {
    const userSnapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

    if (userSnapshot.empty) {
        throw new Error('Invalid email or password');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.isActive) {
        throw new Error('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const customToken = await auth.createCustomToken(userDoc.id);

    const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
        {
            token: customToken,
            returnSecureToken: true,
        }
    );

    const idToken = response.data.idToken;

    return {
        userId: userDoc.id,
        firebaseUid: userDoc.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        token: idToken,
    };
};

const verifyToken = async (idToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const userData = userDoc.data();

        return {
            userId: userDoc.id,
            firebaseUid: userDoc.id,
            email: userData.email,
            username: userData.username,
            role: userData.role,
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
