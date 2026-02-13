 import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
 import { saveAs } from "file-saver";
 
 export async function generateUserGuideWord() {
   const doc = new Document({
     sections: [
       {
         properties: {},
         children: [
           // Cover Page
           new Paragraph({
             children: [new TextRun({ text: "", size: 48 })],
             spacing: { after: 1000 },
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: "HƯỚNG DẪN SỬ DỤNG",
                 bold: true,
                 size: 56,
                 color: "2980B9",
               }),
             ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 400 },
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: "HỆ THỐNG QUẢN LÝ DOANH NGHIỆP",
                 bold: true,
                 size: 40,
                 color: "2980B9",
               }),
             ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 800 },
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: "Phiên bản: 1.0",
                 size: 24,
                 color: "666666",
               }),
             ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: `Ngày cập nhật: ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}`,
                 size: 24,
                 color: "666666",
               }),
             ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 1200 },
           }),
 
           // Table of Contents
           createHeading("MỤC LỤC", 1),
           createParagraph("1. Giới thiệu chung"),
           createParagraph("2. Đăng nhập hệ thống"),
           createParagraph("3. Module Tổng quan"),
           createParagraph("4. Module Nhân sự"),
           createParagraph("5. Module Quản lý Kho"),
           createParagraph("6. Module Cài đặt"),
           createParagraph("7. Quản lý người dùng"),
           createParagraph("8. Xuất báo cáo"),
 
           // Section 1
           createHeading("1. GIỚI THIỆU CHUNG", 1),
           createDivider(),
           createParagraph(
             "Hệ thống Quản lý Doanh nghiệp là giải pháp toàn diện giúp doanh nghiệp quản lý các hoạt động kinh doanh bao gồm: Quản lý nhân sự, Quản lý kho hàng và tài sản, Theo dõi dự án và nhiều chức năng khác."
           ),
           createSubHeading("Các module chính:"),
           createBullet("Tổng quan: Xem thống kê tổng quan về hoạt động doanh nghiệp"),
           createBullet("Nhân sự: Quản lý thông tin nhân viên, tài liệu nhân sự"),
           createBullet("Quản lý Kho: Quản lý tài sản, hàng hóa, nhập xuất kho"),
           createBullet("Cài đặt: Cấu hình hệ thống, sơ đồ tổ chức"),
           createBullet("Quản lý người dùng: Phân quyền truy cập cho người dùng"),
 
           // Section 2
           createHeading("2. ĐĂNG NHẬP HỆ THỐNG", 1),
           createDivider(),
           createSubHeading("Bước 1: Truy cập trang đăng nhập"),
           createParagraph("Mở trình duyệt web và truy cập địa chỉ website của hệ thống."),
           createSubHeading("Bước 2: Nhập thông tin đăng nhập"),
           createBullet("Email: Nhập địa chỉ email đã được cấp"),
           createBullet("Mật khẩu: Nhập mật khẩu của bạn"),
           createSubHeading("Bước 3: Nhấn nút Đăng nhập"),
           createParagraph("Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang Tổng quan."),
 
           // Section 3
           createHeading("3. MODULE TỔNG QUAN", 1),
           createDivider(),
           createParagraph(
             "Module Tổng quan cung cấp cái nhìn tổng thể về hoạt động của doanh nghiệp với các thống kê quan trọng."
           ),
           createSubHeading("Các thông tin hiển thị:"),
           createBullet("Tổng số nhân viên hiện tại"),
           createBullet("Tổng số tài sản đang quản lý"),
           createBullet("Thống kê nhập xuất kho"),
           createBullet("Cảnh báo tồn kho thấp"),
           createBullet("Các hoạt động gần đây"),
 
           // Section 4
           createHeading("4. MODULE NHÂN SỰ", 1),
           createDivider(),
           createSubHeading("4.1 Danh sách nhân viên"),
           createParagraph("Hiển thị danh sách tất cả nhân viên với các thông tin: Họ tên, Chức vụ, Phòng ban, Số điện thoại."),
           createSubHeading("4.2 Thêm nhân viên mới"),
           createBullet("Nhấn nút 'Thêm nhân viên'"),
           createBullet("Điền đầy đủ thông tin: Họ tên, Ngày sinh, Chức vụ, Phòng ban"),
           createBullet("Tải lên ảnh CMND/CCCD, Thẻ nhân viên, Chứng chỉ (nếu có)"),
           createBullet("Nhấn 'Lưu' để hoàn tất"),
           createSubHeading("4.3 Chỉnh sửa thông tin nhân viên"),
           createParagraph("Nhấn vào hàng nhân viên cần chỉnh sửa, cập nhật thông tin và nhấn 'Lưu'."),
           createSubHeading("4.4 Liên kết tài khoản người dùng"),
           createParagraph("Trong phần quản lý nhân viên, bạn có thể liên kết nhân viên với tài khoản đăng nhập hệ thống."),
 
           // Section 5
           createHeading("5. MODULE QUẢN LÝ KHO", 1),
           createDivider(),
           createSubHeading("5.1 Danh mục Tài sản"),
           createParagraph("Quản lý danh sách tất cả tài sản của doanh nghiệp bao gồm: Thiết bị, Công cụ, Vật tư."),
           createBullet("Xem danh sách tài sản với mã SKU, tên, loại, số lượng tồn kho"),
           createBullet("Thêm mới tài sản: Nhấn 'Thêm mới', điền thông tin và lưu"),
           createBullet("Import từ Excel: Tải file mẫu, điền dữ liệu và import"),
           createBullet("Xuất báo cáo Excel/PDF"),
           createSubHeading("5.2 Phiếu Nhập Kho (GRN)"),
           createParagraph("Quản lý các phiếu nhập hàng vào kho."),
           createBullet("Tạo phiếu nhập: Chọn tài sản, nhập số lượng, đơn giá"),
           createBullet("Import từ Excel: Hỗ trợ import hàng loạt từ file Excel"),
           createBullet("Xem lịch sử nhập kho theo thời gian"),
           createSubHeading("5.3 Phân Bổ & Xuất Kho"),
           createParagraph("Chức năng này chia làm 2 phần:"),
           createBullet("Phân bổ tài sản: Giao tài sản cho nhân viên sử dụng. Tài sản CÓ THỂ hoàn trả lại kho"),
           createBullet("Xuất kho: Xuất vật tư tiêu hao. Tài sản KHÔNG THỂ hoàn trả"),
           createSubHeading("5.4 Hoàn Trả Tài Sản"),
           createParagraph("Xử lý việc nhân viên hoàn trả tài sản đã được phân bổ."),
           createBullet("Chọn phiếu phân bổ cần hoàn trả"),
           createBullet("Nhập tình trạng tài sản khi hoàn trả"),
           createBullet("Xác nhận hoàn trả, tài sản sẽ được cập nhật lại vào kho"),
           createSubHeading("5.5 Quản lý Danh mục"),
           createParagraph("Thiết lập các danh mục hỗ trợ cho quản lý kho:"),
           createBullet("Danh mục sản phẩm: Phân loại tài sản theo nhóm"),
           createBullet("Thương hiệu: Quản lý các thương hiệu thiết bị"),
           createBullet("Nhóm sản phẩm: Gom nhóm sản phẩm cùng loại"),
           createBullet("Kho hàng: Quản lý các vị trí kho lưu trữ"),
           createSubHeading("5.6 Bảo trì Tài sản"),
           createParagraph("Theo dõi lịch sử bảo trì, sửa chữa tài sản."),
           createBullet("Ghi nhận các lần bảo trì với ngày, chi phí, người thực hiện"),
           createBullet("Xem tổng chi phí bảo trì theo từng tài sản"),
           createSubHeading("5.7 Thanh lý Tài sản"),
           createParagraph("Xử lý thanh lý tài sản không còn sử dụng."),
           createBullet("Chọn tài sản cần thanh lý"),
           createBullet("Nhập lý do, giá bán (nếu có)"),
           createBullet("Tài sản sẽ được chuyển sang trạng thái 'Đã thanh lý'"),
           createSubHeading("5.8 Khấu hao Tài sản"),
           createParagraph("Theo dõi giá trị khấu hao của tài sản cố định theo thời gian."),
 
           // Section 6
           createHeading("6. MODULE CÀI ĐẶT", 1),
           createDivider(),
           createSubHeading("6.1 Sơ đồ Tổ chức"),
           createParagraph("Xây dựng và quản lý sơ đồ cơ cấu tổ chức của doanh nghiệp."),
           createBullet("Thêm các vị trí/chức danh trong tổ chức"),
           createBullet("Liên kết vị trí với nhân viên cụ thể"),
           createBullet("Thiết lập mối quan hệ cấp trên - cấp dưới"),
           createBullet("Kéo thả để sắp xếp vị trí trên sơ đồ"),
           createSubHeading("6.2 Sao lưu & Khôi phục"),
           createParagraph("Quản lý sao lưu dữ liệu hệ thống."),
           createBullet("Thiết lập lịch sao lưu tự động"),
           createBullet("Sao lưu thủ công khi cần"),
           createBullet("Khôi phục dữ liệu từ bản sao lưu"),
 
           // Section 7
           createHeading("7. QUẢN LÝ NGƯỜI DÙNG", 1),
           createDivider(),
           createParagraph("(Chỉ dành cho Quản trị viên)"),
           createSubHeading("7.1 Tạo tài khoản mới"),
           createBullet("Nhấn 'Thêm người dùng'"),
           createBullet("Nhập Email và Mật khẩu"),
           createBullet("Chọn Vai trò: Quản trị viên, Kế toán, Hành chính nhân sự, Quản lý dự án, Người dùng"),
           createBullet("Nhấn 'Tạo' để hoàn tất"),
           createSubHeading("7.2 Phân quyền truy cập"),
           createParagraph("Cấu hình quyền truy cập cho từng người dùng:"),
           createBullet("Module được phép xem: Chọn các module người dùng có thể truy cập"),
           createBullet("Module được phép sửa: Chọn các module người dùng có thể chỉnh sửa dữ liệu"),
           createSubHeading("7.3 Các vai trò mặc định"),
           createBullet("Quản trị viên: Toàn quyền truy cập và chỉnh sửa tất cả module"),
           createBullet("Kế toán: Truy cập module Kế toán và báo cáo tài chính"),
           createBullet("Hành chính nhân sự: Quản lý thông tin nhân viên"),
           createBullet("Quản lý dự án: Theo dõi và quản lý các dự án"),
           createBullet("Người dùng: Quyền cơ bản, xem tổng quan"),
 
           // Section 8
           createHeading("8. XUẤT BÁO CÁO", 1),
           createDivider(),
           createParagraph("Hệ thống hỗ trợ xuất báo cáo ở nhiều định dạng khác nhau."),
           createSubHeading("8.1 Xuất Excel"),
           createBullet("Nhấn nút 'Xuất báo cáo' > 'Xuất Excel'"),
           createBullet("File Excel sẽ được tải về với đầy đủ dữ liệu"),
           createBullet("Có thể chỉnh sửa và in từ Excel"),
           createSubHeading("8.2 Xuất PDF"),
           createBullet("Nhấn nút 'Xuất báo cáo' > 'Xuất PDF'"),
           createBullet("File PDF được định dạng sẵn để in ấn"),
           createBullet("Hỗ trợ đầy đủ tiếng Việt"),
           createSubHeading("8.3 Các báo cáo có sẵn"),
           createBullet("Báo cáo tồn kho vật tư"),
           createBullet("Báo cáo danh sách tài sản"),
           createBullet("Báo cáo nhập xuất kho"),
           createBullet("Báo cáo phân bổ tài sản"),
           createBullet("Báo cáo danh sách nhân viên"),
 
           // Contact
           createHeading("LIÊN HỆ HỖ TRỢ", 1),
           createDivider(),
           createParagraph("Nếu bạn gặp vấn đề trong quá trình sử dụng, vui lòng liên hệ:"),
           createBullet("Email: support@company.com"),
           createBullet("Điện thoại: 0123 456 789"),
           createParagraph("Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ làm việc."),
 
           // Footer
           new Paragraph({
             children: [
               new TextRun({
                 text: "© 2025 - Hệ thống Quản lý Doanh nghiệp",
                 size: 18,
                 color: "999999",
               }),
             ],
             alignment: AlignmentType.CENTER,
             spacing: { before: 800 },
           }),
         ],
       },
     ],
   });
 
   const blob = await Packer.toBlob(doc);
   saveAs(blob, "Huong_Dan_Su_Dung_He_Thong.docx");
 }
 
 function createHeading(text: string, level: 1 | 2): Paragraph {
   return new Paragraph({
     children: [
       new TextRun({
         text,
         bold: true,
         size: level === 1 ? 28 : 24,
         color: "2C3E50",
       }),
     ],
     heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
     spacing: { before: 400, after: 200 },
   });
 }
 
 function createSubHeading(text: string): Paragraph {
   return new Paragraph({
     children: [
       new TextRun({
         text,
         bold: true,
         size: 22,
         color: "34495E",
       }),
     ],
     spacing: { before: 200, after: 100 },
   });
 }
 
 function createParagraph(text: string): Paragraph {
   return new Paragraph({
     children: [
       new TextRun({
         text,
         size: 20,
       }),
     ],
     spacing: { after: 100 },
     indent: { left: 200 },
   });
 }
 
 function createBullet(text: string): Paragraph {
   return new Paragraph({
     children: [
       new TextRun({
         text: "• " + text,
         size: 20,
       }),
     ],
     spacing: { after: 80 },
     indent: { left: 400 },
   });
 }
 
 function createDivider(): Paragraph {
   return new Paragraph({
     children: [],
     border: {
       bottom: {
         color: "BDC3C7",
         space: 1,
         style: BorderStyle.SINGLE,
         size: 6,
       },
     },
     spacing: { after: 200 },
   });
 }