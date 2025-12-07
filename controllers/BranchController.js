import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  activateBranch,
  deactivateBranch,
  getNameSpacebyAPIKey,
} from "../services/BranchService.js";

import { generateInviteCode } from "../utils/jwtUtils.js";
import { invitePlaformUser } from "../services/platformUserService.js";
import emailService from "../services/emailService.js";

export const getAllBranchesController = asyncHandler(async (req, res) => {
  const { api_Key } = req.namespace;
  
  const branches = await getAllBranches(api_Key);

  if (!branches) {
    throw new ErrorHandler("Branches not found", 404);
  }

  res.status(200).json(branches);
});

export const getBranchByIdController = asyncHandler(async (req, res) => {
  const branch = await getBranchById(req.params.id);

  if (!branch) {
    throw new ErrorHandler("Branch not found", 404);
  }

  res.status(200).json(branch);
});

export const createBranchController = asyncHandler(async (req, res) => {
  // get API key from header
  const api_key = req.headers["x-api-key"];

  // check if API key is valid
  if (!api_key) {
    throw new ErrorHandler("Invalid API key", 401);
  }

  const payLoad = {
    name: req.body.name,
    api_key: api_key,
    contact_email: req.body.contact_email,
  };

  const branch = await createBranch(payLoad);
  const inviteToken = generateInviteCode(payLoad.name);

  if (typeof inviteToken !== "string") {
    throw new ErrorHandler("Failed to generate invite token", 400);
  }

  const user = await invitePlaformUser({
    name: payLoad.name,
    email: payLoad.contact_email,
    inviteToken: inviteToken,
  });

  const subject = `Welcome ${payLoad.name} to HIMS System Our Team Will Connect with you Shortly`;
  const htmlContent = `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
            <h1 style="color: #2c3e50;">Welcome to Our SaaS Platform!</h1>
            <p style="font-size: 18px; color: #555;">
              We're excited to have you on board. Explore features, manage your data, and grow your business with ease.
            </p>
            <a href="${process.env.FRONTEND_URL}?token=${inviteToken}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Get Started
            </a>
          </div>
        `;

  emailService.sendEmail(payLoad.contact_email, subject, htmlContent);

  res.status(201).json({ branch, user });
});

export const updateBranchController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }
  const branch = await updateBranch(req.params.id, req.body);

  if (!branch) {
    throw new ErrorHandler("Branch not found", 404);
  }

  res.status(200).json(branch);
});

export const deleteBranchController = asyncHandler(async (req, res) => {
  const branch = await deleteBranch(req.params.id);

  if (!branch) {
    throw new ErrorHandler("Branch not found", 404);
  }

  res.status(200).json(branch);
});

export const activateBranchController = asyncHandler(async (req, res) => {
  const branch = await activateBranch(req.params.id);

  if (!branch) {
    throw new ErrorHandler("Branch not found", 404);
  }

  res.status(200).json(branch);
});

export const deactivateBranchController = asyncHandler(async (req, res) => {
  const branch = await deactivateBranch(req.params.id);

  if (!branch) {
    throw new ErrorHandler("Branch not found", 404);
  }

  res.status(200).json(branch);
});
