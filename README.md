# VLearn Adaptive Tutor

Prototype AI Tutor cho phép học viên chọn một trong ba mức giải thích — **Mới làm quen**, **Đã có nền tảng** và **Muốn đào sâu** — trước khi đặt câu hỏi.

> **Trạng thái trước khi nộp:** prototype Working, chạy model thật qua endpoint OpenAI-compatible (`deepseek-ai/DeepSeek-V4-Flash-0731`). Final Eval (lessonContext end-to-end) đạt **25/26 (96,2%)** và **quality bar PASS**. Xem [báo cáo Final](eval/final-run-final.md) và [AI Spec](spec.md).

Sau CP3, các failure về lesson context, nguồn xung đột, câu hỏi mơ hồ và static-file exposure đã được sửa và khóa bằng 28 unit tests. Run 02 (GLM-5.3-Flash) vướng 11/26 timeout/502 vì model quá chậm. Final Run với `deepseek-ai/DeepSeek-V4-Flash-0731` + lessonContext end-to-end đạt **25/26 (96,2%)** — quality bar **ĐẠT**, 0 timeout, 0 hallucination ngoài nguồn — xem [báo cáo Final](eval/final-run-final.md).

## Phân công nhóm

| Thành viên | Vai trò chính | Deliverables |
| --- | --- | --- |
| **Tạ Văn Tuấn** | Nhóm trưởng | spec |
| **Cao Văn Cường** | Thành viên | evidence |
| **Lê Văn Tài** | Thành viên | code |
| **Nguyễn Quang Huy** | Thành viên | demo |

## Chạy nhanh

Yêu cầu: Node.js 18 trở lên. Dự án không có dependency npm bên ngoài.

```powershell
cd codebase
Copy-Item .env.example .env
# Mở .env và điền cấu hình của một provider.
npm start
```

Mở <http://localhost:8090>.

Ứng dụng vẫn khởi động khi không có `tutor_turns.csv`; khi đó chỉ tính năng đối chiếu câu hỏi VLearn bị tắt. File dữ liệu thật và `.env` đều bị loại khỏi Git.

## Cấu hình DeepSeek

Điền vào `codebase/.env`:

```env
AI_PROVIDER=openai
CUSTOM_BASE_URL=https://api.inference.wandb.ai/v1
CUSTOM_API_KEY=<YOUR_API_KEY>
CUSTOM_MODEL=deepseek-ai/DeepSeek-V4-Flash-0731
```

Có thể dùng provider OpenAI-compatible khác hoặc Gemini; xem [hướng dẫn kỹ thuật](codebase/README.md). Không commit API key.

## Luồng chính

1. Học viên chọn mức giải thích.
2. Frontend gửi `question`, `level` và `lessonContext` (fixture demo trong `codebase/lesson-context.js`) tới `POST /api/ask`; client tích hợp có thể gửi `lessonContext` riêng của mình.
3. Backend tạo prompt tương ứng và gọi model thật.
4. Backend kiểm tra độ phủ, định dạng và bằng chứng; nếu bật review, model thực hiện thêm một lượt kiểm định.
5. UI hiển thị câu trả lời, trạng thái kiểm định và kết quả đối chiếu câu hỏi với CSV nếu dữ liệu nội bộ có sẵn.

CSV chỉ dùng để phát hiện câu hỏi trùng/tương tự; câu trả lời trong CSV không được gửi vào prompt và không được dùng thay câu trả lời model.

## Kiểm thử

Chạy unit test:

```powershell
cd codebase
npm test
```

Trong terminal khác, chạy lại bộ eval từ thư mục gốc repository. Đặt prefix mới để không ghi đè artifact CP3 lịch sử:

```powershell
$env:CP3_OUTPUT_PREFIX="run02-deepseek"
node eval/run_cp3_spec_eval.mjs
```

Runner gồm 26 case: 18 case adaptation từ sáu câu thật VLearn chạy ở ba mức và tám hard case. Mỗi case gọi đúng một lần; quá trình có thể chậm và phát sinh chi phí API.

| Chỉ số CP3 | Kết quả |
|---|---:|
| HTTP 200 | 26/26 |
| Đạt thủ công | 22/26 (84,6%) |
| Factuality xác nhận được | 23/26 (88,5%) |
| Level Fit | 18/18 (100%) |
| Sensitivity | 6/6 bộ ba |
| Grounding hard case | 1/4 |
| Độ trễ trung bình | 62,9 giây |

Run 02 chạy lại bằng `zai-org/GLM-5.3-Flash`:

| Chỉ số Run 02 | Kết quả |
|---|---:|
| HTTP 200 | 15/26 |
| Timeout client 120 giây | 9/26 |
| Server 502 | 2/26 |
| Đạt thủ công (trong số có output) | 15/15 (100%) |
| Level Fit | 8/8 (100%) |
| Grounding hard case (thủ công) | 4/4 |
| No-evidence hallucination | 0 |
| Độ trễ trung bình (15 lượt 200) | 55,3 giây |

Chi tiết và nguyên nhân timeout: [báo cáo Run 02](eval/run02-glm-final.md).

Final Run (lessonContext end-to-end, `deepseek-ai/DeepSeek-V4-Flash-0731`, reviewer tắt):

| Chỉ số Final | Kết quả |
|---|---:|
| HTTP 200 | 26/26 |
| Tự động | 23/26 (88,5%) |
| Chấm thủ công | 25/26 (96,2%) |
| Factuality | 96,2% |
| Level Fit | 17/18 (94,4%) |
| No-evidence hallucination | 0 |
| Độ trễ trung bình | 19,7 giây |

Quality bar: **ĐẠT**. Chi tiết: [báo cáo Final](eval/final-run-final.md).

## Giới hạn đã biết

- `lessonContext` hiện là fixture demo của bài học (`codebase/lesson-context.js`); chưa tích hợp tự động lấy source/context từ backend VLearn production.
- Chưa có citation theo đoạn/trang cụ thể; UI chỉ hiển thị source scope của bài học.
- Khảo sát (Evidence A) hiện là pilot `n=4`, chưa đạt chuẩn Evidence A; repo chưa có log khảo sát ≥20 người ngoài nhóm.
- Chưa có log user validation thật từ willing users (xem `spec.md` §8.2).
- Endpoint OpenAI-compatible không có Google Search grounding.
- Reviewer JSON từ mô hình parse không ổn định (16/26 lượt ở CP3); Final Eval đã tắt reviewer để tránh latency và lỗi parse này.

## Cấu trúc repository

```text
.
├── spec.md                    # AI Spec hoàn chỉnh
├── TEAMMATES.md               # Thành viên nhóm
├── evidence/                  # Phương pháp + kết quả mining (Evidence B)
│   └── mining-vlearn.md
├── codebase/                  # Frontend, backend và unit test
│   ├── index.html
│   ├── script.js
│   ├── lesson-context.js      # Fixture lesson context demo
│   ├── server.js
│   └── test/
└── eval/
    ├── golden-set.csv
    ├── run_cp3_spec_eval.mjs
    ├── cp3-spec-deepseek-results.json
    └── cp3-spec-deepseek-final.md
```

## Bảo mật dữ liệu

`tutor_turns.csv` là dữ liệu VLearn nội bộ đã ẩn danh, chỉ dùng trong phạm vi hackathon và không được đưa lên repository công khai. Không commit `.env`, API key hoặc bản sao dữ liệu nguồn.
