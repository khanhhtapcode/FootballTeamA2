# 📋 TÀI LIỆU NGHIỆP VỤ — HỆ THỐNG QUẢN LÝ ĐỘI BÓNG

> **Dự án:** FC A2Brotherhoods — Football Team Manager
> **Nền tảng:** Google Sheets + Google Apps Script
> **Phiên bản:** 1.0
> **Cập nhật:** 2026

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Các thực thể dữ liệu](#2-các-thực-thể-dữ-liệu)
3. [Module Quản lý Thành viên](#3-module-quản-lý-thành-viên)
4. [Module Quản lý Quỹ](#4-module-quản-lý-quỹ)
5. [Module Lịch sử Trận đấu](#5-module-lịch-sử-trận-đấu)
6. [Module Chi phí](#6-module-chi-phí)
7. [Module Lịch thi đấu](#7-module-lịch-thi-đấu)
8. [Module Thu tiền Áo](#8-module-thu-tiền-áo)
9. [Module Thống kê Tổng quan](#9-module-thống-kê-tổng-quan)
10. [Quy trình nghiệp vụ](#10-quy-trình-nghiệp-vụ)
11. [Quy tắc dữ liệu](#11-quy-tắc-dữ-liệu)
12. [Cấu trúc Sheets](#12-cấu-trúc-sheets)

---

## 1. Tổng quan hệ thống

### 1.1 Mục tiêu

Hệ thống hỗ trợ ban quản lý đội bóng phong trào theo dõi và điều phối các hoạt động vận hành, bao gồm: quản lý danh sách thành viên, thu quỹ định kỳ, ghi nhận kết quả thi đấu, kiểm soát chi phí, lên lịch trận đấu và theo dõi thanh toán trang phục.

### 1.2 Người dùng

| Vai trò | Mô tả | Quyền hạn |
|---|---|---|
| Quản lý / Trưởng nhóm | Người vận hành hệ thống | Toàn quyền |
| Thủ quỹ | Quản lý thu chi | Quỹ, Chi phí, Tiền áo |
| Thành viên | Xem thông tin cá nhân | Chỉ xem |

### 1.3 Phạm vi hệ thống

```
┌─────────────────────────────────────────────────────┐
│               HỆ THỐNG QUẢN LÝ ĐỘI BÓNG            │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ Thành    │   Quỹ    │  Trận    │  Chi     │  Tiền   │
│ viên     │  hàng    │  đấu     │  phí     │  áo     │
│          │  tháng   │          │          │         │
└──────────┴──────────┴──────────┴──────────┴─────────┘
                         ▼
              ┌──────────────────┐
              │   THỐNG KÊ       │
              │   TỔNG QUAN      │
              └──────────────────┘
```

---

## 2. Các thực thể dữ liệu

### 2.1 Thành viên (Member)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| STT | Số | ✅ | Số thứ tự tự tăng |
| Họ và Tên | Văn bản | ✅ | Tên đầy đủ, định danh chính |
| Vị trí | Enum | ❌ | Thủ môn / Hậu vệ / Tiền vệ / Tiền đạo / Đa năng |
| Số áo | Số | ❌ | Số áo thi đấu (1–99) |
| Số điện thoại | Văn bản | ❌ | Liên lạc |
| Ngày tham gia | Ngày | ✅ | Tự điền khi thêm mới |
| Trạng thái | Enum | ✅ | Hoạt động / Tạm nghỉ / Giải nghệ |
| Tổng trận | Số | ❌ | Tổng số trận đã tham gia |
| Ghi chú | Văn bản | ❌ | Thông tin bổ sung |

### 2.2 Bản ghi Quỹ (Fund Record)

| Trường | Kiểu | Mô tả |
|---|---|---|
| STT | Số | Tương ứng với STT thành viên |
| Họ và Tên | Văn bản | Liên kết với thực thể Thành viên |
| T1 → T12 | Enum | ✅ Đã đóng / ❌ Chưa đóng / — Không tham gia |
| Tổng đã đóng | Số (công thức) | = Số tháng ✅ × Mức đóng |
| Còn nợ | Số (công thức) | = Số tháng ❌ × Mức đóng |

### 2.3 Trận đấu (Match)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| STT | Số | ✅ | Tự tăng |
| Ngày | Ngày | ✅ | Ngày thi đấu |
| Đối thủ | Văn bản | ✅ | Tên đội đối phương |
| Sân đấu | Văn bản | ❌ | Địa điểm thi đấu |
| Tỷ số | Văn bản | ❌ | Định dạng: "X - Y" |
| Kết quả | Enum | ✅ | Thắng / Hòa / Thua |
| Số người | Số | ✅ | Số thành viên tham gia |
| Chi phí sân | Số | ❌ | Tổng tiền thuê sân |
| Phí/người | Số (tính tự động) | — | = Chi phí sân ÷ Số người |
| Người ghi bàn | Văn bản | ❌ | Danh sách, định dạng: "Tên(số bàn)" |
| Ghi chú | Văn bản | ❌ | Nhận xét sau trận |

### 2.4 Chi phí (Expense)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| STT | Số | ✅ | Tự tăng |
| Ngày | Ngày | ✅ | Ngày phát sinh chi phí |
| Loại | Enum | ✅ | Tiền sân / Mua bóng / Trang phục / Nước uống / Đăng ký giải / Khác |
| Mô tả | Văn bản | ✅ | Diễn giải chi tiết |
| Số tiền | Số | ✅ | Giá trị bằng VNĐ |
| Người chi | Văn bản | ❌ | Người ứng tiền |
| Nguồn tiền | Enum | ✅ | Quỹ đội / Tự túc / Tài trợ |
| Ghi chú | Văn bản | ❌ | Thông tin thêm |

### 2.5 Đơn áo (Jersey Order)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| STT | Số | ✅ | Tự tăng |
| Họ và Tên | Văn bản | ✅ | Liên kết thành viên |
| Số áo | Số | ❌ | Số in trên áo |
| Size | Enum | ❌ | XS / S / M / L / XL / XXL / XXXL |
| Màu / Loại | Văn bản | ❌ | Mô tả mẫu áo |
| Số lượng | Số | ✅ | Mặc định = 1 |
| Đơn giá | Số | ✅ | Giá 1 chiếc (VNĐ) |
| Thành tiền | Số (công thức) | — | = Số lượng × Đơn giá |
| Đã trả | Số | ✅ | Cộng dồn qua các lần thanh toán |
| Còn nợ | Số (công thức) | — | = Thành tiền − Đã trả |
| Trạng thái | Enum (tự động) | — | Chưa trả / Trả một phần / Đã trả đủ / Miễn phí |
| Ghi chú | Văn bản | ❌ | Lịch sử thanh toán tự ghi thêm |

---

## 3. Module Quản lý Thành viên

### 3.1 Chức năng

**Thêm thành viên mới**
- Nhập thông tin qua dialog form
- Hệ thống tự điền ngày tham gia = ngày hiện tại
- Trạng thái mặc định = "Hoạt động"
- Sau khi thêm, hệ thống tự động tạo bản ghi quỹ tương ứng trong sheet QUỸ HÀNG THÁNG

**Cập nhật trạng thái**
- Chuyển thành viên sang "Tạm nghỉ" hoặc "Giải nghệ"
- Ghi chú lý do thay đổi

### 3.2 Quy tắc nghiệp vụ

- Họ và Tên là trường định danh chính — **không được trùng** giữa các thành viên
- Khi thêm thành viên mới, bản ghi quỹ được khởi tạo với:
  - Các tháng đã qua trong năm → `❌` (chưa đóng)
  - Các tháng chưa đến → `—` (không tham gia)
- Thành viên "Giải nghệ" vẫn giữ nguyên lịch sử, không bị xóa

### 3.3 Luồng xử lý

```
[Nhập form] → Validate (tên không rỗng)
    → Ghi vào sheet THÀNH VIÊN
    → Tự động tạo dòng tương ứng trong QUỸ HÀNG THÁNG
    → Thông báo thành công
```

---

## 4. Module Quản lý Quỹ

### 4.1 Chức năng

**Ghi nhận đóng quỹ đơn lẻ**
- Chọn thành viên + tháng + trạng thái
- Ba giá trị có thể ghi: `✅` (đã đóng), `❌` (chưa đóng), `—` (không tham gia)

**Đóng quỹ hàng loạt**
- Chọn tháng và tick chọn danh sách thành viên đã đóng
- Ghi nhận đồng thời nhiều người, tiết kiệm thời gian

**Kiểm tra nợ quỹ**
- Liệt kê thành viên chưa đóng tháng hiện tại
- Hiển thị nợ tồn đọng từ đầu năm, sắp xếp theo số tháng nợ giảm dần

### 4.2 Quy tắc nghiệp vụ

- **Mức đóng quỹ** cố định theo cấu hình (`FUND_AMOUNT`), mặc định 100.000 ₫/tháng
- **Tổng đã đóng** = Số ô `✅` × Mức đóng/tháng
- **Còn nợ** = Số ô `❌` × Mức đóng/tháng (ô `—` không tính nợ)
- Công thức dùng `SUMPRODUCT` để tránh lỗi encoding với emoji

### 4.3 Màu sắc trạng thái

| Trạng thái | Ký hiệu | Màu nền |
|---|---|---|
| Đã đóng | ✅ | Xanh lá nhạt `#D5F5E3` |
| Chưa đóng | ❌ | Đỏ nhạt `#FADBD8` |
| Không tham gia | — | Xanh dương nhạt `#EBF5FB` |
| Tháng tương lai | — | Xanh dương nhạt |

### 4.4 Công thức tính

```
Tổng đã đóng = SUMPRODUCT((C:N = "✅") * 1) × FUND_AMOUNT
Còn nợ       = SUMPRODUCT((C:N = "❌") * 1) × FUND_AMOUNT
```

---

## 5. Module Lịch sử Trận đấu

### 5.1 Chức năng

- Ghi nhận kết quả từng trận đấu
- Tính phí/người tự động từ tổng chi phí sân ÷ số người
- Chi phí sân tự động được đẩy sang sheet CHI PHÍ (loại "Tiền sân")
- Hiển thị màu theo kết quả

### 5.2 Quy tắc nghiệp vụ

- **Phí/người** = Chi phí sân ÷ Số người tham gia (làm tròn đến đơn vị VNĐ)
- Khi `Chi phí sân > 0`, hệ thống **tự động tạo bản ghi chi phí** loại "Tiền sân"
- Tỷ số nhập theo định dạng tự do (VD: "3-1", "2 - 0")

### 5.3 Màu sắc kết quả

| Kết quả | Màu nền |
|---|---|
| Thắng | Xanh lá `#D5F5E3` |
| Hòa | Vàng nhạt `#FEF9E7` |
| Thua | Đỏ nhạt `#FADBD8` |

### 5.4 Thống kê từ module này

- Tổng số trận
- Số trận Thắng / Hòa / Thua
- Tỷ lệ thắng (%) = Thắng ÷ Tổng trận × 100
- 5 trận gần nhất (hiển thị trên dashboard)

---

## 6. Module Chi phí

### 6.1 Chức năng

- Ghi nhận tất cả khoản chi của đội
- Phân loại chi phí theo danh mục
- Phân biệt nguồn tiền chi

### 6.2 Phân loại chi phí

| Loại | Mô tả ví dụ |
|---|---|
| Tiền sân | Thuê sân 90 phút |
| Mua bóng | Bóng Futsal size 4 |
| Trang phục | Áo đấu, tất, băng bó |
| Nước uống | Nước sau trận |
| Đăng ký giải | Giải phong trào mùa hè |
| Khác | Phát sinh khác |

### 6.3 Nguồn tiền

| Nguồn | Ý nghĩa |
|---|---|
| Quỹ đội | Lấy từ quỹ chung đã thu |
| Tự túc | Cá nhân bỏ tiền, chưa hoàn |
| Tài trợ | Được tài trợ từ bên ngoài |

### 6.4 Quy tắc nghiệp vụ

- Mọi chi phí phát sinh đều phải ghi nhận, kể cả tiền sân (được tự động tạo từ module Trận đấu)
- **Số dư quỹ** = Tổng quỹ thu được − Tổng chi phí nguồn "Quỹ đội"
- Chi phí "Tự túc" hiển thị để minh bạch nhưng không trừ vào quỹ đội

---

## 7. Module Lịch thi đấu

### 7.1 Chức năng

- Lên lịch các trận đấu sắp diễn ra
- Quản lý trạng thái xác nhận
- Hiển thị trên dashboard thống kê

### 7.2 Trạng thái lịch

| Trạng thái | Màu | Ý nghĩa |
|---|---|---|
| Đã xác nhận | Xanh lá | Đã có kết quả rõ ràng |
| Chờ xác nhận | Vàng | Đang đàm phán, chưa chốt |
| Đã hủy | Xám | Không diễn ra |

### 7.3 Quy tắc nghiệp vụ

- Lịch "Đã hủy" không hiển thị trên dashboard
- Dashboard chỉ hiển thị tối đa 5 trận sắp tới gần nhất
- Sau khi trận diễn ra, chủ động chuyển sang module Lịch sử Trận đấu để ghi kết quả

---

## 8. Module Thu tiền Áo

### 8.1 Chức năng

- Quản lý đơn đặt áo của từng thành viên
- Theo dõi tiến độ thanh toán
- Hiển thị tổng hợp thu/nợ trên đầu sheet

### 8.2 Vòng đời đơn áo

```
[Chưa có đơn]
      ↓
[Tạo đơn áo] → Trạng thái: "Chưa trả"
      ↓
[Ghi nhận thanh toán một phần] → "Trả một phần"
      ↓
[Thanh toán đủ / Trả hết] → "Đã trả đủ"

Đặc biệt: Miễn phí (không thu tiền, không tính nợ)
```

### 8.3 Tính toán tự động

```
Thành tiền = Số lượng × Đơn giá
Còn nợ     = Thành tiền − Đã trả
Trạng thái = Đã trả đủ  (nếu Còn nợ ≤ 0)
           = Trả một phần (nếu 0 < Đã trả < Thành tiền)
           = Chưa trả    (nếu Đã trả = 0)
```

### 8.4 Màu sắc trạng thái áo

| Trạng thái | Màu |
|---|---|
| Đã trả đủ | Xanh lá `#D5F5E3` |
| Trả một phần | Vàng `#FEF9E7` |
| Chưa trả | Đỏ `#FADBD8` |
| Miễn phí | Xanh nhạt `#D6EAF8` |

### 8.5 Dòng tổng kết (tự động cập nhật)

Dòng 2 của sheet hiển thị liên tục:

```
📦 [N] người | 💰 Tổng: X ₫ | ✅ Đã thu: Y ₫ | ❌ Còn nợ: Z ₫ | ✔ Đủ: A | ⚠ Chưa xong: B
```

### 8.6 Quy tắc thanh toán

- Hệ thống **cộng dồn** số tiền qua từng lần thanh toán (không ghi đè)
- Lựa chọn "Trả hết" tự động tính số tiền còn lại và đóng đơn
- Ghi chú tự động lưu lịch sử: `[Hình thức: Số tiền]`
- Không cho nhập số tiền vượt quá thành tiền

---

## 9. Module Thống kê Tổng quan

### 9.1 Nội dung dashboard

Dashboard được tạo tự động, gồm các khối:

| Khối | Nội dung |
|---|---|
| 👥 Thành viên | Tổng số, đang hoạt động, tạm nghỉ |
| ⚽ Thành tích | Tổng trận, W/D/L, tỷ lệ thắng |
| 💰 Tài chính | Tổng thu quỹ, tổng chi, số dư (màu xanh/đỏ) |
| 📅 Quỹ theo tháng | Bảng 12 tháng: đã đóng / chưa đóng / tiền thu |
| 🕐 5 trận gần nhất | Kết quả 5 trận mới nhất |
| 📅 Lịch sắp tới | Tối đa 5 trận đã xác nhận |

### 9.2 Quy tắc làm mới

- Dashboard được **xóa và tạo lại** hoàn toàn mỗi lần cập nhật
- Không lưu dữ liệu trực tiếp trên sheet THỐNG KÊ
- Gọi thủ công qua menu hoặc tự động qua trigger hàng ngày

### 9.3 Màu số dư quỹ

| Điều kiện | Màu |
|---|---|
| Số dư ≥ 0 | Xanh lá (đủ tiền) |
| Số dư < 0 | Đỏ (thiếu tiền) |

---

## 10. Quy trình nghiệp vụ

### 10.1 Quy trình đầu mùa giải

```
1. Chạy "Setup lại + Seed thành viên"
2. Cập nhật vị trí, số áo cho từng người
3. Tạo bảng Thu tiền Áo (nếu có đặt áo mùa mới)
4. Nhập thông tin đơn áo từng người
```

### 10.2 Quy trình hàng tháng

```
1. Đầu tháng: Nhắc nhở đóng quỹ qua menu "Kiểm tra nợ quỹ"
2. Thu tiền: Dùng "Đóng quỹ hàng loạt" cho tiết kiệm thời gian
3. Ghi nhận từng người đặc biệt: Dùng "Ghi nhận đóng quỹ"
4. Cuối tháng: "Cập nhật thống kê" để xem tổng quan
```

### 10.3 Quy trình sau trận đấu

```
1. Vào menu "Thêm kết quả trận đấu"
2. Điền: ngày, đối thủ, tỷ số, kết quả, số người, chi phí sân
3. Hệ thống tự tạo bản ghi chi phí nếu có tiền sân
4. Ghi danh sách người ghi bàn (nếu muốn theo dõi)
5. Cập nhật thống kê để làm mới dashboard
```

### 10.4 Quy trình thu tiền áo

```
1. Tạo bảng Thu tiền Áo (1 lần đầu mùa)
2. Sync thành viên vào bảng (tự động khi tạo)
3. Nhập đơn áo từng người: size, màu, số lượng, đơn giá
4. Khi thu tiền: "Ghi nhận thanh toán áo"
   → Chọn người → Nhập số tiền → Chọn hình thức
   → Hoặc chọn "Trả hết" để tự tính
5. Kiểm tra tình trạng: "Danh sách chưa trả tiền áo"
```

---

## 11. Quy tắc dữ liệu

### 11.1 Ràng buộc nhập liệu

| Trường | Ràng buộc |
|---|---|
| Họ và Tên | Không được rỗng |
| Vị trí | Chỉ nhận giá trị trong danh sách dropdown |
| Trạng thái thành viên | Chỉ nhận: Hoạt động / Tạm nghỉ / Giải nghệ |
| Kết quả trận | Chỉ nhận: Thắng / Hòa / Thua |
| Trạng thái quỹ | Chỉ nhận: ✅ / ❌ / — |
| Số tiền | Phải là số dương |
| Ngày | Định dạng dd/MM/yyyy |

### 11.2 Tính toán tự động

| Trường | Công thức |
|---|---|
| Phí/người (Trận đấu) | = Chi phí sân ÷ Số người |
| Tổng đã đóng (Quỹ) | = SUMPRODUCT(tháng="✅") × FUND_AMOUNT |
| Còn nợ (Quỹ) | = SUMPRODUCT(tháng="❌") × FUND_AMOUNT |
| Thành tiền (Áo) | = Số lượng × Đơn giá |
| Còn nợ (Áo) | = Thành tiền − Đã trả |

### 11.3 Liên kết giữa các module

```
THÀNH VIÊN ──────┬──────► QUỸ HÀNG THÁNG
                 │            (tạo tự động khi thêm TV)
                 │
                 └──────► THU TIỀN ÁO
                              (sync khi tạo bảng)

LỊCH SỬ ĐẤU ──────────► CHI PHÍ
                              (tạo tự động nếu có tiền sân)

Tất cả modules ────────► THỐNG KÊ
                              (tổng hợp khi cập nhật)
```

---

## 12. Cấu trúc Sheets

### 12.1 Danh sách sheets

| Sheet | Tên | Dữ liệu bắt đầu từ |
|---|---|---|
| THÀNH VIÊN | Danh sách thành viên | Hàng 3 |
| QUỸ HÀNG THÁNG | Ma trận đóng quỹ | Hàng 4 |
| LỊCH SỬ ĐẤU | Kết quả các trận | Hàng 3 |
| CHI PHÍ | Các khoản chi | Hàng 3 |
| LỊCH THI ĐẤU | Trận sắp tới | Hàng 3 |
| THU TIỀN ÁO | Đơn áo từng người | Hàng 4 |
| THỐNG KÊ | Dashboard tổng quan | Hàng 1 (tự động) |

### 12.2 Cấu trúc QUỸ HÀNG THÁNG

```
Cột:  A    B           C   D   ...  N    O              P
      STT  HỌ VÀ TÊN  T1  T2  ...  T12  TỔNG ĐÃ ĐÓNG  CÒN NỢ
Hàng 1: Tiêu đề (merge A1:P1)
Hàng 2: Chú thích ký hiệu (merge A2:P2)
Hàng 3: Header cột
Hàng 4+: Dữ liệu thành viên
```

### 12.3 Cấu hình hệ thống (CFG)

```javascript
CFG = {
  TEAM_NAME   : 'FC A2Brotherhoods',   // Tên đội
  FUND_AMOUNT : 100000,                 // Mức đóng quỹ (VNĐ/tháng)
  TIMEZONE    : 'Asia/Ho_Chi_Minh',    // Múi giờ
}
```

> ⚠️ Thay đổi `FUND_AMOUNT` chỉ ảnh hưởng đến các bản ghi **thêm mới sau đó**. Các công thức đã có trong sheet sẽ cần chạy `fixFundFormulas()` để cập nhật.

---

## Phụ lục A — Danh sách hàm Apps Script

| Hàm | Mô tả |
|---|---|
| `setupAndSeedAll()` | Setup lại toàn bộ + seed thành viên |
| `fixFundFormulas()` | Sửa lỗi #ERROR công thức quỹ |
| `apiAddMember()` | Thêm thành viên (gọi từ dialog) |
| `apiMarkFund()` | Ghi nhận đóng quỹ đơn lẻ |
| `apiBulkFund()` | Đóng quỹ hàng loạt |
| `apiAddMatch()` | Thêm kết quả trận đấu |
| `apiAddSchedule()` | Thêm lịch thi đấu |
| `apiAddExpense()` | Thêm chi phí |
| `apiSaveJersey()` | Thêm / cập nhật đơn áo |
| `apiMarkJerseyPaid()` | Ghi nhận thanh toán áo |
| `checkUnpaid()` | Kiểm tra nợ quỹ |
| `updateStats()` | Cập nhật dashboard thống kê |

---

## Phụ lục B — Mã màu hệ thống

| Mã | Hex | Dùng cho |
|---|---|---|
| Navy | `#1B4F72` | Tiêu đề chính |
| Blue | `#2E86C1` | Header cột |
| Light | `#D6EAF8` | Chú thích, accent |
| Alt | `#F2F3F4` | Dòng xen kẽ |
| Win / Paid | `#D5F5E3` | Thắng, đã đóng, đã trả |
| Draw / Partial | `#FEF9E7` | Hòa, trả một phần |
| Lose / Unpaid | `#FADBD8` | Thua, chưa đóng, chưa trả |
| Future | `#EBF5FB` | Tháng chưa đến |

---

*Tài liệu này mô tả nghiệp vụ phiên bản 1.0. Khi có thay đổi tính năng, cần cập nhật tương ứng.*
