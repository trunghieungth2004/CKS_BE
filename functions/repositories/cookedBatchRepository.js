const { db } = require('../config/firebase');

class CookedBatchRepository {
    constructor() {
        this.collection = db.collection('cooked_batches');
    }

    async create(batchData) {
        const docRef = await this.collection.add({
            ...batchData,
            created_at: new Date().toISOString()
        });
        return { batch_id: docRef.id, ...batchData };
    }

    async findById(batchId) {
        const doc = await this.collection.doc(batchId).get();
        if (!doc.exists) return null;
        return { batch_id: doc.id, ...doc.data() };
    }

    async findByOrderId(orderId) {
        const snapshot = await this.collection
            .where('order_id', '==', orderId)
            .orderBy('batch_number', 'asc')
            .get();
        
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    }

    async findByQCStatus(status) {
        const snapshot = await this.collection
            .where('qc_status', '==', status)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    }

    async update(batchId, updates) {
        await this.collection.doc(batchId).update({
            ...updates,
            updated_at: new Date().toISOString()
        });
        return this.findById(batchId);
    }

    async findByStoreId(storeId) {
        const snapshot = await this.collection
            .where('store_id', '==', storeId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    }

    async findByDateRange(startDate, endDate) {
        const snapshot = await this.collection
            .where('created_at', '>=', startDate)
            .where('created_at', '<=', endDate)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = new CookedBatchRepository();
