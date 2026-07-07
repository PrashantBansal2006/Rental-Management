import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateContractPDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const contractsDir = path.join(process.cwd(), "public", "contracts");

      if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
      }

      const fileName = `contract_${booking._id}.pdf`;
      const filePath = path.join(contractsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // ---- Header ----
      doc
        .fontSize(20)
        .text("RENTAL AGREEMENT / CONTRACT", { align: "center" })
        .moveDown(1.5);

      // ---- Booking Reference ----
      doc
        .fontSize(11)
        .text(`Contract ID: ${booking._id}`)
        .text(`Generated On: ${new Date().toLocaleString()}`)
        .moveDown();

      // ---- Customer Details ----
      doc.fontSize(14).text("Customer Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Name: ${booking.customer?.name || "N/A"}`)
        .text(`Email: ${booking.customer?.email || "N/A"}`)
        .moveDown();

      // ---- Product / Rental Details ----
      doc.fontSize(14).text("Rental Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Product: ${booking.product?.name || "N/A"}`)
        .text(`Quantity: ${booking.quantity}`)
        .text(`Pickup Date: ${new Date(booking.pickupDate).toLocaleString()}`)
        .text(`Return Date: ${new Date(booking.returnDate).toLocaleString()}`)
        .moveDown();

      // ---- Payment Details ----
      doc.fontSize(14).text("Payment Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Total Amount: Rs. ${booking.totalAmount}`)
        .text(`Security Deposit: Rs. ${booking.securityDeposit || 0}`)
        .moveDown();

      // ---- Terms ----
      doc.fontSize(14).text("Terms & Conditions", { underline: true });
      doc
        .fontSize(10)
        .text(
          "1. Customer is responsible for the product during the rental period.\n" +
            "2. Late returns will attract late fees as per applicable policy.\n" +
            "3. Damages beyond normal wear and tear will be charged from the security deposit.\n" +
            "4. Cancellations are subject to the platform's cancellation policy."
        );

      doc.end();

      writeStream.on("finish", () => {
        // Yeh URL frontend/customer portal ko diya jayega download ke liye
        const documentUrl = `/contracts/${fileName}`;
        resolve(documentUrl);
      });

      writeStream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
