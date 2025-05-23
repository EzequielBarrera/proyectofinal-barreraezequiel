import { Router } from "express";
import { generateMockUsers, generateMockPets } from "../utils/mocking.js";
import User from '../dao/models/User.js'
import CustomError from "../services/errors/customErrors.js";
import errorDictionary from "../services/errors/errorsName.js";
import logger from "../utils/logger.js";
import errorMessages from "../services/errors/messages/errorMessages.js";

const eM = new errorMessages()

const router = Router()

router.get("/mockingpets", (req, res) => {
    const pets = generateMockPets(100);
    res.json({ status: "success", pets });
});

router.get('/mockingusers', (req, res) => {
    const users = generateMockUsers(50)
    res.json({ status: "success", users })
})

router.post('/generateData', async (req, res) => {
    const { usersCant } = req.body;
    try {
        const generatedUsers = generateMockUsers(usersCant)
        const validUsers = []

        for (let user of generatedUsers) {
            if (!user['firstName'] || !user['lastName'] || !user.email || !user['password']) {
                CustomError.createError({
                    name: "User creation error",
                    cause: eM.createUserErrorInfo(user),
                    message: "Error creating User - TEST",
                    code: errorDictionary.MISSING_FIELDS
                })
            }
            validUsers.push(user)
        }

        await User.insertMany(validUsers)

        logger.info(`${usersCant} usuarios generados e insertados en la base de datos.`)

        res.json({
            status: "success",
            message: validUsers.length + ` usuarios generados e insertados`,
            users: validUsers.length,
        });
    } catch (error) {
        logger.error("Error al generar o insertar los datos | " + error.message + error.cause)
        res.status(500).json({ error: "Error al generar o insertar los datos" })
    }
})

export default router