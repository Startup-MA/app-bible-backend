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
import { 
    publicSkipPersonalInfoRateLimiter,
    publicUpdateProfileRateLimiter,
    publicDeleteAccountRateLimiter,
    publicCreateOrUpdateUserTopicsRateLimiter,
    publicGetUserTopicsRateLimiter,
    publicGenerateDailyVersePrayerRateLimiter,
    publicGetUserDailyPrayerTranslationRateLimiter,
    publicGetUserDailyVersePrayerRateLimiter,
    publicSyncBookmarksRateLimiter,
    publicGetUserBookmarksRateLimiter,
    publicSyncNotesRateLimiter,
    publicGetUserNotesRateLimiter,
    publicSyncUserReadingHistoryRateLimiter,
    publicGetUserReadingHistoryRateLimiter,
    publicSyncHighlightsRateLimiter,
    publicGetUserHighlightsRateLimiter,
    publicSyncPrayersRateLimiter,
    publicGetUserPrayersRateLimiter
} from "../middleware/publicIPRateLimiter.js"
import {
    userSkipPersonalInfoRateLimiter,
    userUpdateProfileRateLimiter,
    userDeleteAccountRateLimiter,
    userCreateOrUpdateUserTopicsRateLimiter,
    userGetUserTopicsRateLimiter,
    userGenerateDailyVersePrayerRateLimiter,
    userGetUserDailyPrayerTranslationRateLimiter,
    userGetUserDailyVersePrayerRateLimiter,
    userSyncBookmarksRateLimiter,
    userGetUserBookmarksRateLimiter,
    userSyncNotesRateLimiter,
    userGetUserNotesRateLimiter,
    userSyncUserReadingHistoryRateLimiter,
    userGetUserReadingHistoryRateLimiter,
    userSyncHighlightsRateLimiter,
    userGetUserHighlightsRateLimiter,
    userSyncPrayersRateLimiter,
    userGetUserPrayersRateLimiter
} from "../middleware/userSpecificRateLimiter.js"
import { getHighlightsSchema } from "../validation/schemas/getHighlights.schema.js"
import { cache } from "../middleware/cache.js"

const userRouter = express.Router()

userRouter.patch("/skipPersonalInfo", 
    publicSkipPersonalInfoRateLimiter,
    authenticate.session,
    userSkipPersonalInfoRateLimiter,
    userController.skipPersonalInfo
)

userRouter.patch("/updateProfile",
    publicUpdateProfileRateLimiter,
    authenticate.session,
    validate(updateProfileSchema, "body"),
    userUpdateProfileRateLimiter,
    userController.updateProfile
)

userRouter.delete("/deleteAccount",
    publicDeleteAccountRateLimiter,
    authenticate.session,
    userDeleteAccountRateLimiter,
    userController.deleteAccount
)

//Verses and prayers

userRouter.post("/createOrUpdateUserTopics",
    publicCreateOrUpdateUserTopicsRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(createOrUpdateUserTopicsSchema, "body"),
    userCreateOrUpdateUserTopicsRateLimiter,
    userController.createOrUpdateUserTopics
)
userRouter.get("/getUserTopics",
    publicGetUserTopicsRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    cache(600, (req) => `user:${req.session.user.id}:${req.originalUrl}`),
    userGetUserTopicsRateLimiter,
    userController.getUserTopics
)

userRouter.post("/generateDailyVersePrayer",
    publicGenerateDailyVersePrayerRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(generateDailyVersePrayerSchema, "body"),
    userGenerateDailyVersePrayerRateLimiter,
    userController.generateDailyVersePrayer
)
userRouter.post("/getUserDailyPrayerTranslation",
    publicGetUserDailyPrayerTranslationRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(getUserDailyPrayerTranslationSchema, "body"),
    userGetUserDailyPrayerTranslationRateLimiter,
    userController.getUserDailyPrayerTranslation
)
userRouter.get("/getUserDailyVersePrayer",
    publicGetUserDailyVersePrayerRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    cache(600, (req) => `user:${req.session.user.id}:${req.originalUrl}`),
    userGetUserDailyVersePrayerRateLimiter,
    userController.getUserDailyVersePrayer
)

userRouter.post("/syncBookmarks",
    publicSyncBookmarksRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(syncBookmarksSchema, "body"),
    userSyncBookmarksRateLimiter,
    userController.syncBookmarks
)
userRouter.get("/getUserBookmarks",
    publicGetUserBookmarksRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(getUserBookmarksSchema, "query"),
    userGetUserBookmarksRateLimiter,
    userController.getUserBookmarks
)

userRouter.post("/syncNotes",
    publicSyncNotesRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(syncNotesSchema, "body"),
    userSyncNotesRateLimiter,
    userController.syncNotes
)
userRouter.get("/getUserNotes",
    publicGetUserNotesRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(getUserNotesSchema, "query"),
    userGetUserNotesRateLimiter,
    userController.getUserNotes
)

userRouter.post("/syncUserReadingHistory",
    publicSyncUserReadingHistoryRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(syncUserReadingHistorySchema, "body"),
    userSyncUserReadingHistoryRateLimiter,
    userController.syncUserReadingHistory
)
userRouter.get("/getUserReadingHistory",
    publicGetUserReadingHistoryRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    cache(600, (req) => `user:${req.session.user.id}:${req.originalUrl}`),
    userGetUserReadingHistoryRateLimiter,
    userController.getUserReadingHistory
)

userRouter.post("/syncHighlights",
    publicSyncHighlightsRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(syncHighlightsSchema, "body"),
    userSyncHighlightsRateLimiter,
    userController.syncHighlights
)
userRouter.get("/getUserHighlights",
    publicGetUserHighlightsRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(getHighlightsSchema, "query"),
    userGetUserHighlightsRateLimiter,
    userController.getUserHighlights
)

userRouter.post("/syncPrayers",
    publicSyncPrayersRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(syncPrayersSchema, "body"),
    userSyncPrayersRateLimiter,
    userController.syncPrayers
)
userRouter.get("/getUserPrayers",
    publicGetUserPrayersRateLimiter,
    authenticate.session,
    authenticate.userMobile,
    validate(getUserPrayersSchema, "query"),
    userGetUserPrayersRateLimiter,
    userController.getUserPrayers
)

export default userRouter