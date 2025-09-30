import { Schema, model } from "mongoose";

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["driver", "business", "admin"],
    },
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
export default User;
