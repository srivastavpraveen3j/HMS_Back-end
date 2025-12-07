// routes/corporate.routes.js
import express from 'express';
const router = express.Router();
// const corporateController = require('../controllers/corporate.controller');
import { getAll, getById, create, update, remove } from "../controllers/Corporate.js"

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
