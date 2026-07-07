export const initiatePayment = async (booking) => {
  //Add real gateway
  // const order = await razorpay.orders.create({ amount: booking.totalAmount * 100, currency: "INR" });
  // return { paymentUrl: order.short_url, providerOrderId: order.id };

  return {
    paymentUrl: `https://dummy-payment-gateway.example.com/pay/${booking._id}`,
    providerOrderId: `dummy_order_${booking._id}`,
  };
};
