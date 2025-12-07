// routes/distributionRoutes.js
import express from 'express';
import distributionController from '../controllers/distributionController.js';
import { uploadSingleFile } from '../middleware/multer.middleware.js';

const router = express.Router();

// GET /api/distribution/summary - Get transfer summary statistics
router.get('/summary', distributionController.getTransferSummary);

// GET /api/distribution/export - Export transfers
router.get('/export', distributionController.exportTransfers);

// GET /api/distribution - Get all transfers with filtering
router.get('/getall', distributionController.getAllTransfers);

// GET /api/distribution/:transferId - Get transfer by ID
router.get('/:transferId', distributionController.getTransferById);

// POST /api/distribution - Create new transfer
router.post('/', distributionController.createTransfer);

// PUT /api/distribution/:transferId/approve - Approve transfer
router.put('/:transferId/approve', distributionController.approveTransfer);

// PUT /api/distribution/:transferId/process - Process approved transfer
router.put('/:transferId/process', distributionController.processTransfer);

// PUT /api/distribution/:transferId/complete - Complete transfer
router.put('/:transferId/complete', distributionController.completeTransfer);

router.post(
  '/bulk-upload',
   uploadSingleFile("file"), // expects <input type="file" name="csvfile" />
  distributionController.bulkTransferFromCSV
);

// Add this to routes/distributionRoutes.js
// Add this API endpoint to check what's in the inventory
// routes/distributionRoutes.js
router.get('/subpharmacy/:subPharmacyId/inventory', async (req, res) => {
  try {
    const { subPharmacyId } = req.params;
    
    console.log('Checking inventory for pharmacy:', subPharmacyId);
    
    const inventory = await SubPharmacyInventory.find({ 
      sub_pharmacy: subPharmacyId 
    })
    .populate('medicine', 'medicine_name dose price supplier batch_no expiry_date')
    .populate('sub_pharmacy', 'name type location')
    .sort({ medicine_name: 1 });
    
    console.log('Found inventory items:', inventory.length);
    inventory.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        medicine_name: item.medicine_name,
        current_stock: item.current_stock,
        medicine_id: item.medicine?._id,
        batches: item.batch_details.length
      });
    });
    
    res.json({
      success: true,
      data: inventory,
      count: inventory.length
    });
    
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


export default router;
