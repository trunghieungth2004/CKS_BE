const { db } = require('../config/firebase');
const COLLECTION = 'roles';

const findById = async (roleId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(roleId.toString()).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            role_id: parseInt(doc.id),
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            role_id: parseInt(doc.id),
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const initializeRoles = async () => {
    try {
        const roles = [
            { role_id: 0, role_name: 'admin' },
            { role_id: 1, role_name: 'ck_staff' },
            { role_id: 2, role_name: 'ck_supply' },
            { role_id: 3, role_name: 'manager' },
            { role_id: 4, role_name: 'store_staff' }
        ];

        for (const role of roles) {
            await db.collection(COLLECTION).doc(role.role_id.toString()).set({
                role_name: role.role_name
            });
        }
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    findById,
    findAll,
    initializeRoles
};