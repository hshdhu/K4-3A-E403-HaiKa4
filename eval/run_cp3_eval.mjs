// Legacy runner 20 case, giữ lại để đối chiếu. Bản dùng cho submission là run_cp3_spec_eval.mjs (26 case theo spec).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = process.env.CP3_API_URL || "http://localhost:8090/api/ask";
const OUTPUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PREFIX = process.env.CP3_OUTPUT_PREFIX || "cp3-eval";

const cases = [
  [1, "beginner", "Transformer là gì và dùng để làm gì?", [["transformer"], ["attention", "chu y"], ["vi du"]]],
  [2, "beginner", "Token trong mô hình ngôn ngữ là gì?", [["token"], ["don vi", "manh", "tu", "ky tu"], ["context", "ngu canh"], ["chi phi", "gioi han"]]],
  [3, "beginner", "Embedding là gì? Cho một ví dụ dễ hiểu.", [["vector", "vec-to"], ["y nghia", "ngu nghia"], ["vi du", "tuong dong", "gan nhau"]]],
  [4, "beginner", "RAG là gì và vì sao cần RAG?", [["truy xuat", "tim kiem", "retrieval", "retrieve"], ["tao cau tra loi", "sinh cau tra loi", "generation"], ["giam bia", "cap nhat", "nguon", "du lieu rieng", "chinh xac"]]],
  [5, "beginner", "API là gì? Cho ví dụ trong ứng dụng AI.", [["api"], ["giao tiep", "ket noi", "yeu cau"], ["phan mem", "ung dung", "server"], ["vi du"]]],
  [6, "intermediate", "Self-attention hoạt động như thế nào?", [["query"], ["key"], ["value"], ["trong so", "softmax", "attention score"]]],
  [7, "intermediate", "Multi-head attention khác self-attention ở điểm nào?", [["multi-head", "nhieu head", "cac head", "nhieu dau"], ["song song", "khac nhau", "quan he", "khong gian"]]],
  [8, "intermediate", "Prompt engineering gồm những thành phần nào?", [["instruction", "chi dan", "yeu cau"], ["context", "ngu canh"], ["input", "du lieu dau vao"], ["output", "dau ra"], ["vi du", "example"]]],
  [9, "intermediate", "Tool calling hoạt động ra sao?", [["chon cong cu", "lua chon cong cu", "tool"], ["tham so", "parameter", "argument"], ["ket qua", "phan hoi"], ["loi", "kiem tra", "xac thuc"]]],
  [10, "intermediate", "AI agent khác chatbot thông thường như thế nào?", [["muc tieu"], ["state", "trang thai", "bo nho"], ["tool", "cong cu"], ["vong lap", "lap lai", "hanh dong"]]],
  [11, "intermediate", "Logging và monitoring khác nhau thế nào?", [["log", "su kien"], ["metric", "chi so"], ["canh bao", "alert", "xu huong", "theo doi"]]],
  [12, "intermediate", "Cách xác định bài toán kinh doanh cho AI?", [["user", "nguoi dung"], ["workflow", "quy trinh"], ["pain", "noi dau", "van de"], ["du lieu", "data"], ["cost of error", "chi phi sai", "hau qua"]]],
  [13, "intermediate", "Golden set là gì và dùng để đánh giá hệ thống AI ra sao?", [["case", "bo du lieu", "tap du lieu"], ["co dinh", "nhat quan"], ["expected", "ket qua mong doi", "ground truth"], ["quality bar", "nguong", "tieu chi", "metric"]]],
  [14, "advanced", "Phân tích các failure mode chính của một pipeline RAG.", [["retrieval miss", "bo sot", "khong tim thay"], ["context dilution", "nhieu", "khong lien quan", "pha loang"], ["xung dot", "mau thuan", "conflict"], ["citation", "trich dan", "nguon"]]],
  [15, "advanced", "Phân tích trade-off giữa độ chính xác, latency và chi phí khi gọi LLM API.", [["chinh xac", "accuracy"], ["latency", "do tre"], ["chi phi", "cost"], ["model", "token"], ["cache", "caching", "retry", "thu lai"], ["trade-off", "danh doi", "can bang"]]],
  [16, "advanced", "Viết và giải thích công thức scaled dot-product attention.", [["softmax"], ["q"], ["k"], ["v"], ["sqrt", "can bac hai", "d_k", "dk"], ["scaled", "ti le", "chia"]]],
  [17, "beginner", "RAG hoạt động như thế nào?", [["rag"], ["truy xuat", "tim kiem", "retrieval"], ["tao cau tra loi", "sinh cau tra loi", "generation"], ["vi du"]]],
  [18, "intermediate", "RAG hoạt động như thế nào?", [["retrieval", "truy xuat", "tim kiem"], ["chunk", "doan"], ["context", "ngu canh"], ["generation", "sinh", "tao cau tra loi"]]],
  [19, "advanced", "RAG hoạt động như thế nào?", [["hybrid search", "tim kiem ket hop"], ["rerank", "xep hang lai"], ["context packing", "dong goi ngu canh", "xep ngu canh"], ["metric", "chi so", "recall", "precision"], ["trade-off", "danh doi", "can bang"]]],
  [20, "intermediate", "Nó hoạt động như thế nào?", [["cu the", "lam ro", "dang noi", "khai niem nao", "vui long cho biet", "ban muon hoi"]]],
];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function countWords(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function checkKeywordGroups(answer, groups) {
  const normalized = normalize(answer);
  return groups.map((alternatives) => ({
    alternatives,
    matched: alternatives.find((term) => normalized.includes(normalize(term))) || null,
  }));
}

function structuralChecks(payload) {
  return {
    hasAnswer: typeof payload?.answer === "string" && payload.answer.trim().length >= 40,
    geminiDirect: payload?.generationMode === "gemini-direct",
    geminiUsed: payload?.ai?.provider === "gemini" && payload?.ai?.used === true,
    csvNotAnswer: payload?.dataPolicy?.answerProvider === "gemini-only" && payload?.dataPolicy?.csvAnswerUsed === false,
    backendQualityPassed: payload?.ai?.quality?.checked === true && payload?.ai?.quality?.passed === true,
  };
}

const results = [];
for (const [number, level, question, groups] of cases) {
  const startedAt = Date.now();
  let httpStatus = 0;
  let payload = null;
  let requestError = null;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, level }),
      signal: AbortSignal.timeout(60000),
    });
    httpStatus = response.status;
    payload = await response.json();
  } catch (error) {
    requestError = error.message;
  }

  const elapsedMs = Date.now() - startedAt;
  const answer = payload?.answer || "";
  const structure = structuralChecks(payload);
  const keywordGroups = checkKeywordGroups(answer, groups);
  const allStructurePassed = httpStatus === 200 && Object.values(structure).every(Boolean);
  const allKeywordGroupsPassed = keywordGroups.every((group) => group.matched);
  const result = {
    number,
    level,
    question,
    httpStatus,
    elapsedMs,
    requestError,
    wordCount: countWords(answer),
    structure,
    keywordGroups,
    automatedPass: allStructurePassed && allKeywordGroupsPassed,
    comparison: payload?.comparison || null,
    answer,
  };
  results.push(result);
  console.log(`${String(number).padStart(2, "0")}/20  ${result.automatedPass ? "ĐẠT" : "CHƯA ĐẠT"}  HTTP ${httpStatus || "ERR"}  ${elapsedMs} ms  ${result.wordCount} từ`);
}

const ragBeginner = results.find((item) => item.number === 17);
const ragIntermediate = results.find((item) => item.number === 18);
const ragAdvanced = results.find((item) => item.number === 19);
const levelComparison = {
  allDifferent: new Set([ragBeginner?.answer, ragIntermediate?.answer, ragAdvanced?.answer]).size === 3,
  beginnerWords: ragBeginner?.wordCount || 0,
  intermediateWords: ragIntermediate?.wordCount || 0,
  advancedWords: ragAdvanced?.wordCount || 0,
  advancedMoreDetailed: (ragAdvanced?.wordCount || 0) > (ragBeginner?.wordCount || 0),
};

for (const item of results.filter((result) => [17, 18, 19].includes(result.number))) {
  item.automatedPass = item.automatedPass && levelComparison.allDifferent;
}

const passed = results.filter((item) => item.automatedPass).length;
const totalMs = results.reduce((sum, item) => sum + item.elapsedMs, 0);
const report = {
  generatedAt: new Date().toISOString(),
  apiUrl: API_URL,
  methodology: "Mỗi câu gọi đúng một lần; chấm tự động theo cấu trúc API và các nhóm ý bắt buộc. Cần đọc lại nội dung trước khi chốt số liệu CP3.",
  summary: {
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate: Number(((passed / results.length) * 100).toFixed(1)),
    averageLatencyMs: Math.round(totalMs / results.length),
  },
  levelComparison,
  results,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}-results.json`), JSON.stringify(report, null, 2), "utf8");

const markdown = [
  "# Kết quả kiểm thử CP3",
  "",
  `- Thời điểm chạy: ${report.generatedAt}`,
  `- Tổng số: ${report.summary.total}`,
  `- Đạt tự động: ${report.summary.passed}`,
  `- Chưa đạt tự động: ${report.summary.failed}`,
  `- Tỷ lệ đạt tự động: ${report.summary.passRate}%`,
  `- Độ trễ trung bình: ${report.summary.averageLatencyMs} ms`,
  "- Nguyên tắc: mỗi câu gọi đúng một lần, không chạy lại để chọn kết quả.",
  "",
  "| STT | Mức độ | Kết quả tự động | Độ trễ | Số từ | Câu hỏi |",
  "|---:|---|---|---:|---:|---|",
  ...results.map((item) => `| ${item.number} | ${item.level} | ${item.automatedPass ? "Đạt" : "Chưa đạt"} | ${item.elapsedMs} ms | ${item.wordCount} | ${item.question.replaceAll("|", "\\|")} |`),
  "",
  "## Đối chiếu ba mức độ cho cùng câu RAG",
  "",
  `- Ba câu trả lời khác nhau: ${levelComparison.allDifferent ? "Có" : "Không"}`,
  `- Số từ: Mới làm quen ${levelComparison.beginnerWords}; Đã có nền tảng ${levelComparison.intermediateWords}; Muốn đào sâu ${levelComparison.advancedWords}.`,
  "",
  "> Kết quả trên là vòng lọc tự động. Cần đọc nội dung trong tệp JSON và chốt đánh giá thủ công trước khi dùng làm số liệu nộp CP3.",
  "",
].join("\n");
fs.writeFileSync(path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}-summary.md`), markdown, "utf8");

console.log(`\nTỔNG: ${passed}/20 đạt tự động (${report.summary.passRate}%), trung bình ${report.summary.averageLatencyMs} ms.`);
