# Reflection — Tạ Văn Tuấn (Nhóm trưởng / spec)

## 1. Vai trò của tôi

Trong repo, tôi khai vai trò Nhóm trưởng và chịu trách nhiệm chính phần spec (README và `spec.md` §8.1). Git history cũng ghi phần lớn commit dưới tài khoản `Ta-Van-Tuan-2A202602806` của tôi.

## 2. Phần tôi tham gia

Phần có bằng chứng nằm trong các commit ghi dưới tài khoản của tôi, đúng mảng spec/trưởng nhóm:

- Spec từ problem statement → impact → hard cases → quality bar → ghi kết quả eval. Commit "strengthen impact analysis and product decision" ứng với §2; commit "điền kết quả Run 02 vào spec mục 7.6" ứng với phần ghi số.
- Chạy/điều phối eval và chốt báo cáo: commit "eval: final run with lessonContext end-to-end" và "finalize README for CP4 submission".

Tôi mô tả ở mức quan sát được từ commit messages; phạm vi câu nào do tôi tự viết cần nhóm xác nhận (xem mục cuối).

## 3. AI đã hỗ trợ tôi như thế nào

AI hỗ trợ ở workflow: gợi ý cấu trúc spec, rà inconsistency giữa số liệu README / spec / báo cáo eval, chỉnh wording phần impact và quality bar, so sánh metric CP3–Run 02–Final.

AI hỗ trợ tạo nháp và kiểm tra; thành viên vẫn phải review kết quả, chạy test và chịu trách nhiệm với phần nộp. Con số cuối tôi vẫn tự đối chiếu lại file kết quả thật.

## 4. Một bài học từ failure thật của nhóm

CP3 chỉ đạt 1/4 grounding hard case. Với vai trò spec, điều này cho tôi thấy mình chưa "khóa" quality bar đủ chặt từ đầu: tôi ghi nguyên tắc grounding nhưng chưa ép nó thành tiêu chí chấm cứng, nên tới lúc chạy mới lộ ra model sinh claim ngoài nguồn. Bài học là phải chốt quality criteria và quality bar trước khi chạy, không bao giờ chỉnh tiêu chuẩn sau khi đã nhìn thấy kết quả Final.
