const levels = {
  beginner: {
    label: "Mới làm quen",
    description: "Giải thích từ cơ bản, định nghĩa thuật ngữ và ưu tiên ví dụ dễ hình dung."
  },
  intermediate: {
    label: "Đã có nền tảng",
    description: "Đi thẳng vào ý chính, dùng thuật ngữ phổ biến và làm rõ phần khó."
  },
  advanced: {
    label: "Muốn đào sâu",
    description: "Phân tích kỹ cơ chế, mối quan hệ và các đánh đổi quan trọng."
  }
};

const levelTrigger = document.querySelector("#levelTrigger");
const levelMenu = document.querySelector("#levelMenu");
const selectedLevelLabel = document.querySelector("#selectedLevelLabel");
const levelOptions = [...document.querySelectorAll(".level-option")];
const questionForm = document.querySelector("#questionForm");
const questionInput = document.querySelector("#questionInput");
const sendButton = document.querySelector("#sendButton");
const welcomeState = document.querySelector("#welcomeState");
const chatThread = document.querySelector("#chatThread");
const conversation = document.querySelector("#conversation");
const toast = document.querySelector("#toast");
const corpusStatus = document.querySelector("#corpusStatus");
const corpusStatusLabel = document.querySelector("#corpusStatusLabel");
const corpusCount = document.querySelector("#corpusCount");
const learningApp = document.querySelector("#learningApp");
const settingsOverlay = document.querySelector("#settingsOverlay");
const providerTypeInputs = [...document.querySelectorAll('input[name="providerType"]')];
const customFields = document.querySelector("#customFields");
const baseUrlInput = document.querySelector("#baseUrlInput");
const apiKeyInput = document.querySelector("#apiKeyInput");
const modelInput = document.querySelector("#modelInput");

let selectedLevel = "intermediate";
let toastTimer;
let activeRequest = null;
let apiBase = null;

const SETTINGS_STORAGE_KEY = "vlearn-model-settings";
let modelSettings = loadSettings();

const LOCAL_API_BASE = "http://localhost:8090";

const mathJaxReady = new Promise((resolve) => {
  if (typeof window.MathJax?.typesetPromise === "function") {
    resolve();
    return;
  }
  window.addEventListener("mathjax-ready", resolve, { once: true });
});

function clearTypesetMath(element) {
  if (element && typeof window.MathJax?.typesetClear === "function") {
    window.MathJax.typesetClear([element]);
  }
}

function typesetMath(element) {
  if (!element) return Promise.resolve();
  return mathJaxReady
    .then(() => window.MathJax.typesetPromise([element]))
    .catch((error) => console.warn("Không thể hiển thị công thức toán học:", error));
}

function apiCandidates() {
  const candidates = [];
  if (apiBase !== null) candidates.push(apiBase);
  if (window.location.protocol === "http:" || window.location.protocol === "https:") candidates.push("");
  candidates.push(LOCAL_API_BASE);
  return [...new Set(candidates)];
}

async function fetchApiJson(path, options = {}) {
  let lastError;

  for (const base of apiCandidates()) {
    try {
      const response = await fetch(`${base}${path}`, options);
      const contentType = response.headers.get("content-type") || "";
      const body = await response.text();

      if (!contentType.includes("application/json")) {
        lastError = new Error("Địa chỉ hiện tại không phải VLearn API.");
        continue;
      }

      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        lastError = new Error("VLearn API trả về dữ liệu không hợp lệ.");
        continue;
      }

      apiBase = base;
      if (!response.ok) {
        const apiError = new Error(payload.error || "Không thể tạo câu trả lời.");
        apiError.isApiResponse = true;
        throw apiError;
      }
      return payload;
    } catch (error) {
      if (error.name === "AbortError" || error.isApiResponse) throw error;
      lastError = error;
    }
  }

  const connectionError = new Error("Backend dữ liệu chưa chạy trên localhost:8090.");
  connectionError.cause = lastError;
  throw connectionError;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeExternalUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code class=\"inline-code\">$1</code>");
}

function renderMarkdown(value) {
  const lines = String(value || "").replace(/\r/g, "").split("\n");
  const chunks = [];
  let listType = null;
  let codeLanguage = "";
  let codeLines = null;
  let mathLines = null;
  let mathClose = "";

  function closeList() {
    if (!listType) return;
    chunks.push(`</${listType}>`);
    listType = null;
  }

  function tableCells(line) {
    return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  }

  function isTableDivider(line) {
    const cells = tableCells(line);
    return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  }

  function pushMathBlock(linesToRender, closingDelimiter = "") {
    let mathText = linesToRender.join("\n").trim();
    if (closingDelimiter && !mathText.endsWith(closingDelimiter)) {
      mathText = `${mathText}\n${closingDelimiter}`;
    }
    chunks.push(`<div class="math-block">${escapeHtml(mathText)}</div>`);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (mathLines) {
      mathLines.push(line);
      if (line.trim().endsWith(mathClose)) {
        pushMathBlock(mathLines);
        mathLines = null;
        mathClose = "";
      }
      continue;
    }

    if (codeLines) {
      if (/^```\s*$/.test(line)) {
        chunks.push(`<pre><code${codeLanguage ? ` data-language="${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
        codeLanguage = "";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const trimmedLine = line.trim();
    const displayMathOpen = trimmedLine.startsWith("\\[")
      ? { open: "\\[", close: "\\]" }
      : trimmedLine.startsWith("$$")
        ? { open: "$$", close: "$$" }
        : null;

    if (displayMathOpen) {
      closeList();
      const contentAfterOpen = trimmedLine.slice(displayMathOpen.open.length);
      if (contentAfterOpen.includes(displayMathOpen.close)) {
        pushMathBlock([line]);
      } else {
        mathLines = [line];
        mathClose = displayMathOpen.close;
      }
      continue;
    }

    const fence = line.match(/^```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      closeList();
      codeLanguage = fence[1] || "text";
      codeLines = [];
      continue;
    }

    if (line.includes("|") && isTableDivider(lines[index + 1] || "")) {
      closeList();
      const headers = tableCells(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;
      chunks.push(`
        <div class="answer-table-wrap"><table>
          <thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>
          <tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${renderInlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
      `);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      closeList();
      const headingLevel = Math.min(heading[1].length + 1, 4);
      chunks.push(`<h${headingLevel}>${renderInlineMarkdown(heading[2])}</h${headingLevel}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)/);

    if (unordered || ordered) {
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        chunks.push(`<${listType}>`);
      }
      chunks.push(`<li>${renderInlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }

    closeList();
    if (!line.trim()) continue;
    chunks.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeList();
  if (codeLines) {
    chunks.push(`<pre><code${codeLanguage ? ` data-language="${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  if (mathLines) pushMathBlock(mathLines, mathClose);
  return chunks.join("");
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function confidenceMeta(value, status) {
  const percentage = Math.round((Number(value) || 0) * 100);
  if (status === "insufficient" || percentage < 30) {
    return { label: "Chưa đủ căn cứ", className: "confidence-low", percentage };
  }
  if (status === "low-confidence" || percentage < 60) {
    return { label: "Cần đối chiếu", className: "confidence-medium", percentage };
  }
  return { label: "Có căn cứ", className: "confidence-high", percentage };
}

function comparisonMeta(comparison) {
  if (!comparison?.checked) return null;
  const percentage = Math.round((Number(comparison.similarity) || 0) * 100);
  if (comparison.matchType === "exact") {
    return { label: "Trùng dữ liệu", className: "comparison-exact", percentage };
  }
  if (comparison.matchType === "similar") {
    return { label: "Nội dung tương tự", className: "comparison-similar", percentage };
  }
  return { label: "Nội dung mới", className: "comparison-none", percentage: null };
}

function toggleLevelMenu(forceState) {
  const shouldOpen = typeof forceState === "boolean" ? forceState : levelMenu.hidden;
  levelMenu.hidden = !shouldOpen;
  levelTrigger.setAttribute("aria-expanded", String(shouldOpen));
}

function showToast(message, type = "default") {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function chooseLevel(levelKey, announce = true) {
  const level = levels[levelKey];
  if (!level) return;

  selectedLevel = levelKey;
  selectedLevelLabel.textContent = level.label;

  levelOptions.forEach((option) => {
    const isSelected = option.dataset.level === levelKey;
    option.classList.toggle("selected", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
  });

  toggleLevelMenu(false);
  if (announce) showToast(`Đã chọn: ${level.label}`);
  questionInput.focus();
}

function resizeInput() {
  questionInput.style.height = "auto";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 120)}px`;
  sendButton.disabled = !questionInput.value.trim() || questionForm.classList.contains("is-loading");
}

function setTutorOpen(isOpen) {
  learningApp.classList.toggle("tutor-hidden", !isOpen);
  document.querySelectorAll('[data-action="open-tutor"]').forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
  if (!isOpen) toggleLevelMenu(false);
  if (isOpen) window.setTimeout(() => questionInput.focus(), 260);
}

function assistantHeading(levelKey, response) {
  const comparison = response ? comparisonMeta(response.comparison) : null;
  const aiUsed = response?.ai?.used === true;
  const providerIsCustom = response?.ai?.provider === "custom";
  const providerModel = response?.ai?.model || "";
  const qualityPassed = response?.ai?.quality?.passed === true;
  const qualityChecked = response?.ai?.quality?.checked === true;
  const qualityScore = Number(response?.ai?.quality?.score);
  const qualityTitle = `Đã qua kiểm định độc lập${Number.isFinite(qualityScore) ? ` · ${qualityScore}/100` : ""}${response?.ai?.quality?.repaired ? " · Đã tự sửa" : ""}`;
  const warningDetails = [
    ...(response?.ai?.quality?.reviewIssues || []),
    ...(response?.ai?.quality?.groundingPassed === false ? ["Chưa có nguồn web để kiểm chứng"] : [])
  ].filter(Boolean).join("; ") || "Câu trả lời chưa vượt qua toàn bộ bước kiểm định";
  return `
    <div class="assistant-heading">
      <span class="assistant-mark" aria-hidden="true">
        <span class="spark spark-small"></span>
        <span class="spark spark-large"></span>
      </span>
      <span>Trợ giảng AI</span>
      <span class="answer-level">${escapeHtml(levels[levelKey].label)}</span>
      ${aiUsed && !providerIsCustom ? `<span class="provider-badge" title="Câu trả lời được tạo trực tiếp bởi Gemini API">Gemini API</span>` : ""}
      ${aiUsed && providerIsCustom ? `<span class="provider-badge" title="Câu trả lời được tạo bởi endpoint tuỳ chỉnh">Endpoint tuỳ chỉnh${providerModel ? ` · ${escapeHtml(providerModel)}` : ""}</span>` : ""}
      ${qualityPassed ? `<span class="quality-badge" title="${escapeHtml(qualityTitle)}">Đã kiểm tra</span>` : ""}
      ${qualityChecked && !qualityPassed ? `<span class="quality-warning-badge" title="${escapeHtml(warningDetails)}">Cần kiểm tra</span>` : ""}
      ${comparison ? `
        <span class="confidence-badge ${comparison.className}" title="Kết quả đối chiếu câu hỏi với tutor_turns.csv">
          <span></span>${comparison.label}${comparison.percentage === null ? "" : ` · ${comparison.percentage}%`}
        </span>
      ` : ""}
    </div>
  `;
}

function loadingMarkup(levelKey) {
  const providerLabel = activeProviderLabel();
  return `
    ${assistantHeading(levelKey)}
    <div class="answer-card loading-card" aria-label="Đang gọi ${providerLabel}">
      <div class="search-animation" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div>
        <strong>${providerLabel} đang soạn câu trả lời…</strong>
        <p>CSV được đối chiếu song song để phát hiện nội dung trùng.</p>
      </div>
    </div>
  `;
}

function comparisonMatchMarkup(match, index) {
  const sourceTitle = match.lectureTitle || match.lectureCode || "Bản ghi VLearn";
  return `
    <details class="source-item" ${index === 0 ? "open" : ""}>
      <summary>
        <span class="source-index">${index + 1}</span>
        <span class="source-summary">
          <strong>${escapeHtml(sourceTitle)}</strong>
          <small>${escapeHtml(match.turnId || "Bản ghi đối chiếu")}${match.exact ? " · Trùng chính xác" : " · Tương tự"}</small>
        </span>
        <span class="source-score">${match.relevance}%</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
      </summary>
      <div class="source-body">
        <p><span>Câu hỏi đã có</span>${escapeHtml(match.originalQuestion)}</p>
        ${match.courseId ? `<p><span>Khóa học</span>${escapeHtml(match.courseId)}</p>` : ""}
      </div>
    </details>
  `;
}

function webSourcesMarkup(response) {
  const sources = Array.isArray(response?.ai?.grounding?.sources)
    ? response.ai.grounding.sources.filter((source) => safeExternalUrl(source?.url)).slice(0, 6)
    : [];
  if (!sources.length) return "";
  return `
    <div class="web-sources" aria-label="Nguồn web dùng để kiểm chứng">
      <div class="web-sources-title">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.2-2.4 3.3-5.4 3.3-9S14.2 5.4 12 3m0 18c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3M3.4 9h17.2M3.4 15h17.2" /></svg>
        Nguồn web đã dùng
      </div>
      <div class="web-source-links">
        ${sources.map((source, index) => `<a href="${escapeHtml(safeExternalUrl(source.url))}" target="_blank" rel="noopener noreferrer"><span>${index + 1}</span>${escapeHtml(source.title || "Nguồn web")}</a>`).join("")}
      </div>
    </div>
  `;
}

function levelActionsMarkup(levelKey) {
  const actionsByLevel = {
    beginner: [
      {
        target: "intermediate",
        label: "Nâng lên mức nền tảng",
        icon: '<path d="M5 18v-4M12 18V9M19 18V5" />'
      },
      {
        target: "advanced",
        label: "Đào sâu hơn",
        icon: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />'
      }
    ],
    intermediate: [
      {
        target: "beginner",
        label: "Giải thích dễ hơn",
        icon: '<path d="M12 20v-9M8 14c-2.6 0-4-1.5-4-4 2.8 0 5 .4 6.4 2.8M16 10c2.6 0 4-1.5 4-4-3.2 0-5.6.6-7 3.5" />'
      },
      {
        target: "advanced",
        label: "Đào sâu hơn",
        icon: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />'
      }
    ],
    advanced: [
      {
        target: "intermediate",
        label: "Về mức nền tảng",
        icon: '<path d="M5 18v-4M12 18V9M19 18V5" />'
      },
      {
        target: "beginner",
        label: "Giải thích từ đầu",
        icon: '<path d="M12 20v-9M8 14c-2.6 0-4-1.5-4-4 2.8 0 5 .4 6.4 2.8M16 10c2.6 0 4-1.5 4-4-3.2 0-5.6.6-7 3.5" />'
      }
    ]
  };

  return actionsByLevel[levelKey].map((action) => `
    <button type="button" data-adjust="${action.target}" title="Chuyển sang ${escapeHtml(levels[action.target].label)}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${action.icon}</svg>
      ${escapeHtml(action.label)}
    </button>
  `).join("");
}

function lessonContextMarkup() {
  const lesson = window.VlearnLessonContext?.DEMO_LESSON;
  const label = lesson?.sourceLabel;
  if (!label) return "";
  return `
    <div class="lesson-source-scope" aria-label="Phạm vi nguồn của câu trả lời">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.2c0 4.6 3.1 8.1 7.5 9.8 4.4-1.7 7.5-5.2 7.5-9.8V6z" /></svg>
      <span>Nguồn: ${escapeHtml(label)}</span>
    </div>
  `;
}

function answerMarkup(response, levelKey) {
  const matches = Array.isArray(response.comparison?.matches) ? response.comparison.matches : [];
  const hasMatches = matches.length > 0;
  const comparisonMatches = hasMatches ? matches.map(comparisonMatchMarkup).join("") : "";
  const comparisonLabel = response.comparison?.matchType === "exact"
    ? "Đã phát hiện câu hỏi trùng trong CSV"
    : response.comparison?.matchType === "similar"
      ? "Đã phát hiện nội dung tương tự trong CSV"
      : "Không phát hiện câu hỏi trùng trong CSV";

  return `
    ${assistantHeading(levelKey, response)}
    <div class="answer-card">
      <div class="answer-content">${renderMarkdown(response.answer)}</div>
      ${lessonContextMarkup()}
      ${webSourcesMarkup(response)}
      ${response.comparison?.checked ? `
        <div class="grounding-row">
          <span class="grounding-label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.2c0 4.6 3.1 8.1 7.5 9.8 4.4-1.7 7.5-5.2 7.5-9.8V6zM8.5 12l2.2 2.2 4.8-5" /></svg>
            ${comparisonLabel}
          </span>
          ${hasMatches ? `
            <button class="sources-toggle" type="button" data-action="toggle-sources">
              ${matches.length} kết quả
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
            </button>
          ` : ""}
        </div>
        ${hasMatches ? `
          <div class="sources-panel" hidden>
            <div class="sources-heading">
              <div>
                <strong>Kết quả đối chiếu</strong>
                <span>CSV chỉ dùng kiểm tra trùng, không dùng để tạo câu trả lời</span>
              </div>
            </div>
            ${comparisonMatches}
          </div>
        ` : ""}
      ` : ""}
    </div>
    <div class="answer-actions">
      ${levelActionsMarkup(levelKey)}
      <button type="button" data-action="copy-answer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
        Sao chép
      </button>
    </div>
  `;
}

function addUserMessage(question) {
  welcomeState.hidden = true;
  chatThread.hidden = false;

  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.innerHTML = `
    <span class="user-label">Bạn</span>
    <p>${escapeHtml(question)}</p>
  `;
  chatThread.appendChild(userMessage);
}

async function requestAnswer(question, levelKey, { showUser = true, replaceTarget = null } = {}) {
  if (activeRequest) activeRequest.abort();
  const requestController = new AbortController();
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  activeRequest = requestController;

  if (showUser) addUserMessage(question);

  const assistantMessage = replaceTarget || document.createElement("div");
  clearTypesetMath(assistantMessage);
  assistantMessage.className = "message assistant is-refreshing";
  assistantMessage.dataset.question = question;
  assistantMessage.dataset.requestId = requestId;
  delete assistantMessage.dataset.answer;
  assistantMessage.innerHTML = loadingMarkup(levelKey);
  if (!replaceTarget) chatThread.appendChild(assistantMessage);

  questionForm.classList.add("is-loading");
  resizeInput();
  conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });

  try {
    const payload = await fetchApiJson("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildAskBody(question, levelKey)),
      signal: requestController.signal
    });

    assistantMessage.dataset.answer = payload.answer;
    assistantMessage.classList.remove("is-refreshing");
    clearTypesetMath(assistantMessage);
    assistantMessage.innerHTML = answerMarkup(payload, levelKey);
    conversation.scrollTo({ top: Math.max(assistantMessage.offsetTop - 18, 0), behavior: "smooth" });
    typesetMath(assistantMessage.querySelector(".answer-content")).then(() => {
      conversation.scrollTo({ top: Math.max(assistantMessage.offsetTop - 18, 0), behavior: "smooth" });
    });
  } catch (error) {
    if (error.name === "AbortError") {
      if (!replaceTarget && assistantMessage.dataset.requestId === requestId) assistantMessage.remove();
      return;
    }
    assistantMessage.innerHTML = `
      ${assistantHeading(levelKey)}
      <div class="answer-card error-card">
        <strong>${activeProviderLabel()} chưa phản hồi</strong>
        <p>${escapeHtml(error.message)}</p>
        <p class="error-hint">${modelSettings.type === "openai" ? "Kiểm tra Base URL, API key, Model ID và bảo đảm backend đang chạy bằng <code>npm start</code>." : "Kiểm tra API key, quota và bảo đảm backend đang chạy bằng <code>npm start</code>."}</p>
      </div>
    `;
  } finally {
    if (activeRequest === requestController) {
      activeRequest = null;
      questionForm.classList.remove("is-loading");
      resizeInput();
    }
  }
}

function submitQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion || questionForm.classList.contains("is-loading")) return;

  requestAnswer(cleanQuestion, selectedLevel);
  questionInput.value = "";
  resizeInput();
}

function resetChat() {
  if (activeRequest) activeRequest.abort();
  clearTypesetMath(chatThread);
  chatThread.replaceChildren();
  chatThread.hidden = true;
  welcomeState.hidden = false;
  questionInput.value = "";
  resizeInput();
  toggleLevelMenu(false);
  questionInput.focus();
  showToast("Đã bắt đầu cuộc trò chuyện mới");
}

function defaultSettings() {
  return { type: "gemini", baseUrl: "", apiKey: "", model: "" };
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
    return { ...defaultSettings(), ...(raw && typeof raw === "object" ? raw : {}) };
  } catch {
    return defaultSettings();
  }
}

function persistSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(modelSettings));
  } catch {
    // Không ghi được localStorage thì bỏ qua.
  }
}

function activeProviderLabel() {
  return modelSettings.type === "openai" ? "Endpoint tuỳ chỉnh" : "Gemini API";
}

function applySettingsToForm() {
  const type = modelSettings.type === "openai" ? "openai" : "gemini";
  providerTypeInputs.forEach((input) => {
    input.checked = input.value === type;
  });
  customFields.hidden = type !== "openai";
  baseUrlInput.value = modelSettings.baseUrl || "";
  apiKeyInput.value = modelSettings.apiKey || "";
  modelInput.value = modelSettings.model || "";
}

function readSettingsFromForm() {
  const type = providerTypeInputs.find((input) => input.checked)?.value || "gemini";
  return {
    type,
    baseUrl: baseUrlInput.value.trim(),
    apiKey: apiKeyInput.value.trim(),
    model: modelInput.value.trim()
  };
}

function buildProviderPayload() {
  if (modelSettings.type !== "openai") return undefined;
  return {
    type: "openai",
    baseUrl: modelSettings.baseUrl || "",
    apiKey: modelSettings.apiKey || "",
    model: modelSettings.model || ""
  };
}

function buildAskBody(question, levelKey) {
  const provider = buildProviderPayload();
  const lessonApi = window.VlearnLessonContext;
  if (lessonApi && typeof lessonApi.buildAskPayload === "function") {
    return lessonApi.buildAskPayload(question, levelKey, provider);
  }
  const body = { question, level: levelKey };
  if (provider) body.provider = provider;
  return body;
}

function openSettings() {
  applySettingsToForm();
  settingsOverlay.hidden = false;
  if (modelSettings.type === "openai") window.setTimeout(() => baseUrlInput.focus(), 0);
}

function closeSettings() {
  settingsOverlay.hidden = true;
}

function saveSettings() {
  const parsed = readSettingsFromForm();
  if (parsed.type === "openai" && (!parsed.model || !parsed.apiKey)) {
    showToast("Cần nhập đủ API key và Model ID", "error");
    return;
  }
  modelSettings = parsed;
  persistSettings();
  closeSettings();
  loadCorpusStatus();
  showToast(parsed.type === "openai" ? "Đã lưu cài đặt endpoint tuỳ chỉnh" : "Đã chuyển về Gemini mặc định");
}

async function testConnectionFromForm() {
  const parsed = readSettingsFromForm();
  if (parsed.type === "openai" && (!parsed.model || !parsed.apiKey)) {
    showToast("Nhập đủ API key và Model ID trước khi kiểm tra", "error");
    return;
  }
  const button = document.querySelector('[data-action="test-connection"]');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Đang kiểm tra…";
  try {
    const provider = parsed.type === "openai"
      ? { type: "openai", baseUrl: parsed.baseUrl, apiKey: parsed.apiKey, model: parsed.model }
      : undefined;
    const payload = await fetchApiJson("/api/test-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider })
    });
    showToast(`Kết nối thành công · ${payload.model} · ${payload.latencyMs} ms`);
  } catch (error) {
    showToast(error.message || "Không kết nối được", "error");
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

async function loadCorpusStatus() {
  try {
    const payload = await fetchApiJson("/api/health", { cache: "no-store" });
    corpusStatus.classList.remove("is-offline");
    corpusStatus.classList.add("is-online");
    const geminiReady = Boolean(payload.ai?.configured);
    const localCustom = modelSettings.type === "openai" && Boolean(modelSettings.model);
    const envCustom = Boolean(payload.ai?.custom?.configured);
    if (localCustom || envCustom) {
      const model = localCustom ? modelSettings.model : payload.ai.custom.model;
      const baseUrl = localCustom
        ? (modelSettings.baseUrl || "https://api.openai.com/v1")
        : (payload.ai.custom.baseUrl || "https://api.openai.com/v1");
      corpusStatusLabel.textContent = "Endpoint tuỳ chỉnh sẵn sàng";
      corpusCount.textContent = model;
      corpusStatus.title = `${model} qua ${baseUrl} · CSV đối chiếu ${formatNumber(payload.corpus.rows)} lượt hỏi đáp`;
    } else {
      corpusStatusLabel.textContent = geminiReady ? "Gemini API sẵn sàng" : "Chưa cấu hình Gemini";
      corpusCount.textContent = geminiReady ? payload.ai.model : "Chưa gắn Gemini API";
      corpusStatus.title = geminiReady
        ? `Gemini ${payload.ai.model} · CSV đối chiếu ${formatNumber(payload.corpus.rows)} lượt hỏi đáp`
        : `Thêm API key trong file codebase/.env · CSV có ${formatNumber(payload.corpus.rows)} bản ghi đối chiếu`;
    }
  } catch {
    corpusStatus.classList.remove("is-online");
    corpusStatus.classList.add("is-offline");
    corpusStatusLabel.textContent = "Chưa kết nối dữ liệu";
    corpusCount.textContent = "Chạy npm start";
  }
}

levelTrigger.addEventListener("click", () => toggleLevelMenu());

levelOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const nextLevel = option.dataset.level;
    const levelChanged = nextLevel !== selectedLevel;
    chooseLevel(nextLevel);

    const latestAnswer = [...chatThread.querySelectorAll(".message.assistant[data-question]")].at(-1);
    if (levelChanged && latestAnswer?.dataset.question) {
      requestAnswer(latestAnswer.dataset.question, nextLevel, {
        showUser: false,
        replaceTarget: latestAnswer
      });
      showToast(`Đang chuyển sang mức: ${levels[nextLevel].label}`);
    }
  });
});

document.querySelector('[data-action="close-level"]').addEventListener("click", () => {
  toggleLevelMenu(false);
  levelTrigger.focus();
});

questionInput.addEventListener("input", resizeInput);
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitQuestion(questionInput.value);
  }
});

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuestion(questionInput.value);
});

document.addEventListener("click", (event) => {
  const questionButton = event.target.closest("button[data-question]");
  if (questionButton) {
    submitQuestion(questionButton.dataset.question);
    return;
  }

  const adjustButton = event.target.closest("[data-adjust]");
  if (adjustButton) {
    const assistantMessage = adjustButton.closest(".message.assistant");
    const question = assistantMessage?.dataset.question;
    if (!question) return;
    const nextLevel = adjustButton.dataset.adjust;
    chooseLevel(nextLevel, false);
    requestAnswer(question, nextLevel, { showUser: false, replaceTarget: assistantMessage });
    showToast(`Đang tạo lại ở mức: ${levels[nextLevel].label}`);
    return;
  }

  const sourceToggle = event.target.closest('[data-action="toggle-sources"]');
  if (sourceToggle) {
    const panel = sourceToggle.closest(".answer-card").querySelector(".sources-panel");
    panel.hidden = !panel.hidden;
    sourceToggle.classList.toggle("is-open", !panel.hidden);
    return;
  }

  const copyButton = event.target.closest('[data-action="copy-answer"]');
  if (copyButton) {
    const assistantMessage = copyButton.closest(".message.assistant");
    const text = assistantMessage?.dataset.answer;
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => showToast("Đã sao chép câu trả lời"))
      .catch(() => showToast("Không thể sao chép", "error"));
    return;
  }

  if (!levelMenu.hidden && !event.target.closest(".level-area")) toggleLevelMenu(false);
});

document.querySelector('[data-action="new-chat"]').addEventListener("click", resetChat);

document.querySelectorAll('[data-action="open-tutor"]').forEach((button) => {
  button.addEventListener("click", () => setTutorOpen(true));
});

document.querySelectorAll('[data-action="close-tutor"]').forEach((button) => {
  button.addEventListener("click", () => setTutorOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !levelMenu.hidden) {
    toggleLevelMenu(false);
    levelTrigger.focus();
  }
});

document.querySelectorAll('[data-action="open-settings"]').forEach((button) => {
  button.addEventListener("click", openSettings);
});
document.querySelectorAll('[data-action="close-settings"]').forEach((button) => {
  button.addEventListener("click", closeSettings);
});
document.querySelector('[data-action="save-settings"]').addEventListener("click", saveSettings);
document.querySelector('[data-action="test-connection"]').addEventListener("click", testConnectionFromForm);

providerTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    customFields.hidden = input.value !== "openai";
    if (!customFields.hidden) window.setTimeout(() => baseUrlInput.focus(), 0);
  });
});

settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsOverlay.hidden) closeSettings();
});

resizeInput();
loadCorpusStatus();

const sharedView = new URLSearchParams(window.location.search);
const sharedQuestion = sharedView.get("q")?.trim();
const sharedLevel = sharedView.get("level");
if (sharedQuestion) {
  if (levels[sharedLevel]) chooseLevel(sharedLevel, false);
  window.setTimeout(() => submitQuestion(sharedQuestion), 120);
}
