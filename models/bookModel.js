import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
    },

    author: {
      type: String,
      required: [true, "Author name is required"],
    },

    // 10-12 line summary shown on the book detail page
    description: {
      type: String,
      required: [true, "Book description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // e.g. "Web Development", "Computer Science", "Programming"
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    // URL of the book cover image (shown as 3D image in frontend)
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },

    // Optional short video URL shown on book detail page
    videoUrl: {
      type: String,
      default: null,
    },

    // Total physical copies in the library
    totalCopies: {
      type: Number,
      required: [true, "Total copies is required"],
      min: [1, "Total copies must be at least 1"],
    },

    // Decreases when a book is borrowed, increases when returned
    availableCopies: {
      type: Number,
      required: [true, "Available copies is required"],
      min: [0, "Available copies cannot be negative"],
      validate: {
        validator: function (value) {
          // availableCopies can never exceed totalCopies
          return value <= this.totalCopies;
        },
        message: "Available copies cannot exceed total copies",
      },
    },

    // Average rating out of 5 — used for "Highest Rated" filter
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
    },

    // How many users have rated this book
    totalRatings: {
      type: Number,
      default: 0,
    },

    // ISBN for uniqueness check and external lookup
    isbn: {
      type: String,
      trim: true,
      unique: true, 
      sparse: true 
    },
  },
  {
    timestamps: true, // createdAt used for "Latest" / "Oldest" filter sorting
  }
);

// Index for fast search and filtering on the Library page
bookSchema.index({ title: "text", author: "text", category: "text" });
bookSchema.index({ category: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ availableCopies: 1 });

const Book = mongoose.model("Book", bookSchema);

export default Book;
