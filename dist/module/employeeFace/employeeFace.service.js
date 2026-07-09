import { prisma } from "../../lib/prisma.js";
// export const registerEmployeeFaceService = async (
//  employeeId: number,
//   imageUrl: string,
//   publicId: string,
//   embedding: number[],
// ) => {
//   const employee = await prisma.employee.findUnique({
//     where: {
//       id: employeeId,
//     },
//   });
//   if (!employee) {
//     throw new Error("Employee not found");
//   }
//   const existing = await prisma.employeeFace.findUnique({
//     where: {
//       employeeId,
//     },
//   });
//   if (existing) {
//     return prisma.employeeFace.update({
//       where: {
//         employeeId,
//       },
//       data: {
//         imageUrl,
//         embedding,
//       },
//     });
//   }
//   return prisma.employeeFace.create({
//     data: {
//       employeeId,
//       imageUrl,
//       embedding,
//     },
//   });
// };
// =========================================Register===================================
export const registerEmployeeFaceService = async (employeeId, imageUrl, publicId, embedding) => {
    const [employee, existing] = await Promise.all([
        prisma.employee.findUnique({
            where: {
                id: employeeId,
            },
        }),
        prisma.employeeFace.findUnique({
            where: {
                employeeId,
            },
        }),
    ]);
    if (!employee) {
        throw new Error("Employee not found");
    }
    if (existing) {
        return prisma.employeeFace.update({
            where: {
                employeeId,
            },
            data: {
                imageUrl,
                publicId,
                embedding,
            },
        });
    }
    return prisma.employeeFace.create({
        data: {
            employeeId,
            imageUrl,
            publicId,
            embedding,
        },
    });
};
// =====================================find employeeface==========================
export const findEmployeeFace = async (employeeId) => {
    return prisma.employeeFace.findUnique({
        where: {
            employeeId,
        },
    });
};
// =================================get employee============================
export const getEmployeeFaceService = async (employeeId) => {
    const face = await prisma.employeeFace.findUnique({
        where: {
            employeeId,
        },
    });
    if (!face) {
        throw new Error("Face not registered");
    }
    return face;
};
// ==================================delete=============================
export const deleteEmployeeFaceService = async (employeeId) => {
    return prisma.employeeFace.delete({
        where: {
            employeeId,
        },
    });
};
