# Evidence B — Mining dữ liệu VLearn

Tài liệu này ghi lại phương pháp và kết quả của **Evidence B (mining dữ liệu)** dùng trong `spec.md`. Mục đích là để người chấm tái lập được cách đếm và hiểu đúng giới hạn của con số `744/10.427 (7,14%)`.

## 1. Nguồn dữ liệu

- File: `data/vlearn-pack/chatlog/tutor_turns.csv` (data pack của VLearn).
- Dữ liệu này là tài sản nội bộ của khoá học, **không được copy vào repository công khai**. File chỉ tồn tại cục bộ ngoài repo này.

## 2. Tiêu chí loại preset

- Chỉ phân tích các lượt **không phải preset** (câu hỏi do học viên tự gõ, không phải nút gợi ý có sẵn).
- Tổng lượt không phải preset được phân tích: **10.427**.

## 3. Keyword groups (nhóm tín hiệu)

Các cụm từ nghiêm ngặt dùng để tìm tín hiệu "học viên muốn điều chỉnh cách giải thích":

| Nhóm | Tín hiệu/pattern |
| --- | --- |
| Simplify | dễ hiểu, đơn giản hơn |
| Deepen | chi tiết hơn, sâu hơn, rõ hơn |
| Example | ví dụ, minh họa |
| Re-explanation | chưa hiểu, giải thích lại, định nghĩa lại |
| Brevity | ngắn gọn, súc tích |

## 4. Cách deduplicate theo `turn_id`

- Một lượt (`turn_id`) có thể match nhiều keyword group; khi đếm **số lượt có tín hiệu**, mỗi `turn_id` chỉ tính một lần.
- Số match theo nhóm dưới đây là số **trước khi khử trùng**.

## 5. Cách đếm

- Đọc toàn bộ file CSV, loại preset, duyệt từng `turn_id`.
- Với mỗi lượt, kiểm tra các pattern ở mục 3 trên phần text câu hỏi (đã normalize tiếng Việt không dấu).
- Đếm: tổng lượt phân tích, số lượt match ≥1 nhóm, tỷ lệ, và số match từng nhóm.

## 6. Kết quả

- Tổng lượt không phải preset được phân tích: **10.427**
- Số lượt có ít nhất một tín hiệu điều chỉnh cách giải thích: **744**
- Tỷ lệ: **7,14%**
- Số match theo nhóm (trước khi khử trùng):
  - Simplify **134**
  - Deepen **184**
  - Example **259**
  - Re-explanation **168**
  - Brevity **57**

## 7. Năm ví dụ nguyên văn

| # | turn_id | Student question / quote | Loại |
| --- | --- | --- | --- |
| 1 | `T01763` | "giải thích dễ hiểu hơn" | Simplify |
| 2 | `T00385` | "ví dụ cụ thể đi" | Example |
| 3 | `T00304` | "là sao fen tôi chưa hiểu lắm, định nghĩa lại feature extraction giúp tôi" | Re-explanation |
| 4 | `T08598` | "trả lời ngắn gọn lại thôi" | Brevity |
| 5 | `T00154` | "chi tiết hơn về lịch sử của AI, 2 mùa đông của AI, và spring" | Deepen |

## 8. Limitations

- Đây là **keyword screen bảo thủ (conservative behavioral screen)** để tìm tín hiệu hành vi. Nó **không** có nghĩa cả 744 lượt đều chắc chắn là hậu quả của một câu trả lời trước đó của Tutor, cũng không chứng minh quan hệ nhân quả.
- Số match theo nhóm có thể trùng nhau giữa các nhóm (một lượt match nhiều nhóm), nên không cộng trực tiếp các nhóm để ra 744.
- Vì data pack không nằm trong repo công khai, việc tái lập chính xác con số cần quyền truy cập file `tutor_turns.csv`; phương pháp ở trên là cách kiểm lại khi có data pack.