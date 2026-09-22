import express from "express"
import passController from "../controllers/pass.js"
import validate from "../middleware/validation.js"
import { forgotSchema, verifyUserUUIDSchema, setNewPassSchema } from "../validation/schemas/user.schema.js"

const passRouter = express.Router()

passRouter.post("/forgot", validate(forgotSchema, "body"), passController.forgot)

passRouter.post("/reset/:uuid", 
    validate(verifyUserUUIDSchema, "params"),
    validate(setNewPassSchema, "body"),
    passController.reset
)

export default passRouter