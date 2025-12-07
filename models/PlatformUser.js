import mongoose from "mongoose";

const platformUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true },
    password: { type: String },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlatformRole",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid Role ID!`,
      },
    },

    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "pending",
    },

  namespaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Namespace", // <-- reference to Namespace model
      default: null,
    },

    token: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformUser", platformUserSchema);