import { Schema, model } from 'mongoose';

const medicinePackageSchema = new Schema(
  {
    packagename: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    symptom_group: {
      type: Schema.Types.ObjectId,
      ref: "SymptomGroup",
      required: [true, "Symptom group is required"],
    },
    medicines: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubPharmacyInventory",
        required: [true, "Medicine is required"],
      },
    ],
    intake: {
      type: String,
    },
    advice: {
      type: String,
    },
    checkbox: {
      morning: {
        type: Boolean,
        default: false,
      },
      noon: {
        type: Boolean,
        default: false,
      },
      evening: {
        type: Boolean,
        default: false,
      },
      night: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const MedicinePackage = model('MedicinePackage', medicinePackageSchema);
export default MedicinePackage;