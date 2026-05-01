import express from "express"
import { getIdentity } from "../controller/cv/identityController.js";
import { getHardskill } from "../controller/cv/hardskillController.js";
import { getExperience } from "../controller/cv/experienceController.js";
import { getFormation } from "../controller/cv/formationController.js";
import { getProfile } from "../controller/cv/profileController.js"

const cvRouter = express.Router()

cvRouter.get('/identity', getIdentity);
cvRouter.get('/hardskill', getHardskill);
cvRouter.get('/profile', getProfile);
cvRouter.get('/experience', getExperience)
cvRouter.get('/formation', getFormation)

export default cvRouter