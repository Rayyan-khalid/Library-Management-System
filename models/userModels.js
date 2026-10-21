import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      // Never return password in queries by default
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either user or admin",
      },
      default: "user",
    },

    // University ID card number (e.g., 167128)
    universityIdNumber: {
      type: String,
      required: [true, "University ID number is required"],
      unique: true,
    },

    // URL/path of the uploaded university ID card image
    universityIdCard: {
      type: String,
      required: [true, "University ID card image is required"],
    },

    // Admin must approve new student accounts before they can log in
    status: {
      type: Object,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
    },

    // Tracks last login time — useful for admin analytics
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);


// Hashed Password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(
        this.password,
        10
    );
});

// Compare the password from the hashed password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema);

export default User;