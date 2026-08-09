import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utilis/catchAsync";
import { gearItemService } from "./gearItem.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status"

const createGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const userId = req.user?.id
    const result = await gearItemService.createGearItemInDB(payload, userId!);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear Item created successfully",
        data: result
    })
})

const getAllGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    // const { page, limit } = query
    const data = await gearItemService.getAllGearItemsFromDB(query);
    // console.log(result.length)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear Items fetched successfully",
        data: data.result,
        meta: {
            page: Number(data.page),
            limit: Number(data.limit),
            total: Number(data.total)
        }
    })
})

const getSingleGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.gearId;
    const result = await gearItemService.getSingleGearItemFromDB(gearId as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear Item fetched successfully",
        data: result
    })
})

const updateGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const gearId = req.params.gearId as string;
    const userId = req.user?.id as string;

    const result = await gearItemService.updateGearItemInDB(payload, gearId, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear Item updated successfully",
        data: result
    })
})

const deleteGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.gearId as string;
    const userId = req.user?.id as string
    const result = await gearItemService.deleteGearItemFromDB(gearId, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear Item deleted successfully",
        data: result
    })
})

const getProvidersGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    if (!providerId) {
        throw new Error("Provider ID is required");
    }
    const query = req.query;
    const data = await gearItemService.getProvidersGearItemsFromDB(providerId, query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Provider Gear Items fetched successfully",
        data: data.result,
        meta: {
            page: Number(data.page),
            limit: Number(data.limit),
            total: Number(data.total)
        }
    })
})

export const gearItemController = {
    createGearItem,
    getAllGearItems,
    getSingleGearItem,
    updateGearItem,
    deleteGearItem,
    getProvidersGearItems
}


