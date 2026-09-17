// lesson-context.js — Fixture lesson context cho prototype hackathon.
//
// Đây KHÔNG phải dữ liệu VLearn thật. Nó chỉ là một "lesson context" giả lập,
// an toàn và rõ ràng là mock/fixture, để chứng minh luồng end-to-end:
//
//   frontend (script.js ─ buildAskBody)
//     → POST /api/ask { question, level, lessonContext }
//     → backend (server.js ─ buildGeminiPrompt / buildOpenAIBody)
//     → prompt chứa <lesson_context> và grounding theo context đó.
//
// Trong bản production thật, lessonContext sẽ được lấy từ slide/tài liệu bài học
// hiện tại của VLearn (chưa tích hợp ở MVP này).

(function (global) {
  "use strict";

  const DEMO_LESSON = {
    id: "lesson-16-slide-01",
    title: "Mini Hackathon",
    sourceLabel: "Nội dung bài học hiện tại · Bài 16 Mini Hackathon (fixture demo)",
    context: [
      "# Bài 16 · Mini Hackathon (fixture demo)",
      "",
      "Nội dung dưới đây là fixture minh hoạ cho prototype, không phải dữ liệu VLearn thật.",
      "",
      "- Trong một Mini Hackathon, nhóm có một khoảng thời gian ngắn để xây một prototype AI giải quyết một vấn đề cụ thể của người học.",
      "- Để prototype khả thi trong thời gian ngắn, nhóm cần: xác định pain cụ thể, vẽ lát cắt nhỏ nhất có thể build được, gọi AI thật ở bước quyết định trung tâm, và đo kết quả bằng một tập case (golden set) với chất lượng được định nghĩa trước.",
      "- \"Adaptive explanation level\" (điều chỉnh mức giải thích) là việc thay đổi cách trình bày — từ vựng, mức độ chi tiết, ví dụ — theo trình độ người học, nhưng giữ nguyên tính đúng đắn của nội dung (grounding từ tài liệu bài học).",
      "- Ba mức minh hoạ: Mới làm quen (định nghĩa trước, ưu tiên ví dụ), Đã có nền tảng (đi thẳng vào ý chính), Muốn đào sâu (cơ chế, quan hệ và đánh đổi)."
    ].join("\n")
  };

  function getCurrentSlideId() {
    return DEMO_LESSON.id;
  }

  function getLessonContextForSlide() {
    return DEMO_LESSON.context;
  }

  // Tạo request body cho POST /api/ask. `provider` là tuỳ chọn (dùng cho endpoint tuỳ chỉnh).
  function buildAskPayload(question, level, provider) {
    const body = {
      question,
      level,
      lessonContext: getLessonContextForSlide()
    };
    if (provider) body.provider = provider;
    return body;
  }

  const api = {
    DEMO_LESSON,
    getCurrentSlideId,
    getLessonContextForSlide,
    buildAskPayload
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.VlearnLessonContext = api;
  }
})(typeof window !== "undefined" ? window : globalThis);