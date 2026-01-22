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
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">
      <h2 style="color:#2563eb">DevTech Internal System</h2>

      <p>Xin chào,</p>

      <p>
        Chúc mừng bạn! 🎉  
        Bạn đã chính thức trở thành <b>nhân sự của DevTech</b>.
      </p>

      <p>
        Để bắt đầu sử dụng hệ thống giao tiếp và làm việc nội bộ của doanh nghiệp,
        vui lòng kích hoạt tài khoản của bạn bằng cách nhấn vào nút bên dưới:
      </p>

      <p style="margin:24px 0">
        <a 
          href="${activateLink}" 
          style="
            display:inline-block;
            padding:12px 24px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          "
        >
          Kích hoạt tài khoản
        </a>
      </p>

      <p>
        <b>Lưu ý:</b>
      </p>
      <ul>
        <li>Liên kết kích hoạt có hiệu lực trong vòng <b>24 giờ</b>.</li>
      </ul>

      <p>
        Sau khi kích hoạt, bạn có thể tham gia giao tiếp nội bộ, quản lý công việc
        và sử dụng các tính năng dành riêng cho nhân sự DevTech.
      </p>

      <p>
        Chào mừng bạn đến với DevTech! 
      </p>

      <hr style="margin:24px 0" />

      <p style="font-size:12px;color:#777">
        DevTech — Internal Communication & Work Platform<br/>
        Email này được gửi tự động, vui lòng không trả lời.
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
