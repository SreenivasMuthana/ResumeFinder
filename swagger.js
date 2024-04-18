const swaggerJsdoc=require('swagger-jsdoc')
const swaggerUi=require('swagger-ui-express');

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Resume Finder App',
          description: "API endpoints for resume finder application documented on swagger",
          contact: {
            name: "Sreenivas M",
            email: " ",
            // url: "https://github.com/DesmondSanctity/node-js-swagger"
          },
          version: '1.0.0',
        },
        servers: [
          {
            url: "http://localhost:5000/",
            description: "Local server"
          },
        ]
      },
      // looks for configuration in specified directories
      apis: ['./Routes/HrRoute.js'],
    }
    const swaggerSpec = swaggerJsdoc(options)
    function swaggerDocs(app, port) {
      // Swagger Page
      app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
      // Documentation in JSON format
      app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
      })
    }

/**
 * @swagger
 * paths:
#   /hr/registerHr:
#     post:
#       summary: Register a new HR user
#       description: Endpoint to register a new HR user
#       requestBody:
#         required: true
#         content:
#           application/json:
#             schema:
#               $ref: '#/components/schemas/HRRegistration'
#       responses:
#         '201':
#           description: HR user successfully registered
#           content:
#             application/json:
#               schema:
#                 type: object
#                 properties:
#                   success:
#                     type: boolean
#                     example: true
#                   message:
#                     type: string
#                     example: Successfully HR registered
#                   payload:
#                     $ref: '#/components/schemas/HR'
#         '500':
#           description: Internal server error
 * 
 */









module.exports= swaggerDocs