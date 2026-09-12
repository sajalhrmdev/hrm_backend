import { OfficeLocationStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

// form inputs arrive as strings — coerce for Float?/Int? columns.
// "" / null / undefined -> undefined (field left unchanged)
const toFloatOrUndef = (v: any, field: string): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Invalid ${field} — must be a number`);
  return n;
};

const toIntOrUndef = (v: any, field: string): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) {
    throw new Error(`Invalid ${field} — must be a whole number`);
  }
  return n;
};

export const createOfficeLocationService = async (
  companyId: number,
  payload: any,
) => {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });
  if (!company) {
    throw new Error("company not found");
  }
  return await prisma.officeLocation.create({
    data: {
      companyId,

      name: payload.name,

      address: payload.address,

      city: payload.city,

      state: payload.state,

      country: payload.country,

      pinCode: payload.pinCode,

      latitude: payload.latitude ? Number(payload.latitude) : null,

      longitude: payload.longitude ? Number(payload.longitude) : null,

      radius: payload.radius ? Number(payload.radius) : 100,
      status: OfficeLocationStatus.ACTIVE,
    },
  });
};

export const getAllOfficeLocationsService = async (companyId: number) => {
  return await prisma.officeLocation.findMany({
    where: {
      companyId,
      status: OfficeLocationStatus.ACTIVE,
    },
    orderBy: {
      id: "desc",
    },
  });
};

export const getOfficeLocationByIdService = async (
  companyId: number,
  id: number,
) => {
  const location = await prisma.officeLocation.findFirst({
    where: {
      companyId,
      id,
    },
  });
  if (!location) {
    throw new Error("Office location not found");
  }
  return location;
};

export const updateOfficeLocationService = async (
  companyId: number,
  id: number,
  payload: any,
) => {
  const location = await prisma.officeLocation.findFirst({
    where: {
      companyId,
      id,
    },
  });
  if (!location) {
    throw new Error("Office location not found");
  }
  return await prisma.officeLocation.update({
    where: {
      id,
    },
    data: {
      name: payload.name,

      address: payload.address,

      city: payload.city,

      state: payload.state,

      country: payload.country,

      pinCode: payload.pinCode,

      latitude: toFloatOrUndef(payload.latitude, "latitude"),

      longitude: toFloatOrUndef(payload.longitude, "longitude"),

      radius: toIntOrUndef(payload.radius, "radius"),

      status:
        payload.status === OfficeLocationStatus.ACTIVE ||
        payload.status === OfficeLocationStatus.INACTIVE
          ? payload.status
          : location.status,
    },
  });
};

export const deleteOfficeLocationService = async (
  companyId: number,
  id: number,
) => {
  const location = await prisma.officeLocation.findFirst({
    where: {
      companyId,
      id,
    },
  });

  if (!location) {
    throw new Error("Office location not found");
  }
  return await prisma.officeLocation.update({
    where: {
      id,
    },
    data: {
      status: OfficeLocationStatus.INACTIVE,
    },
  });
};

// ======================================
// COMPANY
// ======================================

export const getMyAllOfficeLocationsService = async (companyId: number) => {
  return await prisma.officeLocation.findMany({
    where: {
      companyId,

      status: OfficeLocationStatus.ACTIVE,
    },

    orderBy: {
      id: "desc",
    },
  });
};

export const getMyOfficeLocationByIdService = async (
  companyId: number,
  id: number,
) => {
  const location = await prisma.officeLocation.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!location) {
    throw new Error("Office location not found");
  }

  return location;
};

export const updateMyOfficeLocationService = async (
  companyId: number,
  id: number,
  payload: any,
) => {
  const location = await prisma.officeLocation.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!location) {
    throw new Error("Office location not found");
  }

  return await prisma.officeLocation.update({
    where: {
      id,
    },

    data: {
      name: payload.name,

      address: payload.address,

      city: payload.city,

      state: payload.state,

      country: payload.country,

      pinCode: payload.pinCode,

      latitude: toFloatOrUndef(payload.latitude, "latitude"),

      longitude: toFloatOrUndef(payload.longitude, "longitude"),

      radius: toIntOrUndef(payload.radius, "radius"),
    },
  });
};
