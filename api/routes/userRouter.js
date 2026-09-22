import express from "express"
import authenticate from "../middleware/authenticate.js"
import validate from "../middleware/validation.js"
import userController from "../controllers/user.js"
import { updateProfileSchema } from "../validation/schemas/updateProfile.schema.js"
import { createOrUpdateUserTopicsSchema } from "../validation/schemas/createOrUpdateUserTopics.schema.js"
import { generateDailyVersePrayerSchema } from "../validation/schemas/generateDailyVersePrayer.schema.js"
import { getUserDailyPrayerTranslationSchema } from "../validation/schemas/getUserDailyPrayerTranslation.schema.js"
import { syncBookmarksSchema, getUserBookmarksSchema } from "../validation/schemas/bookmark.schema.js"
import { syncNotesSchema, getUserNotesSchema } from "../validation/schemas/note.schema.js"
import { syncUserReadingHistorySchema } from "../validation/schemas/user.reading.history.schema.js"
import { syncHighlightsSchema } from "../validation/schemas/highlight.schema.js"
import { syncPrayersSchema, getUserPrayersSchema } from "../validation/schemas/prayers.schema.js"
import { publicGenerateDailyVersePrayerRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { getHighlightsSchema } from "../validation/schemas/getHighlights.schema.js"

const userRouter = express.Router()

userRouter.patch("/skipPersonalInfo", authenticate.session, userController.skipPersonalInfo)
userRouter.patch("/updateProfile", authenticate.session, validate(updateProfileSchema, "body"), userController.updateProfile)

userRouter.delete("/deleteAccount", authenticate.session, userController.deleteAccount)

userRouter.use(authenticate.session)
userRouter.use(authenticate.userMobile)

userRouter.post("/createOrUpdateUserTopics", validate(createOrUpdateUserTopicsSchema, "body"), userController.createOrUpdateUserTopics)
userRouter.get("/getUserTopics", userController.getUserTopics)

userRouter.post("/generateDailyVersePrayer", validate(generateDailyVersePrayerSchema, "body"), userController.generateDailyVersePrayer)
userRouter.post("/getUserDailyPrayerTranslation", validate(getUserDailyPrayerTranslationSchema, "body"), userController.getUserDailyPrayerTranslation)
userRouter.get("/getUserDailyVersePrayer", userController.getUserDailyVersePrayer)

userRouter.post("/syncBookmarks", validate(syncBookmarksSchema, "body"), userController.syncBookmarks)
userRouter.get("/getUserBookmarks", validate(getUserBookmarksSchema, "query"), userController.getUserBookmarks)

userRouter.post("/syncNotes", validate(syncNotesSchema, "body"), userController.syncNotes)
userRouter.get("/getUserNotes", validate(getUserNotesSchema, "query"), userController.getUserNotes)

userRouter.post("/syncUserReadingHistory", validate(syncUserReadingHistorySchema, "body"), userController.syncUserReadingHistory)
userRouter.get("/getUserReadingHistory", userController.getUserReadingHistory)

userRouter.post("/syncHighlights", validate(syncHighlightsSchema, "body"), userController.syncHighlights)
userRouter.get("/getUserHighlights", validate(getHighlightsSchema, "query"), userController.getUserHighlights)

userRouter.post("/syncPrayers", validate(syncPrayersSchema, "body"), userController.syncPrayers)
userRouter.get("/getUserPrayers", validate(getUserPrayersSchema, "query"), userController.getUserPrayers)

export default userRouter