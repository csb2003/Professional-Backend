import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken,getCurrentUser,changeCurrentPassword,updateUserDetails,updateUserAvatar,getUserChannelProfile,updateUsercoverImage} from "../controllers/user.controller.js"
import {upload}  from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    //multer middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes-
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-user-details").patch(verifyJWT,updateUserDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUsercoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
export default router