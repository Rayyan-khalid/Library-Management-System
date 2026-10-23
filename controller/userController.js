import PDFDocument from "pdfkit";
import User from "../models/userModels.js";
import BorrowRequest from "../models/borrowRequestModel.js";
import BorrowRecord from "../models/borrowRecordModel.js";
import Book from "../models/bookModel.js";


// function for get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -universityIdCard");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// controller function for update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error: ", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function of Borrow Book Request
export const submitBorrowRequest = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book id is required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No copies available right now. Please check back later.",
      });
    }

    // 3. Prevent duplicate pending requests for the same book
   
    const existingRequest = await BorrowRequest.findOne({
        user: userId,   // use the variable
        book: bookId,   // use the variable
        status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this book",
      });
    }

    const alreadyBorrowed = await BorrowRecord.findOne({
      user: userId,
      book: bookId,
      status: "borrowed",
    });

    if (alreadyBorrowed) {
      return res.status(409).json({
        success: false,
        message: "You already have this book borrowed",
      });
    }

    const borrowRequest = await BorrowRequest.create({
      user: userId,
      book: bookId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Borrow request submitted successfully",
      borrowRequest,
    });
  } catch (error) {
    console.error("Submit borrow request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function for getBorrowedBooksq
export const getBorrowedBooks = async (req, res) => {
  try {
    const { status } = req.query; // optional filter: "borrowed" or "returned"

    const filter = { user: req.user.id };
    if (status && ["borrowed", "returned"].includes(status)) {
      filter.status = status;
    }

    const borrowedBooks = await BorrowRecord.find(filter)
      .populate("book", "title author coverImage category") // get book details
      .sort({ borrowDate: -1 }); // most recent first

    // Mark overdue books on the fly using virtual field
    const records = borrowedBooks.map((record) => ({
      id: record._id,
      book: record.book,
      status: record.status,
      borrowDate: record.borrowDate,
      dueDate: record.dueDate,
      returnDate: record.returnDate,
      isOverdue: record.currentlyOverdue, // virtual field from schema
      fineAmount: record.fineAmount,
      receiptUrl: record.receiptUrl,
    }));

    res.status(200).json({
      success: true,
      total: records.length,
      borrowedBooks: records,
    });
  } catch (error) {
    console.error("Get borrowed books error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller function for download Recipt
    // 1. Get borrowing record ID from URL
export const downloadRecipt = async (req, res) => {
  try {
    const {recordId} = req.params;

    // 2. Find the record belonging to the logged-in user
    const record = await BorrowRecord.findOne({
      _id: recordId,
      user: req.user.id,
    }).populate("book","title  author").populate("user", "name email");

    // 3. If record does not exist, return an error 
    if (!record) {
      return res.status(404).json({
        success:false,
        message: "Borrowing Record not found",
      });
    }

    // 4. Set PDF download headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${record._id}.pdf"`
    );

    // 5. Create the PDF document
    const doc = new PDFDocument({ margin: 50 });

    // 6. Send the generated PDF directly to the response
    doc.pipe(res);

    // 7. Add receipt information
    doc.fontSize(20).text("Library Borrowing Receipt", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`Receipt ID: ${record._id}`);
    doc.text(`Student Name: ${record.user.name}`);
    doc.text(`Student Email: ${record.user.email}`);

    doc.moveDown();

    doc.fontSize(15).text("Book Details");
    doc.fontSize(12).text(`Book Title: ${record.book.title}`);
    doc.text(`Author: ${record.book.author}`);

    doc.moveDown();

    doc.text(
      `Borrow Date: ${record.borrowDate.toLocaleDateString()}`
    );
    doc.text(
      `Due Date: ${record.dueDate.toLocaleDateString()}`
    );
    doc.text(`Status: ${record.status}`);

    if (record.returnDate) {
      doc.text(
        `Return Date: ${record.returnDate.toLocaleDateString()}`
      );
    }

    doc.text(`Fine Amount: ${record.fineAmount ?? 0}`);

    // 8. Finish generating the PDF
    doc.end();
  } catch (error) {
    console.error("Download receipt error:", error);

    if (res.headersSent) {
      return res.destroy(error);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}