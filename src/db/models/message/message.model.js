import { model, Schema, SchemaTypes } from "mongoose";

const schema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: function () {
        if (this.attachments.length == 0) return true;
        return false;
      },
    },
    attachments: { type: [String] },
    receiver: { type: SchemaTypes.ObjectId, ref: "user", required: true },
    sender: { type: SchemaTypes.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

export const Message = model("message", schema);
