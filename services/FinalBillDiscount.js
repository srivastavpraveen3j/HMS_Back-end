import FinalBill from '../models/FinalBillingSchema.js';

// Add a discount to a FinalBill
export async function addDiscount(finalBillId, discountData) {
    const finalBill = await FinalBill.findById(finalBillId);
    if (!finalBill) throw new Error('FinalBill not found');

    finalBill.discounts.push(discountData);

    finalBill.totalDiscountGiven = finalBill.discounts.reduce((sum, d) => sum + d.discountAmount, 0);

    await finalBill.save();
    return finalBill.discounts;
}

// Get all discounts for a FinalBill
export async function getDiscounts(finalBillId) {
    const finalBill = await FinalBill.findById(finalBillId);
    if (!finalBill) throw new Error('FinalBill not found');

    return finalBill.discounts;
}

// Update a discount by discountId
export async function updateDiscount(finalBillId, discountId, updateData) {
    const finalBill = await FinalBill.findById(finalBillId);
    if (!finalBill) throw new Error('FinalBill not found');

    const discount = finalBill.discounts.id(discountId);
    if (!discount) throw new Error('Discount not found');

    Object.assign(discount, updateData);

    finalBill.totalDiscountGiven = finalBill.discounts.reduce((sum, d) => sum + d.discountAmount, 0);

    await finalBill.save();
    return discount;
}

// Delete a discount by discountId
export async function deleteDiscount(finalBillId, discountId) {
    const finalBill = await FinalBill.findById(finalBillId);
    if (!finalBill) throw new Error('FinalBill not found');

    const discount = finalBill.discounts.id(discountId);
    if (!discount) throw new Error('Discount not found');

    discount.remove();

    finalBill.totalDiscountGiven = finalBill.discounts.reduce((sum, d) => sum + d.discountAmount, 0);

    await finalBill.save();
    return { message: 'Discount removed' };
}
