import mongoose from "mongoose";
import Appointment from "../models/appointmentSchema.js";
import Counter from "../models/counter.js";
import { sendEmail } from "../utils/sendMail.js";


export const createAppointment = async (appointmentData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const dayKey = now.toLocaleDateString("en-US", { weekday: "short" }); // e.g., 'Mon', 'Tue'
    const dateKey = now.toISOString().split("T")[0]; // e.g., '2025-07-11'

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Use both module and exact date to reset daily
    const counterDoc = await Counter.findOneAndUpdate(
      { module: `Appointment-${dayKey}`, year: dateKey },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );
    
    // const token = `${dayKey}/${String(counterDoc.value).padStart(3, "0")}`; // e.g., Mon/001
    const token = `${day}${month}/${String(counterDoc.value).padStart(3, "0")}`; // e.g., 1807/001

    appointmentData.token_number = token;

    const [created] = await Appointment.create([appointmentData], { session });

    await session.commitTransaction();
    session.endSession();

    return created;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating appointment: " + error.message);
  }
};

// Get all appointment records with pagination
// export const getAllAppointments = async ({ limit, page, params }) => {
//     try {
//         const { query } = params;

//          if (query.search) {
//               const searchValue = query.search.trim();
        
//               query.$or = [
//                 // { uhid: { $regex: searchValue, $options: "i" } }, 
//                 { patient_name: { $regex: searchValue, $options: "i" } },
//                 // { mobile_no: { $regex: searchValue, $options: "i" } },
//               ];
        
//               delete query.search; // remove extra param if not needed further
//             }

//         const appointments = await Appointment.find(query).
//             populate('uhid Consulting_Doctor')
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const total = await Appointment.countDocuments(query);
//         return { total, totalPages: Math.ceil(total / limit), limit, page, appointments };
//     } catch (error) {
//         throw new Error('Error retrieving appointments: ' + error.message);
//     }
// };

export const getAllAppointments = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    let searchValue = "";

    if (query.search) {
      searchValue = query.search.trim();
      delete query.search;
    }

    const pipeline = [
      {
        $lookup: {
          from: "uhids",
          localField: "uhid",
          foreignField: "_id",
          as: "uhid",
        },
      },
      { $unwind: { path: "$uhid", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "Consulting_Doctor",
          foreignField: "_id",
          as: "Consulting_Doctor",
        },
      },
      {
        $unwind: {
          path: "$Consulting_Doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (searchValue) {
      pipeline.push({
        $match: {
          $or: [
            { patient_name: { $regex: searchValue, $options: "i" } }, // appointment doc
            { token_number: { $regex: searchValue, $options: "i" } },
            { "uhid.uhid": { $regex: searchValue, $options: "i" } }, // UHID number
            { "uhid.patient_name": { $regex: searchValue, $options: "i" } }, // UHID name
          ],
        },
      });
    }

    // Apply any other filters from `query`
    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }

    // Count total
    const totalData = await Appointment.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    const total = totalData.length ? totalData[0].total : 0;

    // Paginate
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const appointments = await Appointment.aggregate(pipeline);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      limit,
      page,
      appointments,
    };
  } catch (error) {
    throw new Error("Error retrieving appointments: " + error.message);
  }
};


// Get appointment by ID
export const getAppointmentById = async (id) => {
    try {
        return await Appointment.findById(id).populate("Consulting_Doctor uhid");
    } catch (error) {
        throw new Error('Error retrieving appointment by ID: ' + error.message);
    }
};

// Update an appointment record
export const updateAppointment = async (id, appointmentData) => {
    try {

      const oldAppointment = await Appointment.findById(id).populate([
        "Consulting_Doctor",
        "uhid",
      ]);
      if (!oldAppointment) {
        throw new ErrorHandler("Appointment not found", 404);
      }

       const previousStatus = oldAppointment.status;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
          id,
          appointmentData,
          { new: true }
        ).populate(["Consulting_Doctor", "uhid"]);

        if (
          appointmentData.status &&
          appointmentData.status !== previousStatus &&
          (appointmentData.status === "missed" ||
            appointmentData.status === "cancelled")
        ) {
          const templateVars = {
            tokenNumber: updatedAppointment.token_number || "N/A",
            patientName: updatedAppointment.patient_name || "System",
            doctorName: updatedAppointment.Consulting_Doctor?.name || "Doctor",
            date: new Date(updatedAppointment.date).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
            time: new Date(
              `1970-01-01T${updatedAppointment.time}`
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            checkInTime: updatedAppointment.checkin_time
              ? new Date(updatedAppointment.checkin_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )
              : "N/A",
            phoneNumber: updatedAppointment.uhid?.mobile_no || "N/A",
            status: updatedAppointment.status || "N/A",
            emailAddress: updatedAppointment.emailAddress || "N/A",
            timeSlot: updatedAppointment.time_slot || "N/A",
          };

          const emailTemplate =
            appointmentData.status === "missed"
              ? "appointment_missed"
              : "appointment_cancelled";

          try {
            await sendEmail(
              templateVars.emailAddress,
              emailTemplate,
              templateVars
            );
          } catch (err) {
            console.error("Email failed on status change:", err.message);
          }
        }

        return updatedAppointment;
    } catch (error) {
        throw new Error('Error updating appointment: ' + error.message);
    }
};

// Delete an appointment record
export const deleteAppointment = async (id) => {
    try {
        return await Appointment.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Error deleting appointment: ' + error.message);
    }
};


export const getAppointmentByUhid = async (uhidid) => {
  try {
    return await Appointment.find({ uhid:uhidid });
  } catch (error) {
    throw new Error('Error retrieving appointments by UHID: ' + error.message);
  }
};
