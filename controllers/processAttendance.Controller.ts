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

  export const processAttendanceController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {

      const companyId =
        req.companyId;

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const { date } =
        req.body;

      const result =
        await processAttendance({

          companyId,

          date:
            date
              ? new Date(date)
              : new Date(),
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
          err.message,
      });
    }
  };