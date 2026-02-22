const { initializeRoles } = require('../repositories/roleRepository');
const { initializeStatuses } = require('../repositories/statusRepository');
const { auth } = require('../config/firebase');
const productRepository = require('../repositories/productRepository');
const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const rawMaterialRepository = require('../repositories/rawMaterialRepository');
const supplierRepository = require('../repositories/supplierRepository');
const userRepository = require('../repositories/userRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const ckInventoryRepository = require('../repositories/ckInventoryRepository');
const bcrypt = require('bcryptjs');

const initializeSampleData = async () => {
    try {
        console.log('\n=== Initializing Sample Data ===\n');

        const rawChicken = await rawMaterialRepository.create({
            material_name: 'Raw Chicken',
            unit: 'kg',
            price: 8.50,
            description: 'Fresh chicken meat'
        });
        console.log('✓ Created raw material: Raw Chicken');

        const rawPork = await rawMaterialRepository.create({
            material_name: 'Raw Pork',
            unit: 'kg',
            price: 12.00,
            description: 'Fresh pork meat'
        });
        console.log('✓ Created raw material: Raw Pork');

        const rice = await rawMaterialRepository.create({
            material_name: 'Rice',
            unit: 'kg',
            price: 2.50,
            description: 'White rice'
        });
        console.log('✓ Created raw material: Rice');

        const supplier1 = await supplierRepository.create({
            supplier_name: 'Fresh Farms Co.',
            contact_person: 'John Doe',
            phone: '+63-912-345-6789',
            email: 'contact@freshfarms.ph',
            address: 'Manila, Philippines'
        });
        console.log('✓ Created supplier: Fresh Farms Co.');

        const supplier2 = await supplierRepository.create({
            supplier_name: 'Premium Meats Inc.',
            contact_person: 'Jane Smith',
            phone: '+63-923-456-7890',
            email: 'sales@premiummeats.ph',
            address: 'Quezon City, Philippines'
        });
        console.log('✓ Created supplier: Premium Meats Inc.');

        const friedChickenProduct = await productRepository.create({
            product_name: 'Fried Chicken',
            product_description: 'Crispy fried chicken',
            price: 15.00,
            shelf_life_days: 5,
            created_by: 'system'
        });
        console.log('✓ Created product: Fried Chicken');

        const friedChickenRecipe = await recipeRepository.create({
            product_id: friedChickenProduct.product_id,
            recipe_name: 'Fried Chicken Recipe',
            instructions: 'Season, bread, and fry chicken until golden brown',
            created_by: 'system'
        });
        console.log('✓ Created recipe: Fried Chicken Recipe');

        await recipeIngredientRepository.create({
            recipe_id: friedChickenRecipe.recipe_id,
            material_id: rawChicken.material_id,
            material_name: rawChicken.material_name,
            quantity_per_unit: 1,
            unit: 'kg'
        });
        console.log('✓ Added ingredient: 1 kg Raw Chicken per unit');

        const porkAdoboProduct = await productRepository.create({
            price: 18.50,
            shelf_life_days: 5,
            product_name: 'Pork Adobo',
            product_description: 'Filipino-style braised pork',
            created_by: 'system'
        });
        console.log('✓ Created product: Pork Adobo');

        const porkAdoboRecipe = await recipeRepository.create({
            product_id: porkAdoboProduct.product_id,
            recipe_name: 'Pork Adobo Recipe',
            instructions: 'Marinate pork, then braise in soy sauce and vinegar',
            created_by: 'system'
        });
        console.log('✓ Created recipe: Pork Adobo Recipe');

        await recipeIngredientRepository.create({
            recipe_id: porkAdoboRecipe.recipe_id,
            material_id: rawPork.material_id,
            material_name: rawPork.material_name,
            quantity_per_unit: 0.8,
            unit: 'kg'
        });
        console.log('✓ Added ingredient: 0.8 kg Raw Pork per unit');

        console.log('\n=== Sample Data Initialized Successfully ===\n');
        return {
            materials: [rawChicken, rawPork, rice],
            suppliers: [supplier1, supplier2],
            products: [friedChickenProduct, porkAdoboProduct]
        };
    } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
    }
};

const initializeUsers = async (materials) => {
    try {
        console.log('\n=== Initializing Sample Users ===\n');
        
        if (!materials) {
            materials = await rawMaterialRepository.findAll();
            console.log(`✓ Fetched ${materials.length} materials from database`);
        }
        
        const password = "CKS@12345";
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminAuthUser = await auth.createUser({
            uid: 'admin_user_001',
            email: 'admin@cks.com',
            password: password,
            displayName: 'Admin User'
        });
        const adminUser = await userRepository.createWithId(adminAuthUser.uid, {
            email: 'admin@cks.com',
            username: 'Admin User',
            password_hash: hashedPassword,
            role_id: 0,
            created_at: new Date().toISOString()
        });
        console.log('✓ Created admin user: admin@cks.com');

        const ckStaffAuthUser = await auth.createUser({
            uid: 'ck_staff_001',
            email: 'ckstaff@cks.com',
            password: password,
            displayName: 'CK Staff'
        });
        const ckStaffUser = await userRepository.createWithId(ckStaffAuthUser.uid, {
            email: 'ckstaff@cks.com',
            username: 'CK Staff',
            password_hash: hashedPassword,
            role_id: 1,
            created_at: new Date().toISOString()
        });
        console.log('✓ Created CK staff user: ckstaff@cks.com');

        for (const material of materials) {
            await ckInventoryRepository.create({
                material_id: material.material_id,
                quantity: 0,
                unit: material.unit,
                status: 'RAW',
                last_updated: new Date().toISOString()
            });
        }
        console.log('✓ Created CK inventory for all materials');

        const ckSupplyAuthUser = await auth.createUser({
            uid: 'ck_supply_001',
            email: 'cksupply@cks.com',
            password: password,
            displayName: 'CK Supply'
        });
        const ckSupplyUser = await userRepository.createWithId(ckSupplyAuthUser.uid, {
            email: 'cksupply@cks.com',
            username: 'CK Supply',
            password_hash: hashedPassword,
            role_id: 2,
            created_at: new Date().toISOString()
        });
        console.log('✓ Created CK supply user: cksupply@cks.com');

        const managerAuthUser = await auth.createUser({
            uid: 'manager_001',
            email: 'manager@cks.com',
            password: password,
            displayName: 'Manager'
        });
        const managerUser = await userRepository.createWithId(managerAuthUser.uid, {
            email: 'manager@cks.com',
            username: 'Manager',
            password_hash: hashedPassword,
            role_id: 3,
            created_at: new Date().toISOString()
        });
        console.log('✓ Created manager user: manager@cks.com');

        const storeStaffAuthUser = await auth.createUser({
            uid: 'store_staff_001',
            email: 'storestaff@store1.com',
            password: password,
            displayName: 'Store Staff 1'
        });
        const storeStaffUser = await userRepository.createWithId(storeStaffAuthUser.uid, {
            email: 'storestaff@store1.com',
            username: 'Store Staff 1',
            password_hash: hashedPassword,
            role_id: 4,
            created_at: new Date().toISOString()
        });
        console.log('✓ Created store staff user: storestaff@store1.com');

        const storeStaff = await storeStaffRepository.create({
            user_id: storeStaffAuthUser.uid,
            store_code: 'STORE001',
            store_name: 'Main Branch Store'
        });
        console.log('✓ Created store staff record: Main Branch Store');

        for (const material of materials) {
            await storeInventoryRepository.create({
                store_staff_id: storeStaff.store_staff_id,
                material_id: material.material_id,
                material_name: material.material_name,
                quantity: 0,
                unit: material.unit,
                last_updated: new Date().toISOString()
            });
        }
        console.log('✓ Created store inventory for Main Branch Store');

        console.log('\n=== Sample Users Initialized Successfully ===');
        console.log('All users created with password:', password);
        
        return {
            adminUser,
            ckStaffUser,
            ckSupplyUser,
            managerUser,
            storeStaffUser
        };
    } catch (error) {
        console.error('Error initializing sample users:', error);
        throw error;
    }
};

const initializeDatabase = async () => {
    try {
        console.log('\n=== Initializing Database ===\n');
        
        await initializeRoles();
        console.log('✓ Roles created:');
        console.log('  - 0: admin');
        console.log('  - 1: ck_staff');
        console.log('  - 2: ck_supply');
        console.log('  - 3: manager');
        console.log('  - 4: store_staff');
        
        await initializeStatuses();
        console.log('✓ Statuses created:');
        console.log('  Order Statuses: OR100-OR105');
        console.log('  Auth Statuses: AUTH100-AUTH107');
        
        const sampleData = await initializeSampleData();
        await initializeUsers(sampleData.materials);
        
        console.log('\n=== Database Initialized Successfully ===\n');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = { initializeDatabase, initializeSampleData, initializeUsers };