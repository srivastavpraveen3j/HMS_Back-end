import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createStock,
  getAllStocks,
  getStock,
  getStockById,
  updateStock,
  deleteStock,
} from "../services/medicineStock.js";

export const createStockController = asyncHandler(async (req, res) => {
  const { medicineGroupName, medicines, pharmacyName, batch_no, price, stock } = req.body;

  if (
    !medicineGroupName ||
    !medicines ||
    !pharmacyName ||
    !batch_no ||
    !price ||
    !stock
  ) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existStock = await getStock(medicineGroupName);
  if(existStock) {
    throw new ErrorHandler("Stock already exist", 409);
  }

  const stockCreated = await createStock(req.body);
  if (!stockCreated) {
    throw new ErrorHandler("Failed to create stock", 400);
  }

  res.status(201).json(stockCreated);
});

export const getStocksController = asyncHandler( async (req, res) => {
    const stocks = await getAllStocks(req.queryOptions);

    if(!stocks){
        throw new ErrorHandler("No stocks found", 404);
    }

    res.status(200).json(stocks);
});

export const getStockByIdController = asyncHandler( async (req, res) => {
    const stock = await getStockById(req.params.id);

    if (!stock) {
        throw new ErrorHandler("Stock not found", 404);
    }

    res.status(200).json(stock);
});

export const updateStockController = asyncHandler( async (req, res) => {
    if(!req.body || Object.keys(req.body).length === 0){
        throw new ErrorHandler("No data provided for update", 400);
    }

    const updatedStock = await updateStock(req.params.id, req.body);

    if (!updatedStock) {
        throw new ErrorHandler("Stock not found", 400);
    }
    res.status(200).json(updatedStock);
});

export const deleteStockController = asyncHandler( async (req, res) => {
    const deletedStock = await deleteStock(req.params.id);

    if (!deletedStock) {
        throw new ErrorHandler("Stock not found", 404);
    }

    res.status(200).json({ message: "Stock deleted successfully" });
});
