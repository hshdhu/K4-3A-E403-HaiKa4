# Reflection — Nguyễn Quang Huy (demo)

## 1. Vai trò của tôi

Trong repo tôi khai vai trò Thành viên, phụ trách phần demo (README và `spec.md` §8.1).

## 2. Phần tôi tham gia

Phần tôi có bằng chứng trong git là hai commit đầu dưới tài khoản `Nguyen Quang Huy`: commit khởi tạo repo (tạo README) và commit "add spec.md, readme.md, teammates.md" (thêm spec.md, TEAMMATES.md, sửa README).

Về phần demo, repo có `demo-slides.pdf` nhưng file này đang untracked (không nằm trong commit history), còn `demo-slides-content.md` hiện không còn trong thư mục. Flow demo dự kiến: chạy prototype, chọn 3 level, gọi model thật, đổi level để regenerate. Cụ thể ai soạn slide/video thì tôi chưa xác minh được:

[CẦN THÀNH VIÊN XÁC NHẬN: phần demo trực tiếp thực hiện]

## 3. AI đã hỗ trợ tôi như thế nào

Ở mức workflow, AI hỗ trợ tôi soạn flow trình diễn và chỉnh wording cho slide/kịch bản demo.

AI hỗ trợ tạo nháp và kiểm tra; thành viên vẫn phải review kết quả, chạy test và chịu trách nhiệm với phần nộp. Nội dung demo cuối cùng tôi vẫn phải tự chạy thử và kiểm tra trước khi trình bày.

## 4. Một bài học từ failure thật của nhóm

Run 02 dùng `zai-org/GLM-5.3-Flash` bị 11/26 case timeout hoặc 502 (9 timeout client + 2 server 502) chỉ vì model sinh quá chậm. Với vai trò demo, điều này nhắc tôi phải luôn có backup: nếu model/network fail ngay lúc trình bày thì buổi demo hỏng. Giải pháp là chuẩn bị kịch bản offline, chọn trước model nhanh (DeepSeek như Final), quay sẵn video hoặc ghi sẵn câu trả lời mẫu.

### Những điểm cần tôi xác nhận trước khi nộp

- [CẦN THÀNH VIÊN XÁC NHẬN: phần demo trực tiếp thực hiện] ai làm slide/video; có cần commit lại `demo-slides-content.md` không.
- Xác nhận model dùng cho demo cuối (có phải `deepseek-ai/DeepSeek-V4-Flash-0731` không).
- Xác nhận đã có video/screenshot demo hay chưa.