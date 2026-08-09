import type { Request, Response, NextFunction } from "express";
import catchAsync from "../../utilis/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";
import type { IUser, IUserStatus } from "./user.interface";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await userService.getMyProfileFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getAllUsersFromDB();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params as { userId: string };
    const payload = req.body.userStatus as IUserStatus;
    const result = await userService.updateUserStatusInDB(userId, payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
  getAllUsers,
  updateUserStatus,
};
