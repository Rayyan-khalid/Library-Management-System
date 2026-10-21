import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema(
  {
    // The student who borrowed the book
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // The book that was borrowed
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book is required"],
    },

    // Links back to the original borrow request that was approved
    borrowRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      default: null,
    },

    // "borrowed" = currently with student, "returned" = back in library
    status: {
      type: String,
      enum: {
        values: ["borrowed", "returned"],
        message: "Status must be borrowed or returned",
      },
      default: "borrowed",
    },

    // When the student physically received the book
    borrowDate: {
      type: Date,
      default: Date.now,
    },

    // Return deadline — typically 14 days after borrowDate
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Filled in when the book is actually returned
    returnDate: {
      type: Date,
      default: null,
    },

    // Whether the book was returned after the due date
    isOverdue: {
      type: Boolean,
      default: false,
    },

    // Fine amount if returned late (optional — set your per-day rate in logic)
    fineAmount: {
      type: Number,
      default: 0,
      min: [0, "Fine amount cannot be negative"],
    },

    // URL to the generated PDF receipt — for the "Download Receipt" button
    receiptUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field: check on-the-fly if a book is currently overdue
// (without saving to DB every time — just compute when needed)
borrowRecordSchema.virtual("currentlyOverdue").get(function () {
  if (this.status === "returned") return false;
  return new Date() > this.dueDate;
});

// Fast lookups for profile page — all books a user has borrowed
borrowRecordSchema.index({ user: 1, status: 1 });

// Fast lookups for admin borrow records page
borrowRecordSchema.index({ status: 1, borrowDate: -1 });

// Fast lookup to find overdue books (for admin alerts)
borrowRecordSchema.index({ dueDate: 1, status: 1 });

const BorrowRecord = mongoose.model("BorrowRecord", borrowRecordSchema);

export default BorrowRecord;
