const userRepository = require('../repositories/userRepository');

const getUserById = async (userId) => {
    const user = await userRepository.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }

    if (user.password_hash) {
        delete user.password_hash;
    }
    
    return user;
};

const getAllUsers = async () => {
    const users = await userRepository.findAll();
    
    return users.map(user => {
        if (user.password_hash) {
            delete user.password_hash;
        }
        return user;
    });
};

const updateUser = async (userId, updateData) => {
    const existingUser = await userRepository.findById(userId);
    
    if (!existingUser) {
        throw new Error('User not found');
    }

    if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await userRepository.findByEmail(updateData.email);
        if (emailExists && emailExists.user_id !== userId) {
            throw new Error('Email already in use');
        }
    }

    const updatedUser = await userRepository.update(userId, updateData);
    if (updatedUser.password_hash) {
        delete updatedUser.password_hash;
    }
    
    return updatedUser;
};

const deleteUser = async (userId) => {
    const user = await userRepository.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }

    return await userRepository.deleteById(userId);
};

module.exports = {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
};
