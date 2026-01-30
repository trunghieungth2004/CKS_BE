const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CKS Backend API',
            version: '1.0.0',
            description: 'Central Kitchen Software Backend - Layered Architecture with Firebase',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001/central-kitchen-software/us-central1/app',
                description: 'Local Development',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Firebase Authentication Token',
                },
            },
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        statusCode: {
                            type: 'integer',
                            example: 200,
                        },
                        status: {
                            type: 'string',
                            example: 'SUCCESS',
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        statusCode: {
                            type: 'integer',
                            example: 400,
                        },
                        status: {
                            type: 'string',
                            example: 'ERROR',
                        },
                        message: {
                            type: 'string',
                            example: 'Error description',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string',
                            example: 'user_id_here',
                        },
                        firebaseUid: {
                            type: 'string',
                            example: 'firebase_uid_here',
                        },
                        email: {
                            type: 'string',
                            example: 'user@example.com',
                        },
                        username: {
                            type: 'string',
                            example: 'johndoe',
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin', 'moderator'],
                            example: 'user',
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and registration endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'],
};

module.exports = swaggerJsdoc(options);
