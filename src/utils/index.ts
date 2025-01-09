import crypto from "crypto";

const generateToken = () => {
  const tokenValue = crypto.randomBytes(32).toString("hex");
};
