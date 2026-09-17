# Kết quả CP3 theo AI Spec — DeepSeek

## Kết quả chốt

- Thời điểm chạy: 17/09/2026 (GMT+7).
- Model: `deepseek-ai/DeepSeek-V4-Pro-0813` qua endpoint OpenAI-compatible.
- Bộ kiểm thử: **26 case** đúng cơ cấu trong AI Spec:
  - 18 case adaptation: 6 câu thật từ VLearn × 3 mức;
  - 8 hard case: 2 nguồn sự thật, 2 mơ hồ, 2 ngoài phạm vi, 2 đặc thù domain.
- Mỗi case gọi đúng một lần, không chạy lại để chọn kết quả đẹp.
- HTTP 200: **26/26**.
- Đạt sau khi đọc và chấm thủ công: **22/26 (84,6%)**.
- Factuality có thể xác nhận: **23/26 (88,5%)**.
- Level Fit: **18/18 (100%)** case adaptation.
- Sensitivity: **6/6 (100%)** bộ ba có khác biệt có ý nghĩa.
- Grounding trên hard case có yêu cầu nguồn/phạm vi: **1/4 (25%)**.
- No-evidence hallucination: **2 case** tạo factual claim ngoài nguồn trong 2 case kiểm tra nguồn sự thật.
- Độ trễ trung bình của 26 lượt: **62.921 ms (62,9 giây)**.
- Quality bar đã khóa: **CHƯA ĐẠT** vì Factuality dưới 90% và no-evidence hallucination khác 0.

## Vì sao số tự động và số chốt khác nhau

Runner ban đầu báo **7/26 (26,9%)**. Đây không phải số chất lượng nội dung cuối cùng vì:

- 16/26 lượt không đọc được kết quả JSON của lượt reviewer độc lập;
- 17/26 lượt có `backendQualityPassed = false`, chủ yếu do reviewer không khả dụng chứ không phải câu trả lời sai;
- một rule keyword bỏ sót cách diễn đạt tương đương ở case chọn đúng vấn đề;
- một rule Level Fit đánh thấp case Beginner dù câu trả lời có định nghĩa, ví dụ và giới hạn rõ ràng.

Vì vậy kết quả chốt dùng việc đọc trực tiếp toàn bộ 26 output. Tệp JSON vẫn giữ nguyên số tự động để audit, không sửa ngược kết quả thô.

## Bảng chấm thủ công

| # | ID | Kết quả | Nhận xét |
|---:|---|---|---|
| 1 | N-rag-beginner | Đạt | Định nghĩa thuật ngữ, dùng ví dụ và nêu giới hạn nguồn dữ liệu. |
| 2 | N-rag-intermediate | Đạt | Có chunking, embedding, retrieval, generation và lưu ý triển khai. |
| 3 | N-rag-advanced | Đạt | Có hybrid search, reranking, context packing, metrics và trade-off. |
| 4 | N-feature-extraction-beginner | Đạt | Diễn giải dễ hiểu, có quy trình và ví dụ. |
| 5 | N-feature-extraction-intermediate | Đạt | Phân biệt extraction/selection, có data leakage và đánh giá downstream. |
| 6 | N-feature-extraction-advanced | Đạt | Có ánh xạ toán học, PCA/autoencoder/CNN, failure mode và trade-off. |
| 7 | N-right-problem-beginner | Đạt | Giải nghĩa rõ và có ví dụ; rule keyword tự động tạo âm tính giả. |
| 8 | N-right-problem-intermediate | Đạt | Nêu problem framing, chi phí cơ hội và cách xác thực nhu cầu. |
| 9 | N-right-problem-advanced | Đạt | Có cơ chế, điều kiện, failure mode, trade-off và cách kiểm chứng. |
| 10 | N-function-calling-beginner | Đạt | Có tên hàm, tham số, thực thi bên ngoài và ví dụ. |
| 11 | N-function-calling-intermediate | Đạt | Có schema, validation, kết quả tool và lưu ý an toàn. |
| 12 | N-function-calling-advanced | Đạt | Có constrained output, failure mode, security và metrics. |
| 13 | N-prompt-techniques-beginner | Đạt | Phân biệt đủ zero/one/few-shot và CoT bằng ví dụ dễ hiểu. |
| 14 | N-prompt-techniques-intermediate | Đạt | Có in-context learning, điều kiện áp dụng và lưu ý triển khai. |
| 15 | N-prompt-techniques-advanced | Đạt | Có failure mode, trade-off và cách đánh giá. |
| 16 | N-failure-modes-beginner | Đạt | Định nghĩa rõ, ví dụ trực quan và không over-engineer. |
| 17 | N-failure-modes-intermediate | Đạt | Phân biệt mode/cause/effect và nối lỗi với biện pháp giảm thiểu. |
| 18 | N-failure-modes-advanced | Đạt | Có edge case, logging/retry/fallback, trade-off và cách đo. |
| 19 | H-TRUTH-01 | Chưa đạt | Không bác rõ việc coi lời user là nguồn chính thức; vẫn sinh nhiều claim khi không có nguồn hợp lệ. |
| 20 | H-TRUTH-02 | Chưa đạt | Tự chọn nguồn B là đúng hơn và thêm kiến thức ngoài hai nguồn, thay vì chỉ nêu xung đột/thiếu căn cứ. |
| 21 | H-AMBIG-01 | Chưa đạt | Có hỏi làm rõ nhưng thêm nhiều ví dụ kỹ thuật suy đoán; không tuân thủ yêu cầu chỉ hỏi một câu ngắn. |
| 22 | H-AMBIG-02 | Đạt | Nêu thiếu ngữ cảnh và yêu cầu xác định đúng đối tượng trước khi giải thích. |
| 23 | H-SCOPE-01 | Chưa đạt | Trả lời đầy đủ bằng kiến thức riêng dù đề bài nói không có lesson context. |
| 24 | H-SCOPE-02 | Đạt | Từ chối viết thay assignment, nói rõ thiếu đề/tài liệu và đề nghị hỗ trợ phù hợp. |
| 25 | H-DOMAIN-01 | Đạt | Giữ thuật ngữ Softmax, định nghĩa, công thức, ví dụ và giới hạn. |
| 26 | H-DOMAIN-02 | Đạt | Công thức attention và vai trò Q/K/V/softmax/scaling đúng. |

## Sensitivity của 6 câu thật

| turn_id | Topic | Beginner | Intermediate | Advanced | Kết quả |
|---|---|---:|---:|---:|---|
| `T00095` | RAG | 158 từ | 264 từ | 349 từ | Đạt |
| `T00304` | Feature extraction | 207 từ | 385 từ | 381 từ | Đạt |
| `T00447` | Chọn đúng vấn đề | 229 từ | 273 từ | 476 từ | Đạt |
| `T00764` | Function calling | 199 từ | 272 từ | 459 từ | Đạt |
| `T00977` | Prompt techniques | 175 từ | 363 từ | 428 từ | Đạt |
| `T01200` | Failure modes | 214 từ | 307 từ | 476 từ | Đạt |

Độ dài chỉ là tín hiệu phụ. Mỗi bộ ba được chấm đạt vì Advanced bổ sung cơ chế, điều kiện, failure mode, trade-off hoặc cách đo; Beginner ưu tiên định nghĩa và ví dụ; Intermediate đi vào cơ chế chính và lưu ý triển khai.

## Failure lớn nhất và trạng thái khắc phục

**Failure lớn nhất tại thời điểm chạy CP3:** backend yêu cầu model “tự tạo toàn bộ câu trả lời bằng kiến thức của bạn” và API chưa nhận lesson context riêng. Điều này xung đột trực tiếp với grounding rule trong AI Spec.

**Trạng thái sau lần audit mã nguồn ngày 17/09/2026:**

1. Đã thêm `lessonContext` vào request và prompt, đồng thời giới hạn 12.000 ký tự.
2. Đã thêm source-bound refusal khi yêu cầu chỉ dùng tài liệu nhưng không có nguồn, và chỉ dẫn nêu rõ nguồn thiếu/xung đột.
3. Đã rút gọn ambiguity path về đúng một câu hỏi làm rõ.
4. Đã thêm policy guard cho câu hỏi mơ hồ, thiếu nguồn và nguồn xung đột; các trường hợp này không cần gọi model.
5. Đã gia cố parser để trích JSON reviewer ngay cả khi DeepSeek bọc kết quả bằng phần giải thích.
6. Đã thêm regression test; toàn bộ unit test hiện đạt 25/25.
7. Smoke test API sau guard đạt cho nguồn xung đột (115 ms) và câu hỏi mơ hồ (53 ms), đều không gọi model.
8. Chưa chạy lại full batch 26 case, nên số CP3 bên trên vẫn là kết quả lịch sử trước khi sửa.
9. Latency trung bình 62,9 giây của các lượt vẫn phải gọi model là hạng mục cần tối ưu.

## Tệp bằng chứng

- `run_cp3_spec_eval.mjs`: runner 26 case.
- `cp3-spec-deepseek-results.json`: phản hồi và số đo thô.
- `cp3-spec-deepseek-summary.md`: báo cáo tự động trước khi đọc thủ công.
- `cp3-spec-deepseek-final.md`: kết quả chốt sau đọc thủ công.
