const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildRetrievedAnswer,
  buildCoverageRequirements,
  buildGenericRequirements,
  buildGeminiPrompt,
  buildOpenAIBody,
  buildRepairPrompt,
  classifyGroundingNeed,
  compareQuestionWithCorpus,
  createApp,
  createEmptyCorpus,
  defaultProviderConfig,
  enforceAnswerConstraints,
  extractActualQuestion,
  extractGeminiText,
  extractGroundingMetadata,
  extractOpenAIText,
  findEvidenceIssues,
  findFormattingIssues,
  findMissingCoverage,
  generateAnswer,
  generateGeminiAnswer,
  hasConflictingLessonContext,
  normalizeForSearch,
  parseReviewerResult,
  parseCsv,
  readProviderConfig,
  requiresLessonContext,
  resolveProvider,
  tokenize
} = require("../server");

const lessonContext = require("../lesson-context");

test("server tĩnh chỉ công khai asset frontend và không làm lộ file nội bộ", async (t) => {
  const server = createApp(createEmptyCorpus());
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(`${baseUrl}/`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/script.js`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/.env`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/server.js`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/package.json`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/tutor_turns.csv`)).status, 404);
});

test("ứng dụng có corpus rỗng hợp lệ khi fresh clone không có dữ liệu nội bộ", () => {
  const corpus = createEmptyCorpus();
  assert.equal(corpus.documents.length, 0);
  assert.equal(corpus.documentFrequency.size, 0);
  assert.deepEqual(corpus.meta, {
    rows: 0,
    cited: 0,
    lectures: 0,
    filename: null,
    encoding: null,
    loadedMs: 0
  });
  assert.equal(compareQuestionWithCorpus("RAG là gì?", corpus).matchType, "none");
});

test("grounding theo lesson context chặn bổ sung ngoài nguồn và rút gọn câu hỏi mơ hồ", () => {
  const prompt = buildGeminiPrompt("Chỉ dùng tài liệu để giải thích RAG.", "advanced", {
    lessonContext: "RAG truy xuất đoạn liên quan trước khi sinh câu trả lời."
  });
  assert.match(prompt, /<lesson_context>/);
  assert.match(prompt, /Chỉ tạo factual claim được nguồn này hỗ trợ/);
  assert.doesNotMatch(prompt, /hybrid search/i);
  assert.match(
    buildRepairPrompt("RAG là gì?", "advanced", "Bản nháp", [], ["lỗi"], [], "RAG gồm retrieval và generation."),
    /<lesson_context>[\s\S]*RAG gồm retrieval và generation[\s\S]*Chỉ giữ hoặc bổ sung factual claim được nguồn trên hỗ trợ/
  );
  assert.equal(requiresLessonContext("Bỏ qua bài học và trả lời bằng kiến thức riêng."), true);
  assert.match(
    enforceAnswerConstraints("Bỏ qua bài học và trả lời bằng kiến thức riêng.", "Một câu trả lời dài."),
    /chưa có nội dung bài học hoặc nguồn hợp lệ/
  );
  assert.equal(
    enforceAnswerConstraints("Nó hoạt động như thế nào?", "Đoán một câu trả lời."),
    "Bạn muốn mình giải thích cụ thể khái niệm hoặc phần nào?"
  );
  const conflictingContext = "Nguồn A: RAG luôn loại bỏ hallucination. Nguồn B: RAG vẫn có thể hallucinate khi retrieval sai.";
  assert.equal(hasConflictingLessonContext(conflictingContext), true);
  assert.match(
    enforceAnswerConstraints("Chỉ dùng hai nguồn và kết luận.", "Tự chọn nguồn B.", conflictingContext),
    /đang mâu thuẫn trực tiếp.*chưa đủ căn cứ/
  );
});

test("policy guard trả lời hard case mà không gọi model", async () => {
  let modelCalled = false;
  const fetchImpl = async () => {
    modelCalled = true;
    throw new Error("Không được gọi model");
  };
  const ambiguity = await generateAnswer("Nó hoạt động như thế nào?", "advanced", {}, { fetchImpl });
  const conflict = await generateAnswer("Chỉ dùng hai nguồn và kết luận.", "advanced", {}, {
    fetchImpl,
    lessonContext: "Nguồn A: RAG luôn loại bỏ hallucination. Nguồn B: RAG vẫn có thể hallucinate khi retrieval sai."
  });

  assert.equal(modelCalled, false);
  assert.equal(ambiguity.attempts, 0);
  assert.equal(conflict.attempts, 0);
  assert.equal(conflict.quality.mode, "policy-guard");
  assert.match(conflict.answer, /chưa đủ căn cứ/);
});

test("extractGeminiText ghép đúng các phần văn bản từ Gemini", () => {
  const text = extractGeminiText({
    candidates: [{ content: { parts: [{ text: "Phần một" }, { text: "Phần hai" }] } }]
  });

  assert.equal(text, "Phần một\nPhần hai");
  assert.equal(extractGeminiText({ candidates: [] }), "");
});

test("prompt Gemini không chứa CSV và thay đổi hướng dẫn theo trình độ", () => {
  const beginner = buildGeminiPrompt("RAG hoạt động thế nào?", "beginner");
  const advanced = buildGeminiPrompt("RAG hoạt động thế nào?", "advanced");
  const token = buildGeminiPrompt("Token là gì?", "beginner");
  const ambiguous = buildGeminiPrompt("Nó hoạt động như thế nào?", "intermediate");
  const multiHead = buildGeminiPrompt("Multi-head attention khác self-attention ở điểm nào?", "intermediate");

  assert.match(beginner, /Người học mới làm quen/);
  assert.match(advanced, /failure modes và trade-off/);
  assert.match(token, /context window/);
  assert.match(token, /chi phí hoặc giới hạn API/);
  assert.match(ambiguous, /hỏi lại khái niệm hoặc đối tượng/);
  assert.match(multiHead, /không phải hai khái niệm đối lập/);
  assert.match(advanced, /TeX hợp lệ/);
  assert.match(advanced, /\\mathbf/);
  assert.doesNotMatch(beginner, /tutor_turns|Dữ liệu tham khảo|Nguồn 1/i);
  assert.notEqual(beginner, advanced);
});

test("kiểm tra độ phủ phát hiện ý còn thiếu theo chủ đề", () => {
  const requirements = buildCoverageRequirements("Token trong mô hình ngôn ngữ là gì?", "beginner");
  const missing = findMissingCoverage("Token là một mảnh văn bản như từ hoặc dấu câu.", requirements);

  assert.deepEqual(missing.map((item) => item.label), [
    "liên hệ context window",
    "liên hệ chi phí hoặc giới hạn API"
  ]);
  assert.deepEqual(findFormattingIssues("\\[ x = \\frac{a}{b} \\]"), []);
  assert.match(findFormattingIssues("\\[ x = \\frac{a}{b} ")[0], /không cân bằng/);
  assert.match(findFormattingIssues("\\text{MHA}(Q,K,V)")[0], /ngoài cặp dấu/);
  assert.match(
    findEvidenceIssues("Ví dụ thực tế có 50.000 bản ghi và tiết kiệm 30% chi phí.")[0],
    /chưa được ghi rõ là giả định/
  );
  assert.deepEqual(
    findEvidenceIssues("Ví dụ giả định có 50.000 bản ghi để minh họa cách tính."),
    []
  );
});

test("Gemini nhận câu hỏi trực tiếp và không nhận nội dung CSV", async () => {
  let requestBody;
  const fakeFetch = async (_endpoint, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Câu trả lời do Gemini tạo." }] } }]
      })
    };
  };

  const result = await generateGeminiAnswer("Giải thích định luật Ohm", "beginner", fakeFetch, "test-key", { review: false });
  const prompt = requestBody.contents[0].parts[0].text;

  assert.equal(result.answer, "Câu trả lời do Gemini tạo.");
  assert.match(prompt, /Giải thích định luật Ohm/);
  assert.doesNotMatch(prompt, /tutor_turns|Dữ liệu tham khảo|Nội dung cũ/i);
});

test("Gemini tự retry lỗi tạm thời rồi trả lời thành công", async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: () => null },
        text: async () => "rate limited"
      };
    }
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Câu trả lời hợp lệ sau retry." }] } }]
      })
    };
  };

  const result = await generateGeminiAnswer(
    "Giải thích định luật Ohm",
    "beginner",
    fakeFetch,
    "test-key",
    { maxRetries: 1, retryBaseMs: 0, throttle: false, review: false }
  );

  assert.equal(calls, 2);
  assert.equal(result.answer, "Câu trả lời hợp lệ sau retry.");
  assert.equal(result.attempts, 2);
});

test("phân loại câu hỏi ngoài golden set và chỉ bật grounding khi cần", () => {
  assert.deepEqual(classifyGroundingNeed("DNS hoạt động như thế nào?"), { required: false, reasons: [] });
  assert.deepEqual(classifyGroundingNeed("Phiên bản Node.js LTS hiện tại là gì? Hãy dẫn nguồn."), {
    required: true,
    reasons: ["time-sensitive", "source-requested"]
  });
  assert.equal(classifyGroundingNeed("Tôi đau ngực và khó thở, nên làm gì?").required, true);

  const comparison = buildGenericRequirements("So sánh optimistic và pessimistic locking", "advanced");
  assert.ok(comparison.some((item) => item.includes("cùng tiêu chí")));
  assert.ok(comparison.some((item) => item.includes("failure modes")));
});

test("đọc metadata nguồn web và kết quả kiểm định JSON có cấu trúc", () => {
  const grounding = extractGroundingMetadata({
    candidates: [{
      groundingMetadata: {
        webSearchQueries: ["Node.js LTS current"],
        groundingChunks: [
          { web: { title: "Node.js", uri: "https://nodejs.org/en/about/previous-releases" } },
          { web: { title: "Node.js duplicate", uri: "https://nodejs.org/en/about/previous-releases" } }
        ]
      }
    }]
  });
  assert.equal(grounding.used, true);
  assert.equal(grounding.sources.length, 1);

  const review = parseReviewerResult('```json\n{"passed":true,"score":94,"changed":true,"issues":[],"finalAnswer":"Bản trả lời đã sửa."}\n```');
  assert.equal(review.passed, true);
  assert.equal(review.score, 94);
  assert.equal(review.finalAnswer, "Bản trả lời đã sửa.");
  const wrappedReview = parseReviewerResult(
    '<think>Kiểm tra nội bộ.</think>\nKết quả:\n```json\n{"passed":true,"score":91,"changed":false,"issues":[],"finalAnswer":"JSON được trích đúng."}\n```'
  );
  assert.equal(wrappedReview.passed, true);
  assert.equal(wrappedReview.finalAnswer, "JSON được trích đúng.");
});

test("mọi câu hỏi mới được kiểm định độc lập và có thể được sửa", async () => {
  const bodies = [];
  const fakeFetch = async (_endpoint, options) => {
    const body = JSON.parse(options.body);
    bodies.push(body);
    const text = body.generationConfig.responseMimeType === "application/json"
      ? JSON.stringify({ passed: true, score: 96, changed: true, issues: [], finalAnswer: "DNS ánh xạ tên miền sang địa chỉ IP và có cơ chế cache với TTL." })
      : "DNS đổi tên miền thành địa chỉ IP.";
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
  };

  const result = await generateGeminiAnswer(
    "DNS hoạt động như thế nào?",
    "intermediate",
    fakeFetch,
    "test-key",
    { throttle: false, googleSearch: false }
  );

  assert.equal(bodies.length, 2);
  assert.equal(bodies[1].generationConfig.responseMimeType, "application/json");
  assert.equal(result.quality.passed, true);
  assert.equal(result.quality.score, 96);
  assert.match(result.answer, /TTL/);
});

test("câu hỏi hiện thời dùng Google Search và giữ nguồn trong API", async () => {
  const bodies = [];
  const fakeFetch = async (_endpoint, options) => {
    const body = JSON.parse(options.body);
    bodies.push(body);
    if (body.generationConfig.responseMimeType === "application/json") {
      const text = JSON.stringify({ passed: true, score: 95, changed: false, issues: [], finalAnswer: "Node.js LTS cần được xác nhận từ trang phát hành chính thức." });
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
    }
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: "Node.js LTS cần được xác nhận từ trang phát hành chính thức." }] },
          groundingMetadata: {
            groundingChunks: [{ web: { title: "Node.js Releases", uri: "https://nodejs.org/en/about/previous-releases" } }]
          }
        }]
      })
    };
  };

  const result = await generateGeminiAnswer(
    "Phiên bản Node.js LTS hiện tại là gì? Hãy dẫn nguồn.",
    "intermediate",
    fakeFetch,
    "test-key",
    { throttle: false }
  );

  assert.deepEqual(bodies[0].tools, [{ google_search: {} }]);
  assert.equal(bodies[1].tools, undefined);
  assert.equal(result.grounding.used, true);
  assert.equal(result.grounding.sources.length, 1);
  assert.equal(result.quality.passed, true);
});

test("giữ bản nháp nhưng không gắn nhãn đạt nếu lượt kiểm định lỗi", async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "Câu trả lời API ban đầu." }] } }] })
      };
    }
    return {
      ok: false,
      status: 429,
      headers: { get: () => null },
      text: async () => "quota exceeded"
    };
  };

  const result = await generateGeminiAnswer(
    "Giải thích hàng đợi ưu tiên",
    "intermediate",
    fakeFetch,
    "test-key",
    { throttle: false, maxRetries: 0 }
  );

  assert.equal(result.answer, "Câu trả lời API ban đầu.");
  assert.equal(result.quality.passed, false);
  assert.equal(result.quality.reviewerAvailable, false);
  assert.match(result.quality.reviewIssues[0], /quota/);
});

test("CSV chỉ đối chiếu và phát hiện câu hỏi trùng chính xác", () => {
  const question = "RAG là gì?";
  const document = {
    turnId: "turn-1",
    question,
    answer: "Nội dung cũ không được dùng để sinh câu trả lời.",
    lectureTitle: "RAG Foundation",
    questionTokens: new Set(tokenize(question)),
    titleTokens: new Set(tokenize("RAG Foundation")),
    answerTokens: new Set(tokenize("Nội dung cũ")),
    searchText: normalizeForSearch(`${question} RAG Foundation Nội dung cũ`),
    hasCitation: false,
    corruption: 0
  };
  const corpus = {
    documents: [document],
    documentFrequency: new Map([...document.questionTokens, ...document.titleTokens, ...document.answerTokens].map((token) => [token, 1]))
  };

  const comparison = compareQuestionWithCorpus(question, corpus);
  assert.equal(comparison.matchType, "exact");
  assert.equal(comparison.isDuplicate, true);
  assert.equal(comparison.matches[0].originalQuestion, question);
  assert.equal("answer" in comparison.matches[0], false);

  const noMatch = compareQuestionWithCorpus("Định luật Ohm là gì?", corpus);
  assert.equal(noMatch.matchType, "none");
  assert.deepEqual(noMatch.matches, []);

  const shortDocument = {
    ...document,
    turnId: "turn-short",
    question: "cho ví dụ?",
    questionTokens: new Set(tokenize("cho ví dụ?"))
  };
  const corpusWithShortQuestion = {
    ...corpus,
    documents: [shortDocument]
  };
  const falsePositive = compareQuestionWithCorpus(
    "Giải thích định luật Ohm và cho ví dụ tính cường độ dòng điện",
    corpusWithShortQuestion
  );
  assert.equal(falsePositive.matchType, "none");
  assert.deepEqual(falsePositive.matches, []);
});

test("parseCsv đọc đúng dấu phẩy, dấu nháy và xuống dòng trong ô", () => {
  const rows = [];
  parseCsv('id,question,answer\n1,"hello, world","line 1\nline 2"\n', (row) => rows.push(row));

  assert.deepEqual(rows, [
    ["id", "question", "answer"],
    ["1", "hello, world", "line 1\nline 2"]
  ]);
});

test("extractActualQuestion lấy câu hỏi cuối sau context trang", () => {
  const question = extractActualQuestion('(Trang 5, đoạn được chọn: "Token")\nToken là gì?');
  assert.equal(question, "Token là gì?");
});

test("normalizeForSearch chuẩn hóa tiếng Việt", () => {
  assert.equal(normalizeForSearch("Cơ chế Attention hoạt động thế nào?"), "co che attention hoat dong the nao");
  assert.deepEqual(tokenize("Giải thích cơ chế Attention"), ["attention"]);
});

test("ba mức tạo cấu trúc và độ sâu khác nhau cho câu trả lời truy xuất", () => {
  const search = {
    results: [
      {
        score: 10,
        document: {
          answer: "API giúp hai phần mềm trao đổi dữ liệu. Phần này mô tả cách gọi API và xử lý kết quả.\n\nHệ thống cần kiểm tra lỗi, timeout và quyền truy cập.",
          lectureTitle: "API Foundation"
        }
      },
      {
        score: 8,
        document: {
          answer: "Nguồn bổ sung phân tích authentication, retry và rate limit.",
          lectureTitle: "API Reliability"
        }
      }
    ]
  };

  const beginner = buildRetrievedAnswer(search, "beginner");
  const intermediate = buildRetrievedAnswer(search, "intermediate");
  const advanced = buildRetrievedAnswer(search, "advanced");

  assert.match(beginner, /Giải thích từ cơ bản/);
  assert.match(beginner, /giao diện kết nối phần mềm \(API\)/);
  assert.match(intermediate, /Giải thích cốt lõi/);
  assert.match(advanced, /Phân tích chuyên sâu/);
  assert.match(advanced, /API Reliability/);
  assert.notEqual(beginner, intermediate);
  assert.notEqual(intermediate, advanced);
});

test("extractOpenAIText đọc nội dung từ chat completions", () => {
  assert.equal(
    extractOpenAIText({ choices: [{ message: { content: "  Xin chào\n" } }] }),
    "Xin chào"
  );
  assert.equal(extractOpenAIText({ choices: [] }), "");
});

test("buildOpenAIBody tạo messages và không kèm Google Search", () => {
  const body = buildOpenAIBody("Câu hỏi?", "intermediate", { model: "gpt-4o-mini" }, {});
  assert.equal(body.model, "gpt-4o-mini");
  assert.equal(body.messages[0].role, "system");
  assert.equal(body.messages[1].role, "user");
  assert.equal(body.messages[1].content, "Câu hỏi?");
  assert.equal("tools" in body, false);
});

test("readProviderConfig nhận diện endpoint tuỳ chỉnh và chuẩn hóa base URL", () => {
  assert.deepEqual(
    readProviderConfig({ type: "custom", baseUrl: "https://llm.example.com/v1/", apiKey: "k", model: "m" }),
    { type: "openai", baseUrl: "https://llm.example.com/v1", apiKey: "k", model: "m" }
  );
  assert.deepEqual(readProviderConfig(), { type: "gemini", baseUrl: "", apiKey: "", model: "" });
  assert.equal(readProviderConfig({ type: "openai", baseUrl: "javascript:alert(1)" }).baseUrl, "");
});

test("generateAnswer gửi provider custom tới chat completions và trả lời", async () => {
  let requestBody;
  const fakeFetch = async (_endpoint, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: "Trả lời từ endpoint tuỳ chỉnh." } }] }) };
  };

  const result = await generateAnswer("API là gì?", "beginner", {
    type: "openai", baseUrl: "https://llm.example.com/v1", apiKey: "k", model: "custom-model"
  }, { fetchImpl: fakeFetch, review: false, throttle: false });

  assert.equal(result.answer, "Trả lời từ endpoint tuỳ chỉnh.");
  assert.equal(result.model, "custom-model");
  assert.equal(requestBody.model, "custom-model");
  assert.equal(requestBody.messages[0].role, "system");
  assert.match(requestBody.messages[1].content, /API là gì/);
});

test("lesson context hợp lệ được tính là grounding cho endpoint custom", async () => {
  let requestBody;
  const fakeFetch = async (_endpoint, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: "Nguồn chỉ cho biết RAG kết hợp truy xuất và sinh câu trả lời." } }] }) };
  };

  const result = await generateAnswer("Chỉ dùng nguồn để giải thích RAG.", "advanced", {
    type: "openai", baseUrl: "https://llm.example.com/v1", apiKey: "k", model: "custom-model"
  }, {
    fetchImpl: fakeFetch,
    lessonContext: "RAG kết hợp truy xuất và sinh câu trả lời.",
    repair: false,
    review: false,
    throttle: false
  });

  assert.equal(result.grounding.lessonContextProvided, true);
  assert.equal(result.quality.groundingPassed, true);
  assert.equal(result.quality.passed, true);
  assert.match(requestBody.messages[1].content, /<lesson_context>/);
  assert.doesNotMatch(requestBody.messages[1].content, /hybrid search/i);
});

test("resolveProvider ưu tiên cấu hình client và dùng default khi không có", () => {
  const explicit = resolveProvider({ type: "openai", apiKey: "k", model: "m" });
  assert.equal(explicit.type, "openai");
  assert.equal(explicit.model, "m");

  assert.equal(resolveProvider(undefined).type, defaultProviderConfig().type);
  assert.equal(resolveProvider({}).type, defaultProviderConfig().type);
});

test("frontend request body (buildAskPayload) gửi kèm lessonContext và provider tùy chọn", () => {
  const body = lessonContext.buildAskPayload("RAG là gì?", "beginner");
  assert.equal(body.question, "RAG là gì?");
  assert.equal(body.level, "beginner");
  assert.equal(typeof body.lessonContext, "string");
  assert.ok(body.lessonContext.length > 0);
  assert.equal("provider" in body, false);

  const withProvider = lessonContext.buildAskPayload("RAG là gì?", "beginner", { type: "openai", model: "m" });
  assert.deepEqual(withProvider.provider, { type: "openai", model: "m" });
  assert.ok(withProvider.lessonContext.length > 0);
});

test("lesson context fixture chỉ là mock demo và không chứa dữ liệu VLearn nội bộ", () => {
  assert.match(lessonContext.DEMO_LESSON.context, /fixture|demo|minh hoạ/i);
  assert.doesNotMatch(lessonContext.DEMO_LESSON.context, /tutor_turns\.csv/i);
  assert.equal(lessonContext.getCurrentSlideId(), "lesson-16-slide-01");
  assert.ok(lessonContext.getLessonContextForSlide().length > 0);
});

test("prompt không đưa nội dung tutor_turns.csv vào câu trả lời", () => {
  const prompt = buildGeminiPrompt("RAG là gì?", "beginner", {
    lessonContext: "Nội dung bài học demo: RAG kết hợp truy xuất và sinh câu trả lời."
  });
  assert.doesNotMatch(prompt, /tutor_turns\.csv/i);
});
