import { prisma, Prisma } from "../../lib/prisma"
import type { IGearItem, IGearItemQuery } from "./gearItem.interface"

const createGearItemInDB = async (payload: IGearItem, userId: string) => {

    const createdGearItem = { ...payload, userId }

    const result = await prisma.gearItem.create({
        data: {
            ...createdGearItem,
        },
        include: {
            category: true,
        },
    })

    return result
}

const getAllGearItemsFromDB = async (query: IGearItemQuery = {}) => {
    const { categoryId, search, maxPrice, minPrice, brand, stock, limit, page, sortBy, sortOrder } = query;
    // console.log(query)

    const paginationLimit = limit ? Number(limit) : 5;
    const paginationPage = page ? Number(page) : 1;
    const skip = (paginationPage - 1) * paginationLimit;

    const sortingOrder = sortOrder ? sortOrder : "desc";
    const sortingBy = sortBy ? sortBy : "createdAt";

    const andCondition: Prisma.GearItemWhereInput[] = []

    if (categoryId) {
        andCondition.push({
            categoryId: categoryId
        })
    }

    if (search) {
        andCondition.push({
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    brand: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
            ]
        })
    }

    if (maxPrice || minPrice) {
        andCondition.push({
            price: {
                ...(maxPrice && { lte: Number(maxPrice) }),
                ...(minPrice && { gte: Number(minPrice) }),
            }
        })
    }

    if (brand) {
        andCondition.push({
            brand: brand
        })
    }

    if (stock) {
        andCondition.push({
            stock: {
                gte: Number(stock)
            }
        })
    }

    const result = await prisma.gearItem.findMany({
        where: {
            AND: andCondition
        },

        take: paginationLimit,
        skip: skip,
        orderBy: {
            [sortingBy]: sortingOrder
        },

        include: {
            category: true
        }
    })
    return { result, page: paginationPage, limit: paginationLimit, total: result.length };
}

const getSingleGearItemFromDB = async (gearId: string) => {
    const result = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearId
        },
        include: {
            category: true
        }
    })
    return result;
}

const updateGearItemInDB = async (payload: Partial<IGearItem>, gearId: string, userId: string) => {

    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearId
        }
    })

    if (gearItem.userId !== userId) {
        throw new Error("You are not authorized to update this gear item");
    }

    const result = await prisma.gearItem.update({
        where: {
            id: gearId,
        },
        data: {
            ...payload
        },
        include: {
            category: true,
        },
    })
    return result
}

const deleteGearItemFromDB = async (gearId: string, userId: string) => {

    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: {
            id: gearId
        }
    });

    if (gearItem.userId !== userId) {
        throw new Error("You are not authorized to delete this gear item")
    }

    const result = await prisma.gearItem.delete({
        where: {
            id: gearId
        }
    })
    return null
}

const getProvidersGearItemsFromDB = async (providerId: string, query: IGearItemQuery = {}) => {
    const { categoryId, search, maxPrice, minPrice, brand, stock, limit, page, sortBy, sortOrder } = query;

    const paginationLimit = limit ? Number(limit) : 5;
    const paginationPage = page ? Number(page) : 1;
    const skip = (paginationPage - 1) * paginationLimit;

    const sortingOrder = sortOrder ? sortOrder : "desc";
    const sortingBy = sortBy ? sortBy : "createdAt";

    const andCondition: Prisma.GearItemWhereInput[] = [
        {
            userId: providerId
        }
    ]

    if (categoryId) {
        andCondition.push({
            categoryId: categoryId
        })
    }

    if (search) {
        andCondition.push({
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    brand: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
            ]
        })
    }

    if (maxPrice || minPrice) {
        andCondition.push({
            price: {
                ...(maxPrice && { lte: Number(maxPrice) }),
                ...(minPrice && { gte: Number(minPrice) }),
            }
        })
    }

    if (brand) {
        andCondition.push({
            brand: brand
        })
    }

    if (stock) {
        andCondition.push({
            stock: {
                gte: Number(stock)
            }
        })
    }

    const total = await prisma.gearItem.count({
        where: {
            AND: andCondition
        }
    });

    const result = await prisma.gearItem.findMany({
        where: {
            AND: andCondition
        },

        take: paginationLimit,
        skip: skip,
        orderBy: {
            [sortingBy]: sortingOrder
        },

        include: {
            category: true
        }
    })
    return { result, page: paginationPage, limit: paginationLimit, total };
}

export const gearItemService = {
    createGearItemInDB,
    getAllGearItemsFromDB,
    getSingleGearItemFromDB,
    updateGearItemInDB,
    deleteGearItemFromDB,
    getProvidersGearItemsFromDB
}