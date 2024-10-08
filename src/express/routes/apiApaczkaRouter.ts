import express, { Router } from "express";
import { orderValuation } from "../controllers/orderValuation";
import { orderSend } from "../controllers/orderSend";

const router: Router = express.Router();

router.post("/order-valuation", orderValuation);
router.post("/order-send", orderSend);

export default router;
