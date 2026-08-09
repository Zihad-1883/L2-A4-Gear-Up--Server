import { Router } from "express";
import { paymentsController } from "./payments.controller";
import { auth } from "../../milddlewares/auth";
import { Role } from "../../lib/prisma";

const router = Router();

// Create payment intent/session for a rental order (Customer only)
router.post("/create", auth(Role.CUSTOMER), paymentsController.initiatePayment);

// Confirm/verify payment (webhook or callback)
router.post("/confirm", paymentsController.confirmPayment);
router.post("/webhook", paymentsController.handleWebhook);
router.post("/success", paymentsController.handleSuccessRedirect);
router.post("/fail", paymentsController.handleFailRedirect);
router.post("/cancel", paymentsController.handleCancelRedirect);

// Get customer's payment history & details (Customer only)
router.get("/", auth(Role.CUSTOMER), paymentsController.getMyPaymentHistory);
router.get("/:id", auth(Role.CUSTOMER), paymentsController.getSinglePaymentDetails);

export const paymentsRouter = router;
