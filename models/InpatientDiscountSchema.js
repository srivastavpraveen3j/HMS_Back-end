import mongoose from "mongoose";

const InpatientDiscountSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UniqueHealthIdentification",
    required: [true, "UHID is required"] 
  },
  consultingDoctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: [true, "Consulting doctor ID is required"] 
  },
  totalBillingAmount: { 
    type: Number, 
    required: [true, "Total billing amount is required"],
    min: [0, "Total billing amount must be a positive number"]
  },
  totalDepositAmount: { 
    type: Number, 
    required: [true, "Total deposit amount is required"],
    min: [0, "Total deposit amount must be a positive number"]
  },
  netPayableAmount: { 
    type: Number, 
    required: [true, "Net payable amount is required"],
    min: [0, "Net payable amount must be a positive number"]
  },
  hospitalDiscountPercentage: { 
    type: Number, 
    min: [0, "Discount percentage cannot be negative"],
    max: [100, "Discount percentage cannot exceed 100"]
  },
  hospitalDiscountAmount: { 
    type: Number, 
    min: [0, "Discount amount must be a positive number"]
  },
  doctorDiscountPercentage: { 
    type: Number,
    min: [0, "Discount percentage cannot be negative"],
    max: [100, "Discount percentage cannot exceed 100"]
  },
  doctorDiscountAmount: { 
    type: Number, 
    min: [0, "Discount amount must be a positive number"]
  },
  thirdPartyAdministratorId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  discountRemarks: { 
    type: String,
    maxlength: [500, "Discount remarks cannot exceed 500 characters"] 
  },
}, { timestamps: true });

const InpatientDiscount = mongoose.model("InpatientDiscount", InpatientDiscountSchema);
export default InpatientDiscount;