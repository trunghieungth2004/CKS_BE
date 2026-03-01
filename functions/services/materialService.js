const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const rawMaterialSupplyRepository = require('../repositories/rawMaterialSupplyRepository');
const rawMaterialRepository = require('../repositories/rawMaterialRepository');
const supplierRepository = require('../repositories/supplierRepository');
const rawBatchRepository = require('../repositories/rawBatchRepository');

const BUFFER_PERCENTAGE = 0.10;
const MAX_BATCH_SIZE = 5;

const calculateMaterialsNeeded = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
        
        const allPendingOrders = await orderRepository.findByStatus('OR100');
        
        const pendingOrders = allPendingOrders.filter(order => {
            const deliveryDate = order.delivery_date.split('T')[0];
            return deliveryDate === tomorrowDateStr;
        });
        
        if (!pendingOrders || pendingOrders.length === 0) {
            console.log('No pending orders to process for today');
            return { totalOrders: 0, materials: [] };
        }

        const materialNeeds = {};

        for (const order of pendingOrders) {
            if (!order.items || order.items.length === 0) continue;

            for (const item of order.items) {
                const product = await productRepository.findById(item.product_id);
                if (!product) continue;

                const recipe = await recipeRepository.findByProductId(item.product_id);
                if (!recipe) continue;

                const ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);

                for (const ingredient of ingredients) {
                    const materialKey = ingredient.material_id;
                    const quantityNeeded = ingredient.quantity_per_unit * item.quantity;

                    if (!materialNeeds[materialKey]) {
                        materialNeeds[materialKey] = {
                            material_id: ingredient.material_id,
                            material_name: ingredient.material_name,
                            total_quantity: 0,
                            unit: ingredient.unit || 'kg'
                        };
                    }

                    materialNeeds[materialKey].total_quantity += quantityNeeded;
                }
            }
        }

        const materialsList = Object.values(materialNeeds).map(material => ({
            ...material,
            base_quantity: material.total_quantity,
            total_quantity: material.total_quantity * (1 + BUFFER_PERCENTAGE)
        }));
        console.log(`Calculated materials for ${pendingOrders.length} orders:`, materialsList);

        return {
            totalOrders: pendingOrders.length,
            materials: materialsList
        };
    } catch (error) {
        throw new Error(`Error calculating materials: ${error.message}`);
    }
};

const createMaterialSupplyOrders = async () => {
    try {
        const { totalOrders, materials } = await calculateMaterialsNeeded();

        if (materials.length === 0) {
            return {
                success: true,
                message: 'No materials needed',
                supplies: []
            };
        }

        const suppliers = await supplierRepository.findAll();
        if (!suppliers || suppliers.length === 0) {
            throw new Error('No suppliers available');
        }

        const supplies = [];
        const batches = [];
        const today = new Date().toISOString().split('T')[0];

        for (const material of materials) {
            const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];

            const supplyData = {
                material_id: material.material_id,
                material_name: material.material_name,
                supplier_id: randomSupplier.supplier_id,
                supplier_name: randomSupplier.supplier_name,
                base_quantity: material.base_quantity,
                buffer_quantity: material.total_quantity - material.base_quantity,
                total_quantity: material.total_quantity,
                unit: material.unit,
                supply_date: today,
                notes: `Auto-generated: ${material.base_quantity}${material.unit} + 10% buffer (${(material.total_quantity - material.base_quantity).toFixed(2)}${material.unit}) = ${material.total_quantity.toFixed(2)}${material.unit} from ${totalOrders} orders`
            };

            const supply = await rawMaterialSupplyRepository.create(supplyData);
            supplies.push(supply);

            const numBatches = Math.ceil(material.total_quantity / MAX_BATCH_SIZE);
            let remainingQuantity = material.total_quantity;

            for (let i = 0; i < numBatches; i++) {
                const batchQuantity = Math.min(MAX_BATCH_SIZE, remainingQuantity);
                
                const batchData = {
                    supply_id: supply.supply_id,
                    material_id: material.material_id,
                    material_name: material.material_name,
                    batch_number: `BATCH-${today}-${supply.supply_id.slice(-6)}-${i + 1}`,
                    quantity: batchQuantity,
                    unit: material.unit,
                    batch_date: today,
                    qc_status: 'PENDING',
                    qc_by: null,
                    qc_date: null,
                    supplier_id: randomSupplier.supplier_id,
                    supplier_name: randomSupplier.supplier_name
                };

                const batch = await rawBatchRepository.create(batchData);
                batches.push(batch);
                
                remainingQuantity -= batchQuantity;
            }
        }

        return {
            success: true,
            message: `Created ${supplies.length} material supplies with ${batches.length} production batches (10% buffer included). Orders will be updated to OR101 after batch QC approval.`,
            supplies,
            batches
        };
    } catch (error) {
        throw new Error(`Error creating material supplies: ${error.message}`);
    }
};

module.exports = {
    calculateMaterialsNeeded,
    createMaterialSupplyOrders
};
