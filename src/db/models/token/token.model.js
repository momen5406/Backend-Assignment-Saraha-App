import { model, Schema } from "mongoose";

const tokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jti: { type: String, required: true },
    expiresIn: { type: Date, required: true },
  },
  { timestamps: true }
);

tokenSchema.index("expiresIn", { expireAfterSeconds: 0 });

export const Token = model.Token || model("Token", tokenSchema);
