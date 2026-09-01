import express from "express"
import sysController from "../controllers/sys.js"
import validate from "../middleware/validation.js"
import authenticate from "../middleware/authenticate.js"
import { createTicketSchema } from "../validation/schemas/createTicket.schema.js"
import { deleteTicketsSchema } from "../validation/schemas/deleteTickets.schema.js"
import { getTicketsPerPageSchema } from "../validation/schemas/getTicketsPerPage.schema.js"
import { getBibleTextVersionsSchema } from "../validation/schemas/getBibleTextVersions.schema.js"
import { getAllBibleTextVersionsSchema } from "../validation/schemas/getAllBibleTextVersions.schema.js"

const sysRouter = express.Router()

sysRouter.get("/getAllBibleTextVersions",
    validate(getAllBibleTextVersionsSchema, "query"),
    sysController.getAllBibleTextVersions
)

sysRouter.get("/getBibleTextVersions",
    validate(getBibleTextVersionsSchema, "query"),
    sysController.getBibleTextVersions
)

sysRouter.get("/getAllLangs",
    sysController.getAllLangs
)

sysRouter.post("/createTicket",
    validate(createTicketSchema, "body"),
    sysController.createTicket
)

sysRouter.delete("/deleteTickets",
    validate(deleteTicketsSchema, "body"),
    authenticate.session,
    authenticate.isAdmin,
    sysController.deleteTickets
)

sysRouter.get("/getTicketsPerPage/:page",
    validate(getTicketsPerPageSchema, "params"),
    authenticate.session,
    authenticate.isAdmin,
    sysController.getTicketsPerPage
)

sysRouter.get("/getTicketsCount",
    authenticate.session,
    authenticate.isAdmin,
    sysController.getTicketsCount
)

export default sysRouter
