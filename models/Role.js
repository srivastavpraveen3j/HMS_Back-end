import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    permission: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
        required: [true, "Permission is required"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Role", roleSchema);
