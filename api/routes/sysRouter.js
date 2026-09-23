import express from "express"
import sysController from "../controllers/sys.js"
import validate from "../middleware/validation.js"
import authenticate from "../middleware/authenticate.js"
import { createTicketSchema } from "../validation/schemas/createTicket.schema.js"
import { deleteTicketsSchema } from "../validation/schemas/deleteTickets.schema.js"
import { getTicketsPerPageSchema } from "../validation/schemas/getTicketsPerPage.schema.js"
import { getBibleTextVersionsSchema } from "../validation/schemas/getBibleTextVersions.schema.js"
import { getAllBibleTextVersionsSchema } from "../validation/schemas/getAllBibleTextVersions.schema.js"
import { updateAppVersionSchema } from "../validation/schemas/updateAppVersion.schema.js"
import { needToUpdateSchema } from "../validation/schemas/needToUpdate.schema.js"
import { 
    publicNeedToUpdateRateLimiter,
    publicUpdateAppVersionRateLimiter,
    publicGetCurrentAppVersionRateLimiter,
    publicGetAllBibleTextVersionsRateLimiter,
    publicGetBibleTextVersionsRateLimiter,
    publicGetAllLangsRateLimiter,
    publicCreateTicketRateLimiter,
    publicDeleteTicketsRateLimiter,
    publicGetTicketsPerPageRateLimiter,
    publicGetTicketsCountRateLimiter
} from "../middleware/publicIPRateLimiter.js"
import { 
    userUpdateAppVersionRateLimiter,
    userGetCurrentAppVersionRateLimiter,
    userDeleteTicketsRateLimiter,
    userGetTicketsPerPageRateLimiter,
    userGetTicketsCountRateLimiter
} from "../middleware/userSpecificRateLimiter.js"

const sysRouter = express.Router()

sysRouter.post("/needToUpdate",
    publicNeedToUpdateRateLimiter,
    validate(needToUpdateSchema, "body"),
    sysController.needToUpate
)

sysRouter.post("/updateAppVersion",
    publicUpdateAppVersionRateLimiter,
    authenticate.session,
    authenticate.isAdmin,
    validate(updateAppVersionSchema, "body"),
    userUpdateAppVersionRateLimiter,
    sysController.updateAppVersion
)

sysRouter.get("/getCurrentAppVersion",
    publicGetCurrentAppVersionRateLimiter,
    authenticate.session,
    authenticate.isAdmin,
    userGetCurrentAppVersionRateLimiter,
    sysController.getCurrentAppVersion
)

sysRouter.get("/getAllBibleTextVersions",
    publicGetAllBibleTextVersionsRateLimiter,
    validate(getAllBibleTextVersionsSchema, "query"),
    sysController.getAllBibleTextVersions
)

sysRouter.get("/getBibleTextVersions",
    publicGetBibleTextVersionsRateLimiter,
    validate(getBibleTextVersionsSchema, "query"),
    sysController.getBibleTextVersions
)

sysRouter.get("/getAllLangs",
    publicGetAllLangsRateLimiter,
    sysController.getAllLangs
)

sysRouter.post("/createTicket",
    publicCreateTicketRateLimiter,
    validate(createTicketSchema, "body"),
    sysController.createTicket
)

sysRouter.delete("/deleteTickets",
    publicDeleteTicketsRateLimiter,
    validate(deleteTicketsSchema, "body"),
    authenticate.session,
    authenticate.isAdmin,
    userDeleteTicketsRateLimiter,
    sysController.deleteTickets
)

sysRouter.get("/getTicketsPerPage/:page",
    publicGetTicketsPerPageRateLimiter,
    validate(getTicketsPerPageSchema, "params"),
    authenticate.session,
    authenticate.isAdmin,
    userGetTicketsPerPageRateLimiter,
    sysController.getTicketsPerPage
)

sysRouter.get("/getTicketsCount",
    publicGetTicketsCountRateLimiter,
    authenticate.session,
    authenticate.isAdmin,
    userGetTicketsCountRateLimiter,
    sysController.getTicketsCount
)

export default sysRouter
