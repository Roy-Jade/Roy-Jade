import express from "express"
import { checkAuth } from '../middleware/checkAuth.js';
import { getOverview } from "../controller/cv/dashboardController.js";
import { postExperience, patchExperience } from "../controller/cv/experienceController.js";
import { postFormation, patchFormation } from "../controller/cv/formationController.js";
import { postHardskill, patchHardskill } from "../controller/cv/hardskillController.js";
import { patchIdentity } from "../controller/cv/identityController.js";
import { postSoftskill, patchSoftskill } from "../controller/cv/softskillController.js";
import { postLanguage, patchLanguage } from "../controller/cv/languageController.js";
import { patchHobby, postHobby } from "../controller/cv/hobbyController.js";

const dashboardRouter = express.Router()

dashboardRouter.get('/', checkAuth, getOverview)
dashboardRouter.post('/experience', checkAuth, postExperience);
dashboardRouter.post('/formation', checkAuth, postFormation);
dashboardRouter.post('/hardskill', checkAuth, postHardskill);
dashboardRouter.post('/softskill', checkAuth, postSoftskill);
dashboardRouter.post('/language', checkAuth, postLanguage);
dashboardRouter.post('/hobby', checkAuth, postHobby);
dashboardRouter.patch('/identity', checkAuth, patchIdentity)
dashboardRouter.patch('/experience/:id', checkAuth, patchExperience)
dashboardRouter.patch('/formation/:id', checkAuth, patchFormation)
dashboardRouter.patch('/hardskill/:id', checkAuth, patchHardskill)
dashboardRouter.patch('/softskill/:id', checkAuth, patchSoftskill)
dashboardRouter.patch('/language/:id', checkAuth, patchLanguage)
dashboardRouter.patch('/hobby/:id', checkAuth, patchHobby)

export default dashboardRouter