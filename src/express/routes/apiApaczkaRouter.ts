import express, { Router } from "express";
import { orderValuation } from "../controllers/orderValuation";
import { orderSend } from "../controllers/orderSend";
import { customerRegister } from "../controllers/customerRegister";
import { serviceStructure } from "../controllers/serviceStructure";

const router: Router = express.Router();

router.post("/customer-register", customerRegister);
router.post("/order-valuation", orderValuation);
router.post("/order-send", orderSend);
router.get("/service-structure", serviceStructure);

export default router;
