import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ msg: "Token hết hạn hoặc không hợp lệ" });
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

export function authorization(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Không có quyền truy cập" });
    next();
  };
}
