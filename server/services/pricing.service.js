export const calculateRentalPrice = (product, pickupDate, returnDate, quantity) => {
  if (!product || !product.pricing) {
    throw new Error("Product pricing not available");
  }

  const msPerHour = 1000 * 60 * 60;
  const durationHours = Math.ceil(
    (new Date(returnDate) - new Date(pickupDate)) / msPerHour
  );

  if (durationHours <= 0) {
    throw new Error("Return date must be after pickup date");
  }

  let durationDays = Math.ceil(durationHours / 24);
  let totalRentAmount = 0;
  let breakdownDetails = [];

  const pricing = product.pricing;

  if (pricing.monthly && durationDays >= 30) {
    const fullMonths = Math.floor(durationDays / 30);
    totalRentAmount += fullMonths * pricing.monthly;
    durationDays %= 30;
    breakdownDetails.push(`${fullMonths} month(s)`);
  }

  if (pricing.weekly && durationDays >= 7) {
    const fullWeeks = Math.floor(durationDays / 7);
    totalRentAmount += fullWeeks * pricing.weekly;
    durationDays %= 7;
    breakdownDetails.push(`${fullWeeks} week(s)`);
  }

  if (durationDays > 0) {
    if (pricing.daily) {
      totalRentAmount += durationDays * pricing.daily;
      breakdownDetails.push(`${durationDays} day(s)`);
    } else if (pricing.hourly) {
      totalRentAmount += (durationDays * 24) * pricing.hourly;
      breakdownDetails.push(`${durationDays * 24} hour(s)`);
    } else {
      throw new Error("No applicable pricing tier found for remaining duration days");
    }
  }

  const finalRentAmount = totalRentAmount * quantity;
  const securityDeposit = (product.securityDeposit || 0) * quantity;
  const totalAmount = finalRentAmount + securityDeposit;

  return {
    rentalAmount: finalRentAmount,
    securityDeposit,
    totalAmount,
    breakdown: {
      unitLabel: breakdownDetails.join(", "),
      ratePerUnit: 0,
      units: 1,
      quantity,
    },
  };
};