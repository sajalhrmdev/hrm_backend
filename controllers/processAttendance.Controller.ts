// import { processAttendanceForDate } from "../services/handleAttendance/attendance.processor.js";

// export const processAttendanceController = async (req, res) => {
//   try {
//     const companyId = req.companyId;

//     const { date } = req.body;

//     await processAttendanceForDate(
//       companyId,

//       new Date(date),
//     );

//     res.json({
//       success: true,

//       message: "Attendance processed",
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };


// ======================================================
// CONTROLLER
// ======================================================

// controllers/processAttendance.controller.ts

import {
  Request,
  Response,
} from "express";
import { processAttendance } from "../services/handleAttendance/attendance.processor.js";
import getStartEndOfDay from "../utils/getStartEndOfDay.js";
// import { processAttendanceForShift } from "../services/handleAttendance/attendance.processor.js";


// ======================================================

interface AuthRequest
  extends Request {

  companyId?:number;
}

// ======================================================

// export const processAttendanceController =
//   async (
//     req:AuthRequest,
//     res:Response
//   ) => {

//     try {

//       const companyId =
//         req.companyId;

//       if (!companyId) {

//         throw new Error(
//           "Company not found"
//         );
//       }

//       const {

//         shiftId,

//         date,
//       } = req.body;

//       if (!shiftId) {

//         throw new Error(
//           "Shift required"
//         );
//       }

//       const result =
//         await processAttendanceForShift({

//           companyId,

//           shiftId:
//             Number(shiftId),

//           date:
//             date

//               ? new Date(date)

//               : new Date(),
//         });

//       res.json({

//         success:true,

//         message:
//           "Attendance processed successfully",

//         data:result,
//       });

//     } catch (err:any) {

//       res.status(400).json({

//         success:false,

//         message:
//           err.message,
//       });
//     }
//   };

  // export const processAttendanceController =
  // async (
  //   req: AuthRequest,
  //   res: Response
  // ) => {
  //   try {

  //     const companyId =
  //       req.companyId;

  //     if (!companyId) {

  //       throw new Error(
  //         "Company not found"
  //       );
  //     }

  //     const { date } =
  //       req.body;


  //     const result =
  //       await processAttendance({

  //         companyId,

  //         date:
  //           date
  //             ? new Date(date)
  //             : new Date(),
  //       });

  //     res.json({

  //       success: true,

  //       message:
  //         "Attendance processed successfully",

  //       data: result,
  //     });

  //   } catch (err: any) {

  //     res.status(400).json({

  //       success: false,

  //       message:
  //         err.message,
  //     });
  //   }
  // };

  export const processAttendanceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const { date } = req.body;

    const attendanceDate = date
      ? new Date(date)
      : new Date();

    // Validate date
    if (isNaN(attendanceDate.getTime())) {
      throw new Error("Invalid date");
    }

    // 2-day minimum cutoff validation (IST)
    const attendanceStart = getStartEndOfDay(
      "Asia/Kolkata",
      attendanceDate
    ).start;

    const todayStart = getStartEndOfDay(
      "Asia/Kolkata",
      new Date()
    ).start;

    const cutoffStart = new Date(
      todayStart.getTime() - 2 * 24 * 60 * 60 * 1000
    );

    if (attendanceStart > cutoffStart) {
      throw new Error(
        "Attendance can only be processed for dates at least 2 days in the past"
      );
    }

    const result = await processAttendance({
      companyId,
      date: attendanceDate,
    });

    res.json({
      success: true,
      message:
        "Attendance processed successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message:
        err.message ||
        "Something went wrong",
    });
  }
};