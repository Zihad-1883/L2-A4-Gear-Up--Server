import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utilis/catchAsync";
import { paymentsService } from "./payments.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";

import config from "../../config";

const initiatePayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { rentalOrderId } = req.body;
    const customerId = req.user?.id as string;

    if (!rentalOrderId) {
        throw new Error("rentalOrderId is required");
    }

    const result = await paymentsService.initiatePaymentIntoDB(rentalOrderId, customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment session created successfully",
        data: result,
    });
});

const confirmPayment = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result = await paymentsService.validatePaymentInDB(payload);
        const frontendUrl = process.env.FRONTEND_URL || config.FRONTEND_URL || "http://localhost:3000";

        if (result && result.paymentStatus === "COMPLETED") {
            return res.redirect(`${frontendUrl}/dashboard/customer/orders?payment=success`);
        } else {
            return res.redirect(`${frontendUrl}/dashboard/customer/orders?payment=failed`);
        }
    } catch (error) {
        console.error("Payment confirmation error:", error);
        const frontendUrl = process.env.FRONTEND_URL || config.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/dashboard/customer/orders?payment=error`);
    }
};

const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await paymentsService.validatePaymentInDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment status updated via SSLCommerz callback",
        data: result,
    });
});

const handleSuccessRedirect = confirmPayment;
const handleFailRedirect = confirmPayment;
const handleCancelRedirect = confirmPayment;

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await paymentsService.getMyPaymentHistoryFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history fetched successfully",
        data: result,
    });
});

const getSinglePaymentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const paymentId = req.params.id as string;

    const result = await paymentsService.getSinglePaymentDetailsFromDB(paymentId, customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details fetched successfully",
        data: result,
    });
});

export const paymentsController = {
    initiatePayment,
    confirmPayment,
    handleWebhook,
    handleSuccessRedirect,
    handleFailRedirect,
    handleCancelRedirect,
    getMyPaymentHistory,
    getSinglePaymentDetails,
};
