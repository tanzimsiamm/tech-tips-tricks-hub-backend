import express from 'express';
import { statisticsControllers } from './statistics.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.get('/overall', auth(USER_ROLES.ADMIN), statisticsControllers.getOverallStats);

export default router;