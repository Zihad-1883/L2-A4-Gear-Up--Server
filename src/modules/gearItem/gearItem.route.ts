import { Router } from "express";
import { gearItemController } from "./gearItem.controller";
import { auth } from "../../milddlewares/auth";
import { Role } from "../../lib/prisma";

import { reviewController } from "../review/review.controller";

const providerRouter = Router();
const gearRouter = Router()

providerRouter.get("/", auth(Role.PROVIDER), gearItemController.getProvidersGearItems);
providerRouter.post("/", auth(Role.PROVIDER), gearItemController.createGearItem);
providerRouter.patch("/:gearId", auth(Role.PROVIDER), gearItemController.updateGearItem);
providerRouter.delete("/:gearId", auth(Role.PROVIDER), gearItemController.deleteGearItem);

gearRouter.get("/", gearItemController.getAllGearItems);
gearRouter.get("/:gearId", gearItemController.getSingleGearItem);
gearRouter.get("/:gearId/reviews", reviewController.getReviewsForGear);



export const geatItemRouter = {
    providerRouter,
    gearRouter
}