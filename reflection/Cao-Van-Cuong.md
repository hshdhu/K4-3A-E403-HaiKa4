# Reflection — Cao Văn Cường (evidence)

## 1. Vai trò của tôi

Trong repo tôi khai vai trò Thành viên. Tôi tham gia kết hợp hai mảng: **evidence** (README và `spec.md` §8) và **code** — cụ thể tôi viết `gemini_tutor.py`. File này hiện chưa nằm trong git history của repo (chưa được commit), nên phần đóng góp code của tôi chưa thể hiện qua git log dưới tài khoản của tôi.

## 2. Phần tôi tham gia

Phần evidence hiện có trong repo gồm:

- `spec.md` §1.4: Evidence B (mining dữ liệu VLearn) và Evidence A (khảo sát pilot `n=4`).
- `evidence/mining-vlearn.md`: nguồn dữ liệu, keyword groups, cách dedup theo `turn_id`, cách đếm, kết quả 10.427 lượt không-preset với 744 lượt có tín hiệu (7,14%), 5 ví dụ nguyên văn kèm `turn_id`, và mục Limitations.

Tuy nhiên git history không có commit nào dưới tài khoản của tôi; file `mining-vlearn.md` được commit dưới tài khoản khác. Vì vậy tôi chưa thể tự khẳng định đã trực tiếp chạy hoặc tự viết phần nào:

[CẦN THÀNH VIÊN XÁC NHẬN: phần trực tiếp thực hiện]

## 3. AI đã hỗ trợ tôi như thế nào

Ở mức workflow, AI có thể đã hỗ trợ viết/kiểm tra câu truy vấn mining, chuẩn hóa cách đếm (loại preset, khử trùng theo `turn_id`), và rà xem số trong `spec.md` có khớp `mining-vlearn.md` không.

AI hỗ trợ tạo nháp và kiểm tra; thành viên vẫn phải review kết quả, chạy test và chịu trách nhiệm với phần nộp. Tôi vẫn tự đọc lại từng con số và từng ví dụ nguyên văn.

## 4. Một bài học từ failure thật của nhóm

Failure tôi chọn là automated evaluator bị false negative, buộc phải chấm thủ công: Final ghi tự động 23/26 nhưng chấm thủ công là 25/26, và `H-TRUTH-02` bị rule cộng nhầm thành "no-evidence hallucination" dù nội dung đúng. Với vai trò evidence, bài học là các con số phải audit được: không tin máy đếm một chiều, phải đọc lại output thật, và không được diễn đạt "744 lượt có tín hiệu" thành "744 người". Vì vậy `mining-vlearn.md` phải ghi rõ method, `turn_id` và limitations để người khác kiểm lại được.

### Những điểm cần tôi xác nhận trước khi nộp

- [CẦN THÀNH VIÊN XÁC NHẬN: phần trực tiếp thực hiện] ai đã chạy file CSV và ai viết `evidence/mining-vlearn.md`.
- Xác nhận số 10.427 / 744 và 5 quotes là số đếm thật từ data pack `tutor_turns.csv`.
- Xác nhận khảo sát pilot `n=4` do tôi thực hiện hay do thành viên khác.