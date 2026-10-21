





//Controller function for Admin approves a pending borrow request

export const approveBorrowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user?._id || req.user?.id;

    const borrowRequest = await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    const book = await Book.findById(borrowRequest.book);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "This book is currently unavailable",
      });
    }

    borrowRequest.status = "approved";
    borrowRequest.processedAt = new Date();
    borrowRequest.processedBy = adminId;
    borrowRequest.rejectionReason = null;
    await borrowRequest.save();

    book.availableCopies -= 1;
    await book.save();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowRecord = await BorrowRecord.create({
      user: borrowRequest.user,
      book: borrowRequest.book,
      borrowRequest: borrowRequest._id,
      status: "borrowed",
      dueDate,
    });

    return res.status(200).json({
      success: true,
      message: "Borrow request approved successfully",
      borrowRequest,
      borrowRecord,
    });
  } catch (error) {
    console.error("Approve borrow request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin rejects a pending borrow request

export const rejectBorrowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?._id || req.user?.id;

    const borrowRequest = await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    borrowRequest.status = "rejected";
    borrowRequest.processedAt = new Date();
    borrowRequest.processedBy = adminId;
    borrowRequest.rejectionReason = rejectionReason || "No reason provided";
    await borrowRequest.save();

    return res.status(200).json({
      success: true,
      message: "Borrow request rejected",
      borrowRequest,
    });
  } catch (error) {
    console.error("Reject borrow request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};