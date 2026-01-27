import nodemailer from "nodemailer";

export const sendResetEmail = async (email, token, fullName) => {
  if (!email) throw new Error("Không có email người nhận");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
    token,
  )}`;

  const displayName = fullName || "Anh/Chị";

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; line-height:1.7; color:#1f2937; max-width:640px; margin:auto">

    <h2 style="color:#dc2626; margin-bottom:4px">
      DevTech Internal System
    </h2>
    <p style="color:#6b7280; margin-top:0">
      Yêu cầu đặt lại mật khẩu
    </p>

    <hr style="margin:20px 0" />

    <p>Xin chào <b>${displayName}</b>,</p>

    <p>
      Hệ thống DevTech vừa nhận được <b>yêu cầu đặt lại mật khẩu</b>
      cho tài khoản của bạn.
    </p>

    <p>
      Nếu bạn là người thực hiện yêu cầu này, vui lòng nhấn vào nút bên dưới
      để tạo mật khẩu mới:
    </p>

    <div style="text-align:center; margin:32px 0">
      <a 
        href="${resetLink}" 
        style="
          display:inline-block;
          padding:14px 32px;
          background:#dc2626;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-size:16px;
          font-weight:600;
          letter-spacing:0.3px;
        "
      >
        ĐẶT LẠI MẬT KHẨU
      </a>
    </div>

    <div style="background:#fef2f2; padding:16px; border-radius:8px">
      <p style="margin-top:0"><b>Lưu ý bảo mật:</b></p>
      <ul style="margin-bottom:0">
        <li>Liên kết này chỉ có hiệu lực trong vòng <b>1 giờ</b>.</li>
        <li>Mỗi liên kết chỉ được sử dụng <b>một lần duy nhất</b>.</li>
        <li>Không chia sẻ email này cho bất kỳ ai.</li>
      </ul>
    </div>

    <p style="margin-top:24px">
      Nếu bạn <b>không yêu cầu</b> đặt lại mật khẩu,
      vui lòng bỏ qua email này.  
      Mật khẩu hiện tại của bạn vẫn được giữ nguyên.
    </p>

    <hr style="margin:28px 0" />

    <!-- HR SIGNATURE -->
    <div style="margin-top:20px">
      <p style="margin-bottom:4px"><b>Trân trọng</b></p>

      <p style="margin:0; font-weight:600; color:#111827">
        Phạm Tuấn
      </p>
      <p style="margin:0; color:#374151">
        HR Manager | DevTech
      </p>
      <p style="margin:4px 0 0; color:#6b7280; font-size:13px">
        DevTech — Internal Communication & Work Platform
      </p>
    </div>

    <hr style="margin:24px 0" />

    <p style="font-size:12px; color:#6b7280">
      Email này được gửi tự động từ hệ thống DevTech.<br/>
      Vui lòng không trả lời email này.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"DevTech Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "DevTech – Yêu cầu đặt lại mật khẩu",
    html: emailHtml,
  });
};
