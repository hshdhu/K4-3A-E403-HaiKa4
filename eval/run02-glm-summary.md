# Kết quả Run 02 — Adaptive Explanation Level (GLM-5.3-Flash)

- Thời điểm chạy: 2026-09-17T08:31:46.982Z
- Model: zai-org/GLM-5.3-Flash
- Bộ kiểm thử: 26 case (18 adaptation + 8 hard case)
- HTTP 200: 15/26
- Đạt tổng thể: **5/26 (19.2%)**
- Factuality: **6/26 (23.1%)**
- Level Fit: **7/18 (38.9%)**
- Sensitivity: **1/6 topic**
- Grounding hard case: **3/4**
- No-evidence hallucination: **1 case**
- Độ trễ trung bình trên lượt HTTP 200: **55303 ms**
- Quality bar: **CHƯA ĐẠT**
- Nguyên tắc: mỗi case gọi đúng một lần, không chạy lại để chọn kết quả đẹp.

| # | ID | Mức | Lớp | HTTP | Factuality | Level Fit | Grounding | Sensitivity | Kết quả | Độ trễ |
|---:|---|---|---|---:|---|---|---|---|---|---:|
| 1 | N-rag-beginner | beginner | adaptation | 200 | Đạt | Đạt (3/4) | — | Chưa đạt | Chưa đạt | 39007 ms |
| 2 | N-rag-intermediate | intermediate | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Chưa đạt | Chưa đạt | 93341 ms |
| 3 | N-rag-advanced | advanced | adaptation | ERR | Chưa đạt | Chưa đạt (1/4) | — | Chưa đạt | Chưa đạt | 120014 ms |
| 4 | N-feature-extraction-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (3/4) | — | Chưa đạt | Chưa đạt | 106689 ms |
| 5 | N-feature-extraction-intermediate | intermediate | adaptation | ERR | Chưa đạt | Chưa đạt (0/4) | — | Chưa đạt | Chưa đạt | 120012 ms |
| 6 | N-feature-extraction-advanced | advanced | adaptation | ERR | Chưa đạt | Chưa đạt (1/4) | — | Chưa đạt | Chưa đạt | 120007 ms |
| 7 | N-right-problem-beginner | beginner | adaptation | ERR | Chưa đạt | Chưa đạt (0/4) | — | Chưa đạt | Chưa đạt | 120007 ms |
| 8 | N-right-problem-intermediate | intermediate | adaptation | ERR | Chưa đạt | Chưa đạt (0/4) | — | Chưa đạt | Chưa đạt | 120012 ms |
| 9 | N-right-problem-advanced | advanced | adaptation | 502 | Chưa đạt | Chưa đạt (1/4) | — | Chưa đạt | Chưa đạt | 82374 ms |
| 10 | N-function-calling-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 98380 ms |
| 11 | N-function-calling-intermediate | intermediate | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 89977 ms |
| 12 | N-function-calling-advanced | advanced | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Đạt | Chưa đạt | 95542 ms |
| 13 | N-prompt-techniques-beginner | beginner | adaptation | 200 | Chưa đạt | Đạt (4/4) | — | Chưa đạt | Chưa đạt | 102215 ms |
| 14 | N-prompt-techniques-intermediate | intermediate | adaptation | ERR | Chưa đạt | Chưa đạt (0/4) | — | Chưa đạt | Chưa đạt | 120004 ms |
| 15 | N-prompt-techniques-advanced | advanced | adaptation | ERR | Chưa đạt | Chưa đạt (1/4) | — | Chưa đạt | Chưa đạt | 120004 ms |
| 16 | N-failure-modes-beginner | beginner | adaptation | 200 | Chưa đạt | Chưa đạt (2/4) | — | Chưa đạt | Chưa đạt | 43440 ms |
| 17 | N-failure-modes-intermediate | intermediate | adaptation | ERR | Chưa đạt | Chưa đạt (0/4) | — | Chưa đạt | Chưa đạt | 120009 ms |
| 18 | N-failure-modes-advanced | advanced | adaptation | ERR | Chưa đạt | Chưa đạt (1/4) | — | Chưa đạt | Chưa đạt | 120004 ms |
| 19 | H-TRUTH-01 | advanced | truth-source | 200 | Chưa đạt | — | Đạt | — | Chưa đạt | 96700 ms |
| 20 | H-TRUTH-02 | advanced | truth-source | 200 | Chưa đạt | — | Chưa đạt | — | Chưa đạt | 70 ms |
| 21 | H-AMBIG-01 | intermediate | ambiguity | 200 | Đạt | — | — | — | Đạt | 62 ms |
| 22 | H-AMBIG-02 | advanced | ambiguity | 200 | Đạt | — | — | — | Đạt | 51 ms |
| 23 | H-SCOPE-01 | advanced | out-of-scope | 200 | Đạt | — | Đạt | — | Đạt | 73 ms |
| 24 | H-SCOPE-02 | intermediate | out-of-scope | 200 | Đạt | — | Đạt | — | Đạt | 56 ms |
| 25 | H-DOMAIN-01 | beginner | domain | 200 | Đạt | Đạt (4/4) | — | — | Đạt | 63946 ms |
| 26 | H-DOMAIN-02 | advanced | domain | 502 | Chưa đạt | Chưa đạt (1/4) | — | — | Chưa đạt | 80311 ms |

## Sensitivity theo 6 câu hỏi thật

| turn_id | Topic | Beginner | Intermediate | Advanced | Kết quả |
|---|---|---:|---:|---:|---|
| T00095 | rag | 234 từ | 305 từ | 0 từ | Chưa đạt |
| T00304 | feature-extraction | 186 từ | 0 từ | 0 từ | Chưa đạt |
| T00447 | right-problem | 0 từ | 0 từ | 0 từ | Chưa đạt |
| T00764 | function-calling | 201 từ | 329 từ | 494 từ | Đạt |
| T00977 | prompt-techniques | 211 từ | 0 từ | 0 từ | Chưa đạt |
| T01200 | failure-modes | 205 từ | 0 từ | 0 từ | Chưa đạt |

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
