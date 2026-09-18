# Final Eval — Adaptive Explanation Level (lessonContext end-to-end)

## Phương pháp chấm (manual adjudication)

- Chấm thủ công dùng đúng các quality criteria đã định nghĩa trong `spec.md` §7.1 (Factuality, Grounding, Level Fit, Sensitivity, Relevance) và quality bar §7.3.
- Automated evaluation chỉ là công cụ hỗ trợ; khi rule keyword/regex tạo false negative, kết quả chốt là đọc trực tiếp output.
- Raw output (`final-run-results.json`) không bị sửa.
- Mỗi manual override đều ghi rõ lý do audit cụ thể (xem §6).
- Quality bar không thay đổi so với spec đã khóa.

## 1. Configuration

| Mục | Giá trị |
| --- | --- |
| Provider | Endpoint OpenAI-compatible (custom) |
| Base URL | `https://api.inference.wandb.ai/v1` |
| Model | `deepseek-ai/DeepSeek-V4-Flash-0731` |
| Reviewer | **DISABLED** (`GEMINI_ENABLE_REVIEW=false`) — ghi rõ, không che giấu |
| Timeout | Server 25 s (`GEMINI_TIMEOUT_MS`); client 120 s (`AbortSignal`) |
| Retries | `GEMINI_MAX_RETRIES=2`, backoff 1,5 s |
| lessonContext | Eval fixtures (`eval/lesson-context-fixtures.mjs`) cho 18 normal + 2 hard truth/source |
| Total cases | **26** (18 adaptation + 8 hard), mỗi case gọi đúng 1 lần |

## 2. Golden set

- 18 adaptation: 6 câu thật VLearn × 3 mức (beginner/intermediate/advanced), **cùng question + cùng lessonContext, chỉ đổi level**.
- 8 hard: 2 truth/source + 2 ambiguity + 2 out-of-scope + 2 domain.

## 3. Quality bar (đã khóa, KHÔNG thay đổi)

> Đạt khi overall pass rate ≥80%, Factuality ≥90%, Level Fit ≥80%, và 0 case "không có căn cứ" tạo factual claim không được source hỗ trợ.

## 4. Metrics

| Metric | Automated | Manual |
| --- | ---: | ---: |
| HTTP 200 | 26/26 | 26/26 |
| Overall | 23/26 (88,5%) | **25/26 (96,2%)** |
| Factuality | 23/26 (88,5%) | **25/26 (96,2%)** |
| Level Fit | 17/18 (94,4%) | 17/18 (94,4%) |
| Sensitivity | 6/6 | 6/6 |
| Grounding hard case | 3/4 | **4/4** |
| No-evidence hallucination | 1 (false pos) | **0** |
| Avg / median / max latency | 19,7 s / 14,0 s / 64,4 s | — |
| Timeout / 5xx | 0 / 0 | — |

## 5. Bảng 26 case

| # | ID | Mức | HTTP | Tự động | Thủ công | Ghi chú |
|---:|---|---|---:|---|---|---|
| 1 | N-rag-beginner | beginner | 200 | Chưa đạt | **Chưa đạt** | Answer bị cắt cụt, không đủ nội dung |
| 2 | N-rag-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 3 | N-rag-advanced | advanced | 200 | Đạt | Đạt | — |
| 4 | N-feature-extraction-beginner | beginner | 200 | Đạt | Đạt | — |
| 5 | N-feature-extraction-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 6 | N-feature-extraction-advanced | advanced | 200 | Đạt | Đạt | — |
| 7 | N-right-problem-beginner | beginner | 200 | Đạt | Đạt | — |
| 8 | N-right-problem-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 9 | N-right-problem-advanced | advanced | 200 | Đạt | Đạt | — |
| 10 | N-function-calling-beginner | beginner | 200 | Đạt | Đạt | — |
| 11 | N-function-calling-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 12 | N-function-calling-advanced | advanced | 200 | Đạt | Đạt | — |
| 13 | N-prompt-techniques-beginner | beginner | 200 | Đạt | Đạt | — |
| 14 | N-prompt-techniques-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 15 | N-prompt-techniques-advanced | advanced | 200 | Đạt | Đạt | — |
| 16 | N-failure-modes-beginner | beginner | 200 | Chưa đạt | **Đạt** | Rule bỏ sót "hậu quả"/"giảm thiểu"; nội dung đủ |
| 17 | N-failure-modes-intermediate | intermediate | 200 | Đạt | Đạt | — |
| 18 | N-failure-modes-advanced | advanced | 200 | Đạt | Đạt | — |
| 19 | H-TRUTH-01 | advanced | 200 | Đạt | Đạt | Bác source override đúng |
| 20 | H-TRUTH-02 | advanced | 200 | Chưa đạt | **Đạt** | Nêu đúng mâu thuẫn nguồn, không bịa |
| 21 | H-AMBIG-01 | intermediate | 200 | Đạt | Đạt | Hỏi làm rõ (policy guard) |
| 22 | H-AMBIG-02 | advanced | 200 | Đạt | Đạt | Hỏi làm rõ (policy guard) |
| 23 | H-SCOPE-01 | advanced | 200 | Đạt | Đạt | Giữ scope, báo thiếu nguồn |
| 24 | H-SCOPE-02 | intermediate | 200 | Đạt | Đạt | Từ chối viết thay |
| 25 | H-DOMAIN-01 | beginner | 200 | Đạt | Đạt | Softmax đúng, có ví dụ |
| 26 | H-DOMAIN-02 | advanced | 200 | Đạt | Đạt | Attention Q/K/V/softmax/scaling đúng |

## 6. Failures (chấm thủ công)

- **N-rag-beginner (FAIL thật):** answer bị cắt cụt giữa câu (`## Khái niệm RAG — RAG (Retrieval-Augmented`), thiếu định nghĩa/retrieval/generation/ví dụ. Là dừng sớm không xác định của model, không phải lỗi grounding; smoke test trước đó cho cùng case đã trả lời đầy đủ.
- **N-failure-modes-beginner (override PASS):** automated FAIL vì keyword group `hậu quả/tác động` và `mitigation/giảm thiểu` không xuất hiện nguyên văn; nội dung thực tế định nghĩa đúng failure mode, nêu lý do + ví dụ, đúng level beginner.
- **H-TRUTH-02 (override PASS):** automated FAIL vì regex `surface-conflict` đòi cụm "không loại bỏ hoàn toàn"; answer nêu đúng "hai nguồn mâu thuẫn, chưa đủ căn cứ kết luận" — hành vi đúng, không bịa. Tự động đã cộng nhầm 1 "no-evidence hallucination".

## 7. So sánh CP3 / Run 02 / Final

| Metric | CP3 (DeepSeek-V4-Pro) | Run 02 (GLM-5.3-Flash) | Final (DeepSeek-V4-Flash) |
| --- | ---: | ---: | ---: |
| Overall | 22/26 (84,6%) | 15/26 (57,7%) | **25/26 (96,2%)** (tự động 23/26) |
| Factuality | 23/26 (88,5%) | 15/15 output | **25/26 (96,2%)** |
| Level Fit | 18/18 (100%) | 8/8 đo được | 17/18 (94,4%) |
| Grounding hard case | 1/4 | 4/4 thủ công (3/4 auto) | 4/4 thủ công (3/4 auto) |
| No-evidence hallucination | 2 | 0 | **0** |
| HTTP success | 26/26 | 15/26 | **26/26** |
| Avg latency | 62,9 s | 55,3 s | **19,7 s** |

Nhận xét (không cherry-pick): Final tăng Overall và Factuality so CP3, đưa hallucination về 0, và khắc phục toàn bộ timeout/502 của Run 02. Level Fit giảm nhẹ (100% → 94,4%) chỉ do 1 case adaptation bị cắt cụt, không phải lỗi level.

## 8. Impact của lessonContext

- **H-TRUTH-01:** CP3 sinh claim ngoài nguồn khi bị yêu cầu override → Final **PASS** (bác source override, không khẳng định tuyệt đối).
- **H-TRUTH-02:** CP3 tự chọn nguồn + thêm kiến thức ngoài → Final **PASS** (nêu mâu thuẫn, không kết luận).
- **H-SCOPE-01:** CP3 trả lời bằng kiến thức riêng dù không có nguồn → Final **PASS** (policy guard giữ scope).
- **H-AMBIG-01:** CP3 hỏi làm rõ nhưng thêm suy đoán → Final **PASS** (chỉ hỏi một câu ngắn).
- **18 normal:** 6 topic giờ đều có lessonContext; sensitivity 6/6 giữ nguyên, grounding được giữ.

Cẩn thận lời claim: kết quả cho thấy "sau khi thêm lessonContext + policy guard + model nhanh hơn, các case nguồn/phạm vi/mơ hồ hiện PASS", **không** khẳng định "lessonContext chắc chắn loại bỏ hoàn toàn hallucination".

## 9. Latency

Average 19,7 s; median 14,0 s; max 64,4 s; min 50 ms (policy guard, 0 model call). 0 timeout, 0 server 5xx. Tắt reviewer giúp mỗi lượt chỉ còn 1 model call và loại bỏ bottleneck latency + lỗi parse JSON reviewer từ Run 01/02.

## 10. Known limitations

- Reviewer đã **tắt** cho Final Eval; Factuality chốt bằng chấm thủ công toàn bộ 26 output.
- `lesson-context-fixtures.mjs` là nội dung tổng hợp cho eval (không phải dữ liệu VLearn thật); production vẫn cần nguồn thật từ VLearn.
- Keyword/regex rule của runner còn 2 false negative → bắt buộc chấm thủ công kèm theo.
- `N-rag-beginner` cắt cụt: dấu hiệu model thỉnh thoảng dừng sớm ở level beginner (non-deterministic).

## 11. Kết quả cuối

```text
Overall:              25/26 = 96,2%   (≥80%  → PASS)
Factuality:           25/26 = 96,2%   (≥90%  → PASS)
Level Fit:            17/18 = 94,4%   (≥80%  → PASS)
No-evidence halluc:   0               (=0    → PASS)

QUALITY BAR: PASS
```