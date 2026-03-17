import { model, Schema } from "mongoose";
import { SYS_GENDER, SYS_PROVIDER, SYS_ROLE } from "../../../common/constant/index.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: [2, `firstName cannot be less than 2 chars`],
      maxLength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        if (this.provider == SYS_PROVIDER.google) return false;
        return true;
      },
    },
    phone: String,
    gender: { type: Number, enum: Object.values(SYS_GENDER), default: SYS_GENDER.male },

    role: { type: Number, enum: Object.values(SYS_ROLE), default: SYS_ROLE.User },

    provider: { type: Number, enum: Object.values(SYS_PROVIDER), default: SYS_PROVIDER.system },
    profilePic: String,
    coverProfilePic: [String],

    isEmailVerified: { type: Boolean, default: false },
    confirmEmail: Date,
    changeCredentials: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const User = model.User || model("user", userSchema);
