# Chạy VLearn Adaptive Tutor

Backend Node.js phục vụ frontend tĩnh và hai API chính: kiểm tra trạng thái model và tạo câu trả lời thích ứng theo level.

## Khởi động

```powershell
Copy-Item .env.example .env
# Điền một cấu hình provider trong .env.
npm start
```

Mở <http://localhost:8090>. Nếu đổi cổng:

```powershell
$env:PORT=8091
npm start
```

Frontend tự gọi API cùng origin nên vẫn hoạt động trên cổng mới.

## Chọn provider

### DeepSeek hoặc endpoint OpenAI-compatible

```env
AI_PROVIDER=openai
CUSTOM_BASE_URL=https://api.inference.wandb.ai/v1
CUSTOM_API_KEY=<YOUR_API_KEY>
CUSTOM_MODEL=deepseek-ai/DeepSeek-V4-Pro-0813
```

Backend gọi `{CUSTOM_BASE_URL}/chat/completions`. Có thể thay bằng OpenAI, OpenRouter, Groq, Ollama hoặc provider tương thích khác.

### Gemini

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
GEMINI_MODEL=gemini-3.5-flash-lite
```

Gemini có thể bật Google Search grounding cho câu hỏi hiện thời, yêu cầu nguồn hoặc nội dung rủi ro cao. Endpoint OpenAI-compatible không có khả năng này.

Người dùng cũng có thể nhập cấu hình endpoint trong giao diện. Cấu hình này lưu trong `localStorage` và được gửi tới backend khi gọi API; không được ghi vào mã nguồn.

## Lesson context fixture (demo)

Frontend gửi kèm `lessonContext` cho mỗi câu hỏi. MVP chưa tích hợp VLearn production nên context này là một fixture demo đặt tại `codebase/lesson-context.js`, gắn với bài học giả lập "Bài 16 · Mini Hackathon". Nội dung fixture rõ ràng là mock, không phải dữ liệu VLearn thật và không chứa dữ liệu học viên.

## Dữ liệu VLearn tùy chọn

Nếu có quyền sử dụng data pack, đặt file tại:

```text
codebase/tutor_turns.csv
```

Nếu thiếu file, server vẫn chạy với corpus rỗng và tắt đối chiếu câu hỏi. CSV chỉ dùng so sánh câu hỏi; `tutor_reply` không được đưa vào prompt hoặc trả về thay model.

## API

### `GET /api/health`

Trả trạng thái provider mặc định, cấu hình kiểm định và số dòng corpus đã nạp.

### `POST /api/ask`

```json
{
  "question": "RAG hoạt động như thế nào?",
  "level": "beginner",
  "lessonContext": "Nội dung bài học hoặc source chunks được phép dùng để trả lời."
}
```

`level` nhận `beginner`, `intermediate` hoặc `advanced`. `lessonContext` là tùy chọn, tối đa 12.000 ký tự; có thể dùng alias `context`. Khi câu hỏi yêu cầu chỉ dùng tài liệu nhưng không có context, backend yêu cầu người dùng cung cấp nguồn thay vì tự tạo factual claim.

### `POST /api/test-connection`

Kiểm tra cấu hình provider được gửi từ giao diện mà không lưu cấu hình trên server.

## Kiểm thử

```powershell
npm test
```

Test bao phủ prompt theo level, coverage rules, retry, grounding metadata, policy guard cho nguồn xung đột/mơ hồ, reviewer JSON có wrapper, corpus rỗng, static-file allowlist, CSV parser, question comparison và provider OpenAI-compatible.

## Lưu ý an toàn

- Không commit `.env` hoặc API key.
- Static server chỉ công khai `index.html`, `styles.css`, `script.js` và favicon; `.env`, CSV, source backend và file cấu hình không thể tải qua HTTP.
- Tool/function output vẫn phải được validate trước khi dùng trong hệ thống thật.
- Nhãn “Đã kiểm tra” chỉ xuất hiện khi các kiểm tra nội bộ đạt; đây không phải cam kết câu trả lời luôn chính xác.
- Đây là prototype demo cục bộ. Trước khi public deploy cần thêm xác thực, rate limit, CORS allowlist, giới hạn domain endpoint và chuyển API key hoàn toàn về server; không dùng cơ chế lưu key trong `localStorage` cho môi trường dùng chung.
