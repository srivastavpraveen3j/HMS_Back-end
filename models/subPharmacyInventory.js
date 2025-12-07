  // models/subPharmacyInventory.js
  import mongoose from "mongoose";

  const subPharmacyInventorySchema = new mongoose.Schema(
    {
      sub_pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubPharmacy",
        required: true,
      },
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine", // This allows populate()
        required: true,
      },
      medicine_name: {
        // Add medicine name for easy viewing
        type: String,
        required: true,
      },
      current_stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      minimum_threshold: {
        type: Number,
        default: 10,
      },
      maximum_capacity: {
        type: Number,
        default: 500,
      },
      // Array of batch subdocuments
      batch_details: [
        {
          batch_no: {
            type: String,
            required: true,
          },
          expiry_date: {
            type: Date,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          unit_price: {
            type: Number,
            required: true,
            min: 0,
          },
          received_date: {
            type: Date,
            default: Date.now,
          },
          supplier: {
            type: String,
            default: "Unknown",
          },
          mfg_date: {
            type: Date,
          },
        },
      ],
      last_restocked: Date,
      location_in_pharmacy: {
        type: String,
        default: "Shelf A-1",
      },
    },
    { timestamps: true }
  );

  const SubPharmacyInventory = mongoose.model(
    "SubPharmacyInventory",
    subPharmacyInventorySchema
  );
  export default SubPharmacyInventory;
