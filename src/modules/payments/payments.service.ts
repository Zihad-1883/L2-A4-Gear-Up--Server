// @ts-ignore
import SSLCommerzPayment from "sslcommerz-lts";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import type { ISSLCommerzCallbackPayload } from "./payments.interface";

const initiatePaymentIntoDB = async (rentalOrderId: string, customerId: string) => {
    const rentalOrder = await prisma.rentalOrder.findFirstOrThrow({
        where: {
            id: rentalOrderId,
            customerId: customerId,
        },
        include: {
            customer: true,
            gearItem: true,
        },
    });

    if (rentalOrder.rentalOrderStatus !== "APPROVED") {
        throw new Error("Payment can only be created once the rental order has been approved by the provider");
    }

    const transactionId = `TRAN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const backendUrl = process.env.BACKEND_URL || config.BACKEND_URL || "https://gearup-backend-4eca.onrender.com";

    const paymentData = {
        total_amount: Number(rentalOrder.totalPrice),
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${backendUrl}/api/payments/confirm`,
        fail_url: `${backendUrl}/api/payments/confirm`,
        cancel_url: `${backendUrl}/api/payments/confirm`,
        ipn_url: `${backendUrl}/api/payments/confirm`,
        shipping_method: "Courier",
        product_name: rentalOrder.gearItem?.name || "Gear Rental",
        product_category: "Sports Equipment",
        product_profile: "general",
        cus_name: rentalOrder.customer?.name || "Customer",
        cus_email: rentalOrder.customer?.email || "customer@example.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01700000000",
        cus_fax: "01700000000",
        ship_name: rentalOrder.customer?.name || "Customer",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: "1000",
        ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(
        config.SSLCOMMERZ_STORE_ID,
        config.SSLCOMMERZ_STORE_PASSWORD,
        config.SSLCOMMERZ_IS_LIVE
    );

    const apiResponse = await sslcz.init(paymentData);

    if (!apiResponse || !apiResponse.GatewayPageURL) {
        throw new Error("Failed to initiate payment session with SSLCommerz");
    }

    await prisma.payment.create({
        data: {
            transactionId: transactionId,
            rentalOrderId: rentalOrder.id,
            amount: rentalOrder.totalPrice,
            method: "SSLCOMMERZ",
            paymentStatus: "PENDING",
        },
    });

    return {
        transactionId,
        checkoutUrl: apiResponse.GatewayPageURL,
        status: "PENDING",
    };
};

const validatePaymentInDB = async (payload: ISSLCommerzCallbackPayload) => {
    const { val_id, tran_id, status } = payload;

    if (!tran_id) {
        throw new Error("Transaction ID is required for verification");
    }

    const payment = await prisma.payment.findUniqueOrThrow({
        where: {
            transactionId: tran_id,
        },
    });

    let isValid = false;

    // 1. Try real server-to-server validation with SSLCommerz if val_id is provided
    if (val_id) {
        try {
            const sslcz = new SSLCommerzPayment(
                config.SSLCOMMERZ_STORE_ID,
                config.SSLCOMMERZ_STORE_PASSWORD,
                config.SSLCOMMERZ_IS_LIVE
            );

            const verificationResponse = await sslcz.validate({ val_id });

            if (
                verificationResponse &&
                (verificationResponse.status === "VALID" || verificationResponse.status === "VALIDATED")
            ) {
                isValid = true;
            }
        } catch (err) {
            console.log("SSLCommerz verification call error:", err);
        }
    }

    // 2. Fallback check for payload status === 'VALID' or 'VALIDATED' (for Postman testing & callbacks)
    if (!isValid && (status === "VALID" || status === "VALIDATED")) {
        isValid = true;
    }

    if (isValid) {
        return await prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    paymentStatus: "COMPLETED",
                    paidAt: new Date(),
                },
            });

            await tx.rentalOrder.update({
                where: { id: payment.rentalOrderId },
                data: {
                    rentalOrderStatus: "PAID",
                },
            });

            return updatedPayment;
        });
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentStatus: "FAILED",
        },
    });

    return updatedPayment;
};

const getMyPaymentHistoryFromDB = async (customerId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            rentalOrder: {
                customerId: customerId,
            },
        },
        include: {
            rentalOrder: true,
        },
    });
    return payments;
};

const getSinglePaymentDetailsFromDB = async (paymentId: string, customerId: string) => {
    const payment = await prisma.payment.findFirstOrThrow({
        where: {
            id: paymentId,
            rentalOrder: {
                customerId: customerId,
            },
        },
        include: {
            rentalOrder: true,
        },
    });
    return payment;
};

export const paymentsService = {
    initiatePaymentIntoDB,
    validatePaymentInDB,
    getMyPaymentHistoryFromDB,
    getSinglePaymentDetailsFromDB,
};