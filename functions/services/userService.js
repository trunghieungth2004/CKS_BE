const userRepository = require('../repositories/userRepository');

const getUserById = async (userId) => {
    const user = await userRepository.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }

    if (user.password) {
        delete user.password;
    }
    
    return user;
};

const getAllUsers = async () => {
    const users = await userRepository.findAll();
    
    return users
        .filter(user => user.isActive !== false)
        .map(user => {
            if (user.password) {
                delete user.password;
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
        if (emailExists && emailExists.id !== userId) {
            throw new Error('Email already in use');
        }
    }

    if (updateData.age && updateData.age < 18) {
        throw new Error('User must be at least 18 years old');
    }

    updateData.updatedAt = new Date().toISOString();

    const updatedUser = await userRepository.update(userId, updateData);
    if (updatedUser.password) {
        delete updatedUser.password;
    }
    
    return updatedUser;
};

const deleteUser = async (userId) => {
    const user = await userRepository.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }

    return await userRepository.update(userId, {
        isActive: false,
        deletedAt: new Date().toISOString()
    });
};

module.exports = {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
};
