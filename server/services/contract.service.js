import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

export const generateContractPDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      if (!booking) {
        return reject(new Error("Booking details are missing"));
      }

      const contractsDir = path.join(process.cwd(), "public", "contracts");

      if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
      }

      const fileName = `contract_${booking._id}.pdf`;
      const filePath = path.join(contractsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      doc
        .fontSize(20)
        .text("RENTAL AGREEMENT / CONTRACT", { align: "center" })
        .moveDown(1.5);

      doc
        .fontSize(11)
        .text(`Contract ID: ${booking._id || "N/A"}`)
        .text(`Generated On: ${new Date().toLocaleString()}`)
        .moveDown();

      doc.fontSize(14).text("Customer Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Name: ${booking.customer?.name || "N/A"}`)
        .text(`Email: ${booking.customer?.email || "N/A"}`)
        .moveDown();

      doc.fontSize(14).text("Rental Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Product: ${booking.product?.name || "N/A"}`)
        .text(`Quantity: ${booking.quantity || 1}`)
        .text(`Pickup Date: ${formatDate(booking.pickupDate)}`)
        .text(`Return Date: ${formatDate(booking.returnDate)}`)
        .moveDown();

      doc.fontSize(14).text("Payment Details", { underline: true });
      doc
        .fontSize(11)
        .text(`Total Amount: Rs. ${booking.totalAmount || 0}`)
        .text(`Security Deposit: Rs. ${booking.securityDeposit || 0}`)
        .moveDown();

      doc.fontSize(14).text("Terms & Conditions", { underline: true });
      doc
        .fontSize(10)
        .text(
          "1. Customer is responsible for the product during the rental period.\n" +
            "2. Late returns will attract late fees as per applicable policy.\n" +
            "3. Damages beyond normal wear and tear will be charged from the security deposit.\n" +
            "4. Cancellations are subject to the platform's cancellation policy."
        );

      writeStream.on("finish", () => {
        const documentUrl = `/contracts/${fileName}`;
        resolve(documentUrl);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};