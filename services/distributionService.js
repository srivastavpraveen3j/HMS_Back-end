// services/distributionService.js
import DistributionTransfer from '../models/distributionTransfer.js';
import Medicine from '../models/medicine.js';
import SubPharmacy from '../models/subPharmacy.js';
import SubPharmacyInventory from '../models/subPharmacyInventory.js';
import mongoose from 'mongoose';

class DistributionService {
  
  async createTransfer(transferData) {
    try {
      const { to, items, requested_by } = transferData;
      
      // Validate sub-pharmacy exists
      const subPharmacy = await SubPharmacy.findById(to);
      if (!subPharmacy) {
        throw new Error('Sub-pharmacy not found');
      }
      
      // Validate medicines and check stock availability
      const validatedItems = [];
      
      for (const item of items) {
        const medicine = await Medicine.findById(item.medicine);
        if (!medicine) {
          throw new Error(`Medicine not found: ${item.medicine}`);
        }
        
        if (medicine.stock < item.requested_quantity) {
          throw new Error(`Insufficient stock for ${medicine.medicine_name}. Available: ${medicine.stock}, Requested: ${item.requested_quantity}`);
        }
        
        validatedItems.push({
          medicine: medicine._id,
          medicine_name: medicine.medicine_name,
          requested_quantity: item.requested_quantity,
          unit_price: medicine.price,
          batch_details: [{
            batch_no: medicine.batch_no,
            expiry_date: medicine.expiry_date,
            mfg_date: medicine.mfg_date,
            unit_price: medicine.price,
            quantity: item.requested_quantity
          }]
        });
      }
      
      const transfer = new DistributionTransfer({
        to,
        items: validatedItems,
        requested_by,
        status: 'pending'
      });
      
      await transfer.save();
      await transfer.populate('to', 'name type location');
      
      return transfer;
      
    } catch (error) {
      throw error;
    }
  }
  
  // Update your backend service method
// controllers/distributionController.js
 async approveTransfer(transferId, approvedBy, approvalData = []) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Find transfer by _id
        const transfer = await DistributionTransfer.findById(transferId).session(session);
        if (!transfer) {
          throw new Error('Transfer not found');
        }
        
        if (transfer.status !== 'pending') {
          throw new Error('Transfer is not in pending status');
        }

        // STEP 1: Approve the transfer
        console.log('Step 1: Approving transfer...');
        
        // Auto-approve with requested quantities if no approval data provided
        for (let i = 0; i < transfer.items.length; i++) {
          const approvedQty = approvalData[i]?.approved_quantity || transfer.items[i].requested_quantity;
          transfer.items[i].approved_quantity = Math.min(approvedQty, transfer.items[i].requested_quantity);
        }
        
        transfer.status = 'approved';
        transfer.approved_by = approvedBy;
        transfer.approved_at = new Date();
        await transfer.save({ session });

        // STEP 2: Immediately process the transfer (move stock)
        console.log('Step 2: Processing transfer - moving stock...');
        
        // Process each item
        for (const item of transfer.items) {
          console.log(`Processing item: ${item.medicine_name}, Approved qty: ${item.approved_quantity}`);
          
          // Deduct from central store (Medicine collection)
          const medicine = await Medicine.findById(item.medicine).session(session);
          if (!medicine) {
            throw new Error(`Medicine not found: ${item.medicine_name}`);
          }
          
          if (medicine.stock < item.approved_quantity) {
            throw new Error(`Insufficient stock for ${item.medicine_name}. Available: ${medicine.stock}, Required: ${item.approved_quantity}`);
          }
          
          // Deduct stock from central store
          medicine.stock -= item.approved_quantity;
          await medicine.save({ session });
          console.log(`Deducted ${item.approved_quantity} from central store. Remaining: ${medicine.stock}`);
          
          // Add to sub-pharmacy inventory
          let subInventory = await SubPharmacyInventory.findOne({
            sub_pharmacy: transfer.to,
            medicine: item.medicine
          }).session(session);
          
          if (subInventory) {
            // Update existing inventory
            console.log(`Updating existing sub-pharmacy inventory. Current stock: ${subInventory.current_stock}`);
            
            subInventory.current_stock += item.approved_quantity;
            
            // Add new batch details
            const newBatch = {
              batch_no: item.batch_details[0]?.batch_no || medicine.batch_no,
              expiry_date: item.batch_details[0]?.expiry_date || medicine.expiry_date,
              quantity: item.approved_quantity,
              unit_price: item.unit_price,
              received_date: new Date(),
              supplier: medicine.supplier?.name || 'Central Store',
              mfg_date: item.batch_details[0]?.mfg_date || medicine.mfg_date
            };
            
            subInventory.batch_details.push(newBatch);
            subInventory.last_restocked = new Date();
            
            console.log(`New stock in sub-pharmacy: ${subInventory.current_stock}`);
            
          } else {
            // Create new inventory entry
            console.log(`Creating new sub-pharmacy inventory entry`);
            
            subInventory = new SubPharmacyInventory({
              sub_pharmacy: transfer.to,
              medicine: item.medicine,
              medicine_name: item.medicine_name,
              current_stock: item.approved_quantity,
              batch_details: [{
                batch_no: item.batch_details[0]?.batch_no || medicine.batch_no,
                expiry_date: item.batch_details[0]?.expiry_date || medicine.expiry_date,
                quantity: item.approved_quantity,
                unit_price: item.unit_price,
                received_date: new Date(),
                supplier: medicine.supplier?.name || 'Central Store',
                mfg_date: item.batch_details[0]?.mfg_date || medicine.mfg_date
              }],
              last_restocked: new Date()
            });
            
            console.log(`Created new inventory with stock: ${item.approved_quantity}`);
          }
          
          await subInventory.save({ session });
        }
        
        // STEP 3: Update transfer status to in_progress
        transfer.status = 'in_progress';
        await transfer.save({ session });
        
        console.log('Transfer approved and processed successfully!');
      });
      
      // Return the updated transfer with populated data
      return await DistributionTransfer.findById(transferId)
        .populate('to', 'name type location')
        .populate('items.medicine', 'medicine_name dose');
      
    } catch (error) {
      console.error('Error in approveTransfer:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Simplified completeTransfer method (just marks as completed)
  async completeTransfer(transferId) {
  try {
    let transfer;
    
    // Try to find by MongoDB _id first, then by transferId
    if (mongoose.Types.ObjectId.isValid(transferId)) {
      transfer = await DistributionTransfer.findById(transferId);
    } else {
      transfer = await DistributionTransfer.findOne({ transferId });
    }
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }
    
    if (transfer.status !== 'in_progress') {
      throw new Error('Transfer is not in progress status');
    }
    
    transfer.status = 'completed';
    transfer.completed_at = new Date();
    
    await transfer.save();
    console.log('Transfer marked as completed');
    
    return transfer;
    
  } catch (error) {
    throw error;
  }
}

  // Keep the original processTransfer method for manual processing if needed
  async processTransfer(transferId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const transfer = await DistributionTransfer.findById(transferId).session(session);
        if (!transfer || transfer.status !== 'approved') {
          throw new Error('Transfer not found or not approved');
        }
        
        // Process each item (same logic as in approveTransfer)
        for (const item of transfer.items) {
          const medicine = await Medicine.findById(item.medicine).session(session);
          if (!medicine) {
            throw new Error(`Medicine not found: ${item.medicine_name}`);
          }
          
          if (medicine.stock < item.approved_quantity) {
            throw new Error(`Insufficient stock for ${item.medicine_name}`);
          }
          
          medicine.stock -= item.approved_quantity;
          await medicine.save({ session });
          
          let subInventory = await SubPharmacyInventory.findOne({
            sub_pharmacy: transfer.to,
            medicine: item.medicine
          }).session(session);
          
          if (subInventory) {
            subInventory.current_stock += item.approved_quantity;
            subInventory.batch_details.push({
              batch_no: item.batch_details[0]?.batch_no || medicine.batch_no,
              expiry_date: item.batch_details[0]?.expiry_date || medicine.expiry_date,
              quantity: item.approved_quantity,
              unit_price: item.unit_price,
              received_date: new Date(),
              supplier: medicine.supplier?.name || 'Central Store',
              mfg_date: item.batch_details[0]?.mfg_date || medicine.mfg_date
            });
            subInventory.last_restocked = new Date();
          } else {
            subInventory = new SubPharmacyInventory({
              sub_pharmacy: transfer.to,
              medicine: item.medicine,
              medicine_name: item.medicine_name,
              current_stock: item.approved_quantity,
              batch_details: [{
                batch_no: item.batch_details[0]?.batch_no || medicine.batch_no,
                expiry_date: item.batch_details[0]?.expiry_date || medicine.expiry_date,
                quantity: item.approved_quantity,
                unit_price: item.unit_price,
                received_date: new Date(),
                supplier: medicine.supplier?.name || 'Central Store',
                mfg_date: item.batch_details[0]?.mfg_date || medicine.mfg_date
              }],
              last_restocked: new Date()
            });
          }
          
          await subInventory.save({ session });
        }
        
        transfer.status = 'in_progress';
        await transfer.save({ session });
      });
      
      return await DistributionTransfer.findById(transferId).populate('to', 'name type location');
      
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }


  

  

  
  async getAllTransfers(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }
      
      const transfers = await DistributionTransfer.find(query)
        .populate('to', 'name type location')
        .populate('items.medicine', 'medicine_name dose')
        .sort({ createdAt: -1 })
        .limit(50);
        
      return transfers;
      
    } catch (error) {
      throw error;
    }
  }
  
  async getTransferById(transferId) {
    try {
      const transfer = await DistributionTransfer.findOne({ transferId })
        .populate('to', 'name type location pharmacist contact_info')
        .populate('items.medicine', 'medicine_name dose supplier batch_no expiry_date');
        
      if (!transfer) {
        throw new Error('Transfer not found');
      }
      
      return transfer;
      
    } catch (error) {
      throw error;
    }
  }
  
  async getTransferSummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [summary] = await DistributionTransfer.aggregate([
        {
          $group: {
            _id: null,
            totalPending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            totalInProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
            completedToday: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$status", "completed"] },
                      { $gte: ["$completed_at", today] }
                    ]
                  }, 
                  1, 
                  0
                ] 
              } 
            },
            totalValue: { $sum: "$total_value" }
          }
        }
      ]);
      
      return summary || {
        totalPending: 0,
        totalInProgress: 0,
        completedToday: 0,
        totalValue: 0
      };
      
    } catch (error) {
      throw error;
    }
  }
}

export default new DistributionService();
