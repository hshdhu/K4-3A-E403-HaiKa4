# Reflection — Lê Văn Tài (code)

## 1. Vai trò của tôi

Trong repo tôi khai vai trò Thành viên, phụ trách phần code (README và `spec.md` §8.1).

## 2. Phần tôi tham gia

Trong phần code, tôi tham gia theo hướng phối hợp xây dựng, review và kiểm chứng prototype. Cụ thể, tôi đã:

- phối hợp kiểm tra prototype chọn 3 mức độ trong `index.html`, `script.js` và `styles.css`;
- review luồng backend trong `server.js`, đặc biệt prompt theo `level`, các kiểm tra coverage/formatting/evidence và policy guard cho nguồn xung đột hoặc câu hỏi mơ hồ;
- kiểm tra pipeline `lessonContext`: fixture demo trong `lesson-context.js` được gửi qua `POST /api/ask` và được đưa vào prompt trong thẻ `<lesson_context>`;
- đọc và chạy bộ test để kiểm chứng các failure case như corpus rỗng, static-file exposure, grounding, retry và reviewer JSON.


## 3. AI đã hỗ trợ tôi như thế nào

Ở mức workflow, AI hỗ trợ tôi gợi ý cấu trúc server/prompt, hỗ trợ viết và kiểm tra test, và rà các lỗi như static-file exposure hay reviewer JSON parse không ổn định.

AI hỗ trợ tạo nháp và kiểm tra; tôi vẫn review kết quả, đọc lại từng guard và chịu trách nhiệm với phần reflection/code mà mình xác nhận. Tôi đã chạy `npm test` trong thư mục `codebase/`: 28/28 test pass.

## 4. Một bài học từ failure thật của nhóm

Failure tôi chọn là CP3 có 2 no-evidence hallucination (cùng họ với grounding hard case chỉ 1/4). Nguyên nhân là lúc đó code chỉ lo đường happy path (có đủ nguồn thì trả lời), chưa có guard cho trường hợp nguồn thiếu, nguồn xung đột hay câu hỏi mơ hồ. Sau CP3 phía code mới thêm lessonContext, policy guard và corpus rỗng, rồi khóa bằng test. Bài học: happy path chưa đủ, phải viết guard và test cho failure case ngay từ đầu.
