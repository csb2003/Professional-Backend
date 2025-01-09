import {upload}  from "../middlewares/multer.middleware.js"
import { Router } from "express"

import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAvideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router()
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/getallvideos').get(getAllVideos)
router.route('/publish-video').post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAvideo
)

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router