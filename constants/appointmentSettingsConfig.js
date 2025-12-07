export const AppointmentSettings = {
  ShowUpGracePeriod: 10,                    // Minutes after scheduled time before marking appointment as "missed"
  MinAdvanceBookingTime: 120,               // Minimum time (in minutes) required before a booking can be made
  MaxAdvanceBookingDays: 30,                // Maximum number of days into the future a booking can be scheduled
  DefaultSlotDuration: 15,                  // Default length of each appointment slot (in minutes)
  DefaultGapBetweenSlots: 5,                // Default gap between consecutive appointments (in minutes)
  DailyStartTime: "09:00",                  // Daily start time for appointments (24-hour format)
  DailyEndTime: "17:00",                    // Daily end time for appointments (24-hour format)
  AllowBookingOnWeekends: false,            // If false, prevents bookings on Saturdays and Sundays

  AllowReschedule: true,                    // Whether rescheduling of appointments is allowed
  AllowMultipleReschedules: false,          // If false, patient can reschedule only once
  CancellationCutoffMinutes: 60,            // Time (in minutes) before appointment after which cancellation is not allowed
  AllowCancellationByPatient: true,         // If true, patient can cancel their own appointments
  RebookingCooldownMinutes: 60,             // Cooldown period (in minutes) after a no-show before patient can book again

  MaxAppointmentsPerDayPerDoctor: 25,       // Maximum number of appointments per doctor per day
  EnableDoctorLevelSettings: false,         // If true, allows doctors to override global settings
  AllowDoctorTimeOverrides: true,           // If true, allows doctor-specific working hours or slot changes

  AllowWalkins: true,                       // If true, allows walk-in patients to get tokens
  WalkinLimitPerDay: 100,                   // Maximum number of walk-in tokens allowed per day
  WalkinTokenStart: 1000,                   // Starting number for walk-in tokens

  SendAppointmentReminders: true,           // If true, sends reminders before appointments
  ReminderLeadMinutes: 30,                  // Time before appointment (in minutes) to send reminders
  ReminderViaSMS: true,                     // If true, send reminders via SMS
  ReminderViaEmail: false,                  // If true, send reminders via Email
  ReminderTemplateId: "default-appointment-reminder", // Template ID for SMS reminder system

  AutoCancelMissedAppointments: true,       // If true, missed appointments are automatically marked as "missed"
  AutoCancelTimeBufferMinutes: 10,          // Grace period (in minutes) before marking an appointment as missed
  PenalizeNoShows: false,                   // If true, penalizes patients for not showing up
  NoShowPenaltyAmount: 100,                 // Penalty amount for no-shows (in currency units)

  ShowSlotAvailabilityOnUI: true,           // If true, displays available/unavailable slots on the frontend
  GroupSlotsByDoctor: true,                 // If true, groups slots by doctor in frontend calendar
  ColorCodeSlotsByStatus: true,             // If true, uses color codes for slot status (booked, available, etc.)

  AllowManualSlotCreation: true,            // If true, admin/staff can manually create slots
  AllowOverbooking: false,                  // If true, allows more than one booking per slot
  RequireApprovalForBooking: false,         // If true, bookings require admin approval

  Timezone: "Asia/Kolkata",                 // Default timezone for all time-related operations
  Locale: "en-IN",                          // Locale for formatting time, date, currency, etc.
  Currency: "INR"                           // Currency code used in billing/penalties
};
