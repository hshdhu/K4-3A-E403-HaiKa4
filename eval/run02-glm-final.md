# Kết quả Run 02 theo AI Spec — GLM-5.3-Flash

## Kết quả chốt

- Thời điểm chạy: 17/09/2026 (GMT+7).
- Model: `zai-org/GLM-5.3-Flash` qua endpoint OpenAI-compatible (`https://api.inference.wandb.ai/v1`).
- Bộ kiểm thử: **26 case** đúng cơ cấu AI Spec:
  - 18 case adaptation: 6 câu thật VLearn × 3 mức;
  - 8 hard case: 2 nguồn sự thật, 2 mơ hồ, 2 ngoài phạm vi, 2 đặc thù domain.
- Mỗi case gọi đúng một lần, không chạy lại để chọn kết quả đẹp.
- HTTP 200: **15/26**.
- Timeout ở client (120 giây): **9/26**.
- Server trả 502 sau khi hết retry (25 giây/lượt × 3 lần + backoff): **2/26**.
- Đạt sau khi đọc và chấm thủ công: **15/15** trong số 15 lượt có câu trả lời.
- Factuality có thể xác nhận: **15/15** (100% trong số có output; 11 case không có output để chấm).
- Level Fit: **8/8** case adaptation có output (100%).
- Sensitivity: **1/6** bộ ba (chỉ bộ ba function-calling đo được đủ 3 mức; 5 bộ ba còn lại bị khuyết ít nhất một mức do timeout).
- Grounding hard case: **4/4** thủ công (3/4 tự động; `H-TRUTH-02` đúng nhưng rule keyword bỏ sót).
- No-evidence hallucination: **0** (số tự động báo 1 là dương tính giả).
- Độ trễ trung bình của 15 lượt HTTP 200: **55.303 ms (55,3 giây)**, cao nhất 106,7 giây.
- Quality bar: **CHƯA ĐẠT** — 11/26 case không tạo được câu trả lời, nên chưa thể chốt chất lượng nội dung trên toàn bộ 26 case.

## Vì sao chưa chốt được quality bar nội dung

Điểm nghẽn của Run 02 không nằm ở chất lượng nội dung mà ở **độ trễ/khả năng hoàn tất của model**. GLM-5.3-Flash qua endpoint hiện tại sinh chậm hơn nhiều so với DeepSeek. Mỗi lượt gồm một lần generate cộng một lần reviewer độc lập; với `GEMINI_TIMEOUT_MS=25000`, `GEMINI_MAX_RETRIES=2` và khoảng cách tối thiểu 4,5 giây, tổng thời gian một lượt thường vượt ngưỡng 120 giây của runner (`AbortSignal.timeout`). Hệ quả:

- 9 case bị client abort (timeout 120 giây);
- 2 case server tự abort sau retry và trả 502;
- reviewer JSON chỉ parse được 2 lượt trong số lần được gọi, nên số tự động (5/26) không thể dùng thay cho chấm nội dung — giống vấn đề reviewer của DeepSeek ở Run 01.

## Bảng chấm thủ công 15 case có câu trả lời

| # | ID | Kết quả | Nhận xét |
|---:|---|---|---|
| 1 | N-rag-beginner | Đạt | Định nghĩa, hai bước truy xuất/sinh, lý do hữu ích, ví dụ giả định và giới hạn; reviewer 92. |
| 2 | N-rag-intermediate | Đạt | Đủ pipeline chunking → indexing → retrieval → context assembly → generation, trade-off chunk size và lưu ý triển khai. |
| 4 | N-feature-extraction-beginner | Đạt | Định nghĩa, ví dụ giả định, các bước, lỗi thường gặp và giới hạn. |
| 10 | N-function-calling-beginner | Đạt | Định nghĩa, cơ chế 4 bước, ví dụ lễ tân và giới hạn. |
| 11 | N-function-calling-intermediate | Đạt | Schema/tool call/tool result, quy trình 4 bước, ví dụ JSON, giới hạn và lưu ý validate. |
| 12 | N-function-calling-advanced | Đạt | JSON Schema + failure modes (tham số bịa, sai schema, prompt injection, vòng lặp) + trade-off và cách kiểm chứng. |
| 13 | N-prompt-techniques-beginner | Đạt | Phân biệt zero/one/few-shot và CoT bằng bảng, kèm ví dụ dễ hiểu và lưu ý. |
| 16 | N-failure-modes-beginner | Đạt | Giải thích vì sao liệt kê trước, thuật ngữ, ví dụ và giới hạn. |
| 19 | H-TRUTH-01 | Đạt | Bác việc coi lời user là nguồn chính thức, từ chối khẳng định "RAG luôn loại bỏ hallucination", bám đúng nguồn. |
| 20 | H-TRUTH-02 | Đạt | Nêu hai nguồn mâu thuẫn và chưa đủ căn cứ kết luận (policy guard); bị rule tự động đánh nhầm vì thiếu cụm "không loại bỏ hoàn toàn". |
| 21 | H-AMBIG-01 | Đạt | Hỏi làm rõ đối tượng (policy guard, 62 ms, 0 model call). |
| 22 | H-AMBIG-02 | Đạt | Hỏi làm rõ (51 ms, 0 model call). |
| 23 | H-SCOPE-01 | Đạt | Từ chối vì thiếu nguồn, yêu cầu cung cấp tài liệu (73 ms, 0 model call). |
| 24 | H-SCOPE-02 | Đạt | Từ chối viết thay khi thiếu đề/tài liệu (56 ms, 0 model call). |
| 25 | H-DOMAIN-01 | Đạt | Softmax đúng: định nghĩa, công thức e/tổng, ví dụ, điều kiện và giới hạn; reviewer 93. |

11 case không có output để chấm nội dung:

| # | ID | Lý do |
|---:|---|---|
| 3, 5, 6, 7, 8, 14, 15, 17, 18 | adaptation (×9) | Client timeout 120 giây. |
| 9 | N-right-problem-advanced | Server 502 sau khi hết retry. |
| 26 | H-DOMAIN-02 | Server 502 sau khi hết retry. |

## Sensitivity của 6 câu thật

| turn_id | Topic | Beginner | Intermediate | Advanced | Kết quả |
|---|---|---|---:|---:|---|
| `T00095` | RAG | 234 từ | 305 từ | 0 từ (timeout) | Chưa đo được đủ |
| `T00304` | Feature extraction | 186 từ | 0 từ | 0 từ | Chưa đo được đủ |
| `T00447` | Chọn đúng vấn đề | 0 từ | 0 từ | 0 từ | Chưa đo được đủ |
| `T00764` | Function calling | 201 từ | 329 từ | 494 từ | Đạt |
| `T00977` | Prompt techniques | 211 từ | 0 từ | 0 từ | Chưa đo được đủ |
| `T01200` | Failure modes | 205 từ | 0 từ | 0 từ | Chưa đo được đủ |

Chỉ bộ ba function-calling có đủ 3 mức và phân biệt rõ ràng (mức sâu hơn dài hơn, đi sâu cơ chế/trade-off). Năm bộ ba còn lại không thể kết luận về sensitivity vì thiếu câu trả lời do timeout.

## Failure lớn nhất và hành động cần thiết

**Failure lớn nhất:** model GLM-5.3-Flash qua endpoint hiện tại quá chậm so với ngưỡng timeout đang cấu hình, khiến 42,3% case (11/26) không tạo được output và hầu hết reviewer JSON không parse được.

**Trước lượt Final cần làm:**

1. Nâng `GEMINI_TIMEOUT_MS`/ngưỡng client timeout, hoặc giảm `max_tokens`, hoặc tắt vòng reviewer độc lập với model chậm.
2. Đo lại latency của GLM-5.3-Flash trên một mẫu nhỏ trước khi chạy cả bộ 26 case.
3. Nếu endpoint vẫn chậm, cân nhắc quay lại DeepSeek hoặc một model phản hồi nhanh hơn — vì độ trễ 55 giây/lượt trung bình không khả thi cho trải nghiệm hội thoại thật.

## Tệp bằng chứng

- `run_cp3_spec_eval.mjs`: runner 26 case dùng chung cho cả hai run.
- `run02-glm-results.json`: phản hồi và số đo thô của Run 02.
- `run02-glm-summary.md`: báo cáo tự động trước khi đọc thủ công.
- `run02-glm-final.md`: kết quả chốt sau đọc thủ công (tệp này).