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

  const durationDays = durationHours / 24;

  // TEMP fallback logic - [MODULE 5 owner isko proper pricelist engine se replace karega]
  let ratePerUnit = 0;
  let unitLabel = "";

  if (durationDays >= 30 && product.pricing.monthly) {
    ratePerUnit = product.pricing.monthly;
    unitLabel = "monthly";
  } else if (durationDays >= 7 && product.pricing.weekly) {
    ratePerUnit = product.pricing.weekly;
    unitLabel = "weekly";
  } else if (durationDays >= 1 && product.pricing.daily) {
    ratePerUnit = product.pricing.daily;
    unitLabel = "daily";
  } else if (product.pricing.hourly) {
    ratePerUnit = product.pricing.hourly;
    unitLabel = "hourly";
  } else {
    throw new Error("No applicable pricing found for this duration");
  }

  const units =
    unitLabel === "hourly"
      ? durationHours
      : unitLabel === "daily"
      ? Math.ceil(durationDays)
      : unitLabel === "weekly"
      ? Math.ceil(durationDays / 7)
      : Math.ceil(durationDays / 30);

  const totalAmount = ratePerUnit * units * quantity;

  return {
    totalAmount,
    breakdown: {
      unitLabel,
      ratePerUnit,
      units,
      quantity,
    },
  };
};
