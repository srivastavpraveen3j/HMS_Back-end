import QueueManager from "../utils/QueueManager.js";

let io;

export const initWebSocket = (server) => {
  io = server;

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Join doctor’s room
    socket.on("joinDoctorRoom", (doctorId) => {
      socket.join(doctorId);
      console.log(`👨‍⚕️ Client joined room for doctor ${doctorId}`);

      // Send current queue immediately
      const queue = QueueManager.getAll(doctorId)?.items || [];
      socket.emit("queueUpdated", queue);
    });

    // Add patient to doctor queue
    socket.on("addPatient", ({ doctorId, patient }) => {
      if (!doctorId || !patient) return;

      const queue = QueueManager.addPatient(doctorId, patient);
      notifyQueueUpdate(doctorId, queue?.items || []);
      socket.emit("patientAdded", patient);
    });

    // Call next patient
    socket.on("nextPatient", (doctorId) => {
      if (!doctorId) return;

      const next = QueueManager.nextPatient(doctorId);
      notifyQueueUpdate(doctorId, QueueManager.getAll(doctorId)?.items || []);
      socket.emit("nextPatientCalled", next);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

// Broadcast updated queue to all clients of that doctor
export const notifyQueueUpdate = (doctorId, queue) => {
  if (io) {
    io.to(doctorId).emit("queueUpdated", queue);
  }
};