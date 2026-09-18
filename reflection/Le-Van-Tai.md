# Reflection — Lê Văn Tài (code)

## 1. Vai trò của tôi

Trong repo tôi khai vai trò Thành viên, phụ trách phần code (README và `spec.md` §8.1).

## 2. Phần tôi tham gia

Phần code hiện có trong `codebase/` gồm:

- Prototype level selector 3 mức (Mới làm quen / Đã có nền tảng / Muốn đào sâu) trong `index.html`, `script.js`, `styles.css`.
- Backend `server.js`: prompt theo `level`, kiểm tra coverage/formatting/evidence, policy guard cho nguồn xung đột và câu hỏi mơ hồ.
- lessonContext pipeline: `lesson-context.js` (fixture demo) → `POST /api/ask` → prompt chứa `<lesson_context>`.
- Test: `npm test` chạy 28 unit tests trong `test/retriever.test.js`.

Nhưng git history không có commit nào dưới tài khoản của tôi; `codebase/` được commit dưới tài khoản khác. Vì vậy tôi chưa thể tự khẳng định đã viết phần nào:

[CẦN THÀNH VIÊN XÁC NHẬN: phần trực tiếp thực hiện]

## 3. AI đã hỗ trợ tôi như thế nào

Ở mức workflow, AI hỗ trợ tôi gợi ý cấu trúc server/prompt, hỗ trợ viết và kiểm tra test, và rà các lỗi như static-file exposure hay reviewer JSON parse không ổn định.

AI hỗ trợ tạo nháp và kiểm tra; thành viên vẫn phải review kết quả, chạy test và chịu trách nhiệm với phần nộp. Tôi vẫn phải tự chạy `npm test` và đọc lại từng guard.

## 4. Một bài học từ failure thật của nhóm

Failure tôi chọn là CP3 có 2 no-evidence hallucination (cùng họ với grounding hard case chỉ 1/4). Nguyên nhân là lúc đó code chỉ lo đường happy path (có đủ nguồn thì trả lời), chưa có guard cho trường hợp nguồn thiếu, nguồn xung đột hay câu hỏi mơ hồ. Sau CP3 phía code mới thêm lessonContext, policy guard và corpus rỗng, rồi khóa bằng test. Bài học: happy path chưa đủ, phải viết guard và test cho failure case ngay từ đầu.

### Những điểm cần tôi xác nhận trước khi nộp

- [CẦN THÀNH VIÊN XÁC NHẬN: phần code trực tiếp thực hiện] vs phần do đồng đội commit hộ.
- Xác nhận mình đã chạy `npm test` và số test (28) là đúng.
- Xác nhận `lesson-context.js` fixture do tôi viết hay do thành viên khác.