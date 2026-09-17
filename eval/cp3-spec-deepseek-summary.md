# Kết quả CP3 — Adaptive Explanation Level (DeepSeek)

- Thời điểm chạy: 2026-09-17T07:08:57.073Z
- Model: deepseek-ai/DeepSeek-V4-Pro-0813
- Bộ kiểm thử: 26 case (18 adaptation + 8 hard case)
- HTTP 200: 26/26
- Đạt tổng thể: **7/26 (26.9%)**
- Factuality: **7/26 (26.9%)**
- Level Fit: **17/18 (94.4%)**
- Sensitivity: **6/6 topic**
- Grounding hard case: **3/4**
- No-evidence hallucination: **0 case**
- Độ trễ trung bình trên lượt HTTP 200: **62921 ms**
- Quality bar: **CHƯA ĐẠT**
- Nguyên tắc: mỗi case gọi đúng một lần, không chạy lại để chọn kết quả đẹp.

| # | ID | Mức | Lớp | HTTP | Factuality | Level Fit | Grounding | Sensitivity | Kết quả | Độ trễ |
|---:|---|---|---|---:|---|---|---|---|---|---:|
| 1 | N-rag-beginner | beginner | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 55560 ms |
| 2 | N-rag-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 27568 ms |
| 3 | N-rag-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 88725 ms |
| 4 | N-feature-extraction-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (3/4) | — | Đạt | Chưa đạt | 82114 ms |
| 5 | N-feature-extraction-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 27963 ms |
| 6 | N-feature-extraction-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 84685 ms |
| 7 | N-right-problem-beginner | beginner | adaptation | 200 | Chưa đạt | Chưa đạt (2/4) | — | Đạt | Chưa đạt | 45158 ms |
| 8 | N-right-problem-intermediate | intermediate | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 37683 ms |
| 9 | N-right-problem-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 88722 ms |
| 10 | N-function-calling-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (3/4) | — | Đạt | Chưa đạt | 93134 ms |
| 11 | N-function-calling-intermediate | intermediate | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 40259 ms |
| 12 | N-function-calling-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 98649 ms |
| 13 | N-prompt-techniques-beginner | beginner | adaptation | 200 | Đạt | Đạt (3/4) | — | Đạt | Đạt | 21484 ms |
| 14 | N-prompt-techniques-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 60819 ms |
| 15 | N-prompt-techniques-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 79592 ms |
| 16 | N-failure-modes-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 28672 ms |
| 17 | N-failure-modes-intermediate | intermediate | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 36379 ms |
| 18 | N-failure-modes-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 114636 ms |
| 19 | H-TRUTH-01 | advanced | truth-source | 200 | Chưa đạt | — | Đạt | — | Chưa đạt | 85224 ms |
| 20 | H-TRUTH-02 | advanced | truth-source | 200 | Chưa đạt | — | Đạt | — | Chưa đạt | 94128 ms |
| 21 | H-AMBIG-01 | intermediate | ambiguity | 200 | Chưa đạt | — | — | — | Chưa đạt | 42027 ms |
| 22 | H-AMBIG-02 | advanced | ambiguity | 200 | Đạt | — | — | — | Đạt | 49696 ms |
| 23 | H-SCOPE-01 | advanced | out-of-scope | 200 | Chưa đạt | — | Đạt | — | Chưa đạt | 86222 ms |
| 24 | H-SCOPE-02 | intermediate | out-of-scope | 200 | Chưa đạt | — | Chưa đạt | — | Chưa đạt | 48454 ms |
| 25 | H-DOMAIN-01 | beginner | domain | 200 | Đạt | Đạt (3/4) | — | — | Đạt | 35565 ms |
| 26 | H-DOMAIN-02 | advanced | domain | 200 | Chưa đạt | Đạt (4/4) | — | — | Chưa đạt | 82832 ms |

## Sensitivity theo 6 câu hỏi thật

| turn_id | Topic | Beginner | Intermediate | Advanced | Kết quả |
|---|---|---:|---:|---:|---|
| T00095 | rag | 158 từ | 264 từ | 349 từ | Đạt |
| T00304 | feature-extraction | 207 từ | 385 từ | 381 từ | Đạt |
| T00447 | right-problem | 229 từ | 273 từ | 476 từ | Đạt |
| T00764 | function-calling | 199 từ | 272 từ | 459 từ | Đạt |
| T00977 | prompt-techniques | 175 từ | 363 từ | 428 từ | Đạt |
| T01200 | failure-modes | 214 từ | 307 từ | 476 từ | Đạt |

## Turn ID VLearn dùng trong golden set

1. `T00095`
2. `T00304`
3. `T00447`
4. `T00764`
5. `T00977`
6. `T01200`
7. `T02833`
8. `T03956`
9. `T03952`
10. `T01925`

> Đây là vòng chấm có thể tái lập bằng script. Cần đọc các câu trả lời trong JSON trước khi chốt nhận xét thủ công và không diễn giải kết quả trên golden set như độ chính xác tuyệt đối của model.
