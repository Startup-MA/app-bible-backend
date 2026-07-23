import express from "express"
import authenticate from "../middleware/authenticate.js"
import validate from "../middleware/validation.js"
import userController from "../controllers/user.js"
import { updateProfileSchema } from "../validation/schemas/updateProfile.schema.js"
import { createOrUpdateUserTopicsSchema } from "../validation/schemas/createOrUpdateUserTopics.schema.js"
import { syncBookmarksSchema, getUserBookmarksSchema } from "../validation/schemas/bookmark.schema.js"
import { syncNotesSchema, getUserNotesSchema } from "../validation/schemas/note.schema.js"
import { syncUserReadingHistorySchema } from "../validation/schemas/user.reading.history.schema.js"
import { syncHighlightsSchema } from "../validation/schemas/highlight.schema.js"
import { syncPraylistSchema, getUserPraylistSchema } from "../validation/schemas/praylist.schema.js"

const userRouter = express.Router()

userRouter.patch("/skipPersonalInfo", authenticate.session, userController.skipPersonalInfo)
userRouter.patch("/updateProfile", authenticate.session, validate(updateProfileSchema, "body"), userController.updateProfile)

userRouter.use(authenticate.session)
userRouter.use(authenticate.userMobile)

userRouter.post("/createOrUpdateUserTopics", validate(createOrUpdateUserTopicsSchema, "body"), userController.createOrUpdateUserTopics)

userRouter.post("/syncBookmarks", validate(syncBookmarksSchema, "body"), userController.syncBookmarks)
userRouter.get("/getUserBookmarks", validate(getUserBookmarksSchema, "body"), userController.getUserBookmarks)

userRouter.post("/syncNotes", validate(syncNotesSchema, "body"), userController.syncNotes)
userRouter.get("/getUserNotes", validate(getUserNotesSchema, "body"), userController.getUserNotes)

userRouter.post("/syncUserReadingHistory", validate(syncUserReadingHistorySchema, "body"), userController.syncUserReadingHistory)
userRouter.get("/getUserReadingHistory", userController.getUserReadingHistory)

userRouter.post("/syncHighlights", validate(syncHighlightsSchema, "body"), userController.syncHighlights)
userRouter.get("/getUserHighlights", userController.getUserHighlights)

userRouter.post("/syncPraylist", validate(syncPraylistSchema, "body"), userController.syncPraylist)
userRouter.get("/getUserPraylist", validate(getUserPraylistSchema, "body"), userController.getUserPraylist)

export default userRouter