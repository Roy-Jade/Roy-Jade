import express from "express"
import { checkAuth } from '../middleware/checkAuth.js';
import { getOverview } from "../controller//cv/dashboardController.js";
import { addExperience, editExperience } from "../controller/cv/experienceController.js";
import { addFormation, editFormation } from "../controller/cv/formationController.js";
import { addHardskill, editHardskill } from "../controller/cv/hardskillController.js";
import { editIdentity } from "../controller/cv/identityController.js";
import { addSoftskill, editSoftskill } from "../controller/cv/softskillController.js";

const dashboardRouter = express.Router()

dashboardRouter.get('/', checkAuth, getOverview)
dashboardRouter.post('/experience', checkAuth, addExperience);
dashboardRouter.post('/formation', checkAuth, addFormation);
dashboardRouter.post('/hardskill', checkAuth, addHardskill);
dashboardRouter.post('/softskill', checkAuth, addSoftskill)
dashboardRouter.patch('/identity', checkAuth, editIdentity)
dashboardRouter.patch('/experience/:id', checkAuth, editExperience)
dashboardRouter.patch('/formation/:id', checkAuth, editFormation)
dashboardRouter.patch('/hardskill/:id', checkAuth, editHardskill)
dashboardRouter.patch('/softskill/:id', checkAuth, editSoftskill)

export default dashboardRouter