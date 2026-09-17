// eval/lesson-context-fixtures.mjs
//
// Evaluation-only lesson context fixtures cho Final Eval.
// Đây là nội dung học tập tổng hợp cho 6 topic của golden set, DÙNG RIÊNG CHO EVAL.
// KHÔNG phải dữ liệu VLearn thật, không chứa dữ liệu cá nhân, tutor_turns.csv hay API key.
// Deterministic và dễ audit.

const LESSON_CONTEXT = {
  rag: [
    "RAG (Retrieval-Augmented Generation) kết hợp truy xuất tài liệu với sinh câu trả lời.",
    "- Truy xuất (retrieval): biến câu hỏi thành query, tìm các đoạn (chunk) liên quan trong kho tài liệu.",
    "- Sinh (generation): LLM dùng các đoạn truy xuất được làm ngữ cảnh để tạo câu trả lời có căn cứ.",
    "Pipeline gồm: chia tài liệu thành chunk → embedding → lưu index (vector DB) → retrieval (tìm top-k theo độ tương đồng cosine) → context assembly → generation.",
    "Kỹ thuật nâng cao: hybrid search (gộp keyword + vector), reranking (sắp xếp lại kết quả), context packing (gom đoạn liên quan để tiết kiệm token).",
    "Trade-off: chunk quá nhỏ làm mất ngữ cảnh, quá lớn thì loãng; retrieval sai làm answer sai.",
    "Metrics: recall, precision, faithfulness, latency, chi phí token.",
    "Giới hạn: RAG không đảm bảo loại bỏ hoàn toàn hallucination — khi retrieval sai hoặc nguồn thiếu, model vẫn có thể sai."
  ].join("\n"),

  "feature-extraction": [
    "Feature extraction (trích xuất đặc trưng) chuyển dữ liệu thô (văn bản, ảnh, âm thanh) thành vector/đặc trưng số để thuật toán học máy dùng.",
    "- Đầu vào: dữ liệu thô; đầu ra: đặc trưng (feature).",
    "- Phương pháp: đếm/đo lường thủ công, TF-IDF, embedding học được; PCA/autoencoder/CNN cho ảnh.",
    "Cơ chế: biến thông tin thừa/nhiễu thành biểu diễn gọn, giữ lại thông tin ý nghĩa.",
    "Failure mode: rò rỉ dữ liệu (data leakage) khi chuẩn hóa trên cả train + test trước khi tách; đặc trưng không ổn định.",
    "Trade-off: nhiều đặc trưng → overfitting; quá ít → underfitting.",
    "Cách đo: đánh giá hiệu năng task downstream (độ chính xác trên tập test)."
  ].join("\n"),

  "right-problem": [
    "Câu 'giải pháp xuất sắc cho sai vấn đề có thể còn tệ hơn không có giải pháp':",
    "- Sai vấn đề = xây thứ người dùng không cần; nguồn lực đổ vào hướng không tạo giá trị.",
    "- Đúng vấn đề bắt đầu từ nhu cầu / pain point thật của người dùng, không từ giải pháp có sẵn.",
    "Cơ chế phát hiện đúng vấn đề: đặt câu hỏi probing, quan sát hành vi, phân tích dữ liệu.",
    "Cách xác thực: hỏi/kiểm thử với người dùng (mom test), thử nghiệm nhỏ, đo trước-sau.",
    "Failure mode: xác nhận sai (confirmation bias), đo sai metric thành công.",
    "Cách đo: sự thay đổi trong công việc của người dùng (giảm bước, tiết kiệm thời gian), không phải số feature đã ship."
  ].join("\n"),

  "function-calling": [
    "Function calling cho phép LLM không tự trả lời mà đề xuất gọi một hàm/công cụ có sẵn:",
    "- Model trả về tên hàm + tham số theo schema (JSON Schema) thay vì văn bản tự do.",
    "- Ứng dụng thực thi hàm thật, trả kết quả (tool result) lại cho model để tổng hợp phản hồi.",
    "Cơ chế: định nghĩa schema → model chọn hàm + điền tham số → app gọi → tool result → model sinh phản hồi.",
    "Validation: kiểm tra tên hàm, kiểu tham số, giá trị hợp lệ trước khi thực thi.",
    "Failure mode: tham số bị bịa, sai schema, gọi nhầm hàm, prompt injection, vòng lặp gọi hàm.",
    "Security: validate + giới hạn permission của tool.",
    "Metric: số lần gọi, tỷ lệ đúng schema, latency, chi phí token."
  ].join("\n"),

  "prompt-techniques": [
    "Các kỹ thuật prompt:",
    "- Zero-shot: chỉ đưa chỉ dẫn, không ví dụ.",
    "- One-shot / Few-shot: kèm 1 hoặc vài ví dụ input→output (in-context learning).",
    "- Chain-of-Thought (CoT): yêu cầu model lập luận từng bước.",
    "Cơ chế: ví dụ giúp model bắt chước định dạng/cách suy luận; CoT tăng độ chính xác ở bài toán nhiều bước.",
    "Điều kiện áp dụng: few-shot hiệu quả khi ví dụ đại diện; CoT phù hợp bài toán suy luận.",
    "Failure mode: ví dụ lệch → output lệch; CoT dài → tăng latency/token.",
    "Cách kiểm chứng: so output với đáp án trên tập case cố định."
  ].join("\n"),

  "failure-modes": [
    "Failure mode (kiểu lỗi) là những cách cụ thể một feature có thể chạy sai hoặc không đạt mục tiêu.",
    "Liệt kê failure mode trước khi viết feature giúp thiết kế gồm cả xử lý lỗi từ đầu.",
    "Phân biệt: mode (cách lỗi) / cause (nguyên nhân) / effect (hậu quả).",
    "Mitigation (giảm thiểu): logging, retry, fallback, validation, giới hạn permission.",
    "Trade-off: phân tích kỹ tốn thời gian ban đầu, nhưng sửa lỗi sau triển khai đắt hơn nhiều.",
    "Cách đo: số lỗi phát hiện sau khi triển khai, thời gian phục hồi (MTTR)."
  ].join("\n")
};

export function contextForTopic(topic) {
  return LESSON_CONTEXT[topic] || "";
}