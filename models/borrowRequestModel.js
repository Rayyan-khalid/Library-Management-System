import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    // The student who clicked "Borrow Book Request"
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // The book being requested
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book is required"],
    },

    // Admin changes this to approved or rejected
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
    },

    // When the student submitted the request
    requestDate: {
      type: Date,
      default: Date.now,
    },

    // When admin approved or rejected — null until processed
    processedAt: {
      type: Date,
      default: null,
    },

    // Admin who processed this request (for audit trail)
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Optional note from admin when rejecting a request
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests:
// a user should not request the same book twice while one is still pending
borrowRequestSchema.index(
  { user: 1, book: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

// Fast lookup for admin dashboard — all pending requests
borrowRequestSchema.index({ status: 1, requestDate: -1 });

// Fast lookup for a specific user's requests
borrowRequestSchema.index({ user: 1, createdAt: -1 });

const BorrowRequest = mongoose.model("BorrowRequest", borrowRequestSchema);

export default BorrowRequest;
