import nodemailer from "nodemailer";

export const sendActivateEmail = async (email, token) => {
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

  const activateLink = `${process.env.FRONTEND_URL}/activate?token=${encodeURIComponent(token)}`;

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; line-height:1.7; color:#1f2937; max-width:640px; margin:auto">
    
    <h2 style="color:#2563eb; margin-bottom:4px">
      DevTech Internal System
    </h2>
    <p style="color:#6b7280; margin-top:0">
      Nền tảng giao tiếp & vận hành nội bộ
    </p>

    <hr style="margin:20px 0" />

    <p>Xin chào Bạn, Mình là Phạm Tuấn HR của bộ phận nhân sự Công Ty TNHH DevTech</p>

    <p>
      Chúng tôi trân trọng thông báo rằng bạn đã được 
      <b>mời tham gia hệ thống nội bộ của DevTech</b>.
    </p>

    <p>
      Đây là hệ thống được sử dụng bởi đội ngũ DevTech để:
    </p>

    <ul>
      <li>Giao tiếp và trao đổi công việc nội bộ</li>
      <li>Phối hợp dự án, quản lý nhiệm vụ và tài liệu</li>
      <li>Tham gia vào quy trình vận hành và phát triển của doanh nghiệp</li>
    </ul>

    <p>
      🎉 <b>Chúc mừng bạn đã chính thức trở thành nhân sự của DevTech.</b>
    </p>

    <p>
      Để hoàn tất quá trình onboarding và bắt đầu sử dụng hệ thống,
      vui lòng kích hoạt tài khoản của bạn bằng cách nhấn vào nút bên dưới:
    </p>

    <div style="text-align:center; margin:32px 0">
      <a 
        href="${activateLink}" 
        style="
          display:inline-block;
          padding:14px 32px;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-size:16px;
          font-weight:600;
          letter-spacing:0.3px;
        "
      >
        KÍCH HOẠT TÀI KHOẢN
      </a>
    </div>

    <div style="background:#f9fafb; padding:16px; border-radius:8px">
      <p style="margin-top:0"><b>Lưu ý quan trọng:</b></p>
      <ul style="margin-bottom:0">
        <li>Liên kết kích hoạt có hiệu lực trong vòng <b>24 giờ</b>.</li>
        <li>Email này chỉ dành cho người được mời.</li>
        <li>Nếu bạn không phải là người nhận lời mời, vui lòng bỏ qua email này.</li>
      </ul>
    </div>

    <p style="margin-top:24px">
      Sau khi kích hoạt, bạn có thể đăng nhập và bắt đầu tham gia
      vào các hoạt động nội bộ cùng đội ngũ DevTech.
    </p>

    <p>
      Chào mừng bạn đến với DevTech — <b>nơi công nghệ tạo ra giá trị.</b> 
    </p>

    <hr style="margin:28px 0" />

    <p style="font-size:12px; color:#6b7280">
      DevTech — Internal Communication & Work Platform<br/>
      Email này được gửi tự động. Vui lòng không trả lời email này.
    </p>
  </div>
`;

  await transporter.sendMail({
    from: `"DevTech" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Chào mừng bạn đến với DevTech – Kích hoạt tài khoản",
    html: emailHtml,
  });
};
