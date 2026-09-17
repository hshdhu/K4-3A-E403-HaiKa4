# Kết quả đánh giá — Adaptive Explanation Level

- Thời điểm chạy: 2026-09-17T09:44:15.594Z
- Model: deepseek-ai/DeepSeek-V4-Flash-0731
- Bộ kiểm thử: 26 case (18 adaptation + 8 hard case)
- HTTP 200: 26/26
- Đạt tổng thể: **23/26 (88.5%)**
- Factuality: **23/26 (88.5%)**
- Level Fit: **17/18 (94.4%)**
- Sensitivity: **6/6 topic**
- Grounding hard case: **3/4**
- No-evidence hallucination: **1 case**
- Độ trễ trung bình trên lượt HTTP 200: **19687 ms**
- Quality bar: **CHƯA ĐẠT**
- Nguyên tắc: mỗi case gọi đúng một lần, không chạy lại để chọn kết quả đẹp.

| # | ID | Mức | Lớp | HTTP | Factuality | Level Fit | Grounding | Sensitivity | Kết quả | Độ trễ |
|---:|---|---|---|---:|---|---|---|---|---|---:|
| 1 | N-rag-beginner | beginner | adaptation | 200 | Chưa đạt | Chưa đạt (0/4) | — | Đạt | Chưa đạt | 20738 ms |
| 2 | N-rag-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (3/4) | — | Đạt | Đạt | 11713 ms |
| 3 | N-rag-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 9097 ms |
| 4 | N-feature-extraction-beginner | beginner | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 31700 ms |
| 5 | N-feature-extraction-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 46607 ms |
| 6 | N-feature-extraction-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 10950 ms |
| 7 | N-right-problem-beginner | beginner | adaptation | 200 | Đạt | Đạt (3/4) | — | Đạt | Đạt | 64419 ms |
| 8 | N-right-problem-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 14672 ms |
| 9 | N-right-problem-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 13999 ms |
| 10 | N-function-calling-beginner | beginner | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 40175 ms |
| 11 | N-function-calling-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 6709 ms |
| 12 | N-function-calling-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 40094 ms |
| 13 | N-prompt-techniques-beginner | beginner | adaptation | 200 | Đạt | Đạt (3/4) | — | Đạt | Đạt | 27010 ms |
| 14 | N-prompt-techniques-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 6902 ms |
| 15 | N-prompt-techniques-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 6265 ms |
| 16 | N-failure-modes-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (3/4) | — | Đạt | Chưa đạt | 11304 ms |
| 17 | N-failure-modes-intermediate | intermediate | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 30350 ms |
| 18 | N-failure-modes-advanced | advanced | adaptation | 200 | Đạt | Đạt (4/4) | — | Đạt | Đạt | 24530 ms |
| 19 | H-TRUTH-01 | advanced | truth-source | 200 | Đạt | — | Đạt | — | Đạt | 13748 ms |
| 20 | H-TRUTH-02 | advanced | truth-source | 200 | Chưa đạt | — | Chưa đạt | — | Chưa đạt | 63 ms |
| 21 | H-AMBIG-01 | intermediate | ambiguity | 200 | Đạt | — | — | — | Đạt | 51 ms |
| 22 | H-AMBIG-02 | advanced | ambiguity | 200 | Đạt | — | — | — | Đạt | 50 ms |
| 23 | H-SCOPE-01 | advanced | out-of-scope | 200 | Đạt | — | Đạt | — | Đạt | 72 ms |
| 24 | H-SCOPE-02 | intermediate | out-of-scope | 200 | Đạt | — | Đạt | — | Đạt | 56 ms |
| 25 | H-DOMAIN-01 | beginner | domain | 200 | Đạt | Đạt (4/4) | — | — | Đạt | 35560 ms |
| 26 | H-DOMAIN-02 | advanced | domain | 200 | Đạt | Đạt (4/4) | — | — | Đạt | 45033 ms |

## Sensitivity theo 6 câu hỏi thật

| turn_id | Topic | Beginner | Intermediate | Advanced | Kết quả |
|---|---|---:|---:|---:|---|
| T00095 | rag | 6 từ | 287 từ | 268 từ | Đạt |
| T00304 | feature-extraction | 200 từ | 216 từ | 475 từ | Đạt |
| T00447 | right-problem | 187 từ | 215 từ | 491 từ | Đạt |
| T00764 | function-calling | 193 từ | 243 từ | 533 từ | Đạt |
| T00977 | prompt-techniques | 220 từ | 306 từ | 303 từ | Đạt |
| T01200 | failure-modes | 216 từ | 251 từ | 396 từ | Đạt |

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
