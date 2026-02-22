const { db } = require('../config/firebase');
const COLLECTION = 'statuses';

const findById = async (statusId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(statusId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            status_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByCategory = async (category) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('category', '==', category)
            .orderBy('status_id')
            .get();
        
        return snapshot.docs.map(doc => ({
            status_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            status_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const initializeStatuses = async () => {
    try {
        const statuses = [
            { status_id: 'OR100', category: 'order', status_name: 'PENDING', description: 'Order submitted, awaiting processing', next_statuses: ['OR101', 'OR105'] },
            { status_id: 'OR101', category: 'order', status_name: 'IN_PRODUCTION', description: 'Order passed cut-off time, in kitchen production', next_statuses: ['OR102'] },
            { status_id: 'OR102', category: 'order', status_name: 'STAGED', description: 'Kitchen cooking complete, order staged for dispatch', next_statuses: ['OR103'] },
            { status_id: 'OR103', category: 'order', status_name: 'DISPATCHED', description: 'Order loaded on truck and dispatched to store', next_statuses: ['OR104', 'OR105'] },
            { status_id: 'OR104', category: 'order', status_name: 'DELIVERED', description: 'Order received and confirmed by store staff, added to inventory', next_statuses: [] },
            { status_id: 'OR105', category: 'order', status_name: 'CANCELLED', description: 'Order cancelled before or after dispatch', next_statuses: [] },
            
            { status_id: 'AUTH100', category: 'auth', status_name: 'SUCCESS', description: 'Authentication successful' },
            { status_id: 'AUTH101', category: 'auth', status_name: 'FAILED', description: 'Authentication failed' },
            { status_id: 'AUTH102', category: 'auth', status_name: 'INVALID_CREDENTIALS', description: 'Invalid email or password' },
            { status_id: 'AUTH103', category: 'auth', status_name: 'TOKEN_EXPIRED', description: 'Authentication token has expired' },
            { status_id: 'AUTH104', category: 'auth', status_name: 'TOKEN_INVALID', description: 'Invalid authentication token' },
            { status_id: 'AUTH105', category: 'auth', status_name: 'REGISTERED', description: 'User registered successfully' },
            { status_id: 'AUTH106', category: 'auth', status_name: 'EMAIL_EXISTS', description: 'Email already registered' },
            { status_id: 'AUTH107', category: 'auth', status_name: 'VERIFIED', description: 'Token verified successfully' },
        ];

        for (const status of statuses) {
            await db.collection(COLLECTION).doc(status.status_id).set({
                category: status.category,
                status_name: status.status_name,
                description: status.description,
                next_statuses: status.next_statuses || null
            });
        }
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    findById,
    findByCategory,
    findAll,
    initializeStatuses
};
