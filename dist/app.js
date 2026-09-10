const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = { step: 1, topic: "", lang: "uk" };
const form = $("#caseForm");
const story = $("#story");
const nextButton = $("#nextButton");
const backButton = $("#backButton");
const restartButton = $("#restartButton");

const translations = {
  uk: {},
  en: {
    verified: "Verified public contacts", yourRoute: "Your route", step1: "Situation", step1s: "What happened", step2: "Context", step2s: "What matters", step3: "Evidence", step3s: "What you already have", step4: "Action plan", step4s: "Where and how to apply",
    privacyTitle: "Private by design", privacyText: "This demo does not send or store your input.", startHere: "Start here", situationTitle: "Tell us what happened", situationHint: "Use your own words. Names, addresses, and document numbers are not needed.", storyLabel: "Your situation", storyPlaceholder: "For example: I left an occupied area, my landlord will not return the deposit, and there is no written lease…", storyError: "Add a short description — at least 20 characters.", topicLabel: "Or choose a topic to get started", housing: "Housing & rent", documents: "Documents", payments: "Payments & IDP status", work: "Work & wages", safety: "Safety & violence", other: "Another issue",
    contextEyebrow: "Only what matters", contextTitle: "Add context", contextHint: "These answers help us identify urgency and the right support channel.", region: "Where you are now", chooseRegion: "Choose a region", deadline: "Nearest deadline", noDeadline: "Unknown / none", today: "Today", week: "Within 7 days", month: "Within a month", applies: "What applies to you?", idp: "I am internally displaced", idpS: "I have or am applying for IDP status", veteran: "Veteran / service member", veteranS: "Or a family member", disability: "Person with a disability", disabilityS: "Accessible communication needed", danger: "There is a threat to life, health, or safety", dangerS: "Emergency contacts will appear first",
    evidenceEyebrow: "No extra bureaucracy", evidenceTitle: "What do you already have?", evidenceHint: "Check what is available. We will flag gaps without blocking your route.", identity: "Identity document", identityS: "Passport, Diia, or another document", messages: "Messages or correspondence", messagesS: "Screenshots, email, messengers", contract: "Contract, decision, or certificate", contractS: "A photo or digital copy is enough", paymentProof: "Proof of payment", paymentProofS: "Receipt or bank statement", noDocsTitle: "No documents?", noDocsText: "Continue anyway. Your account is a starting point, and a lawyer can help identify the next step.",
    urgentTitle: "Immediate danger?", urgentText: "Call 102 or 112. Do not wait for online advice.", routeReady: "Your route is ready", planTitle: "Your next steps", officialContact: "Official contact", bpd: "Free Legal Aid", freeCall: "Free within Ukraine", findOffice: "Find the nearest legal aid office", draftTitle: "Draft request", draftHint: "Copy it and add your name and contact details only before sending.", copy: "Copy", disclaimer: "CaseBridge UA helps you navigate options but does not replace a lawyer or provide legal conclusions.", back: "Back", buildRoute: "Build my route", restart: "New request", source: "Official contact source"
  }
};

const topicSamples = {
  uk: {
    housing: "Орендодавець не повертає заставу за житло, письмового договору немає.",
    documents: "Я втратив документи під час евакуації та не знаю, як їх відновити.",
    payments: "Мені припинили виплати ВПО, але я не отримав пояснення причини.",
    work: "Роботодавець не виплатив зарплату після звільнення.",
    safety: "Я зіткнулася з погрозами та не почуваюся в безпеці.",
    other: "Мені потрібна допомога, щоб зрозуміти, куди звернутися з моєю правовою ситуацією."
  },
  en: {
    housing: "My landlord will not return my housing deposit, and there is no written lease.",
    documents: "I lost my documents during evacuation and do not know how to restore them.",
    payments: "My IDP payments stopped, but I was not told why.",
    work: "My employer did not pay my wages after dismissal.",
    safety: "I have received threats and do not feel safe.",
    other: "I need help understanding where to take my legal issue."
  }
};

const routeCopy = {
  uk: {
    defaultTitle: "Почніть із безоплатної правничої допомоги",
    summary: "Ваш опис готовий для першої консультації. Нижче — короткий маршрут без юридичних припущень.",
    urgent: "Негайно подбайте про безпеку",
    urgentSummary: "Через позначену загрозу екстрений контакт має бути першим кроком. Правове звернення можна підготувати після цього.",
    recommended: "Рекомендовано",
    urgentBadge: "Терміново",
    actions: ["Зателефонуйте до системи безоплатної правничої допомоги: 0 800 213 103.", "Коротко опишіть подію, місце та найближчий відомий строк.", "Підготуйте наявні документи та листування; відсутність частини доказів не відкладає першу консультацію.", "Попросіть зафіксувати звернення та пояснити, який орган або бюро супроводжуватиме наступний крок."],
    urgentActions: ["Якщо небезпека триває — телефонуйте 102 або 112 та перейдіть у безпечне місце.", "Повідомте довірену людину, де ви перебуваєте, якщо це безпечно.", "Після усунення негайної загрози зверніться по безоплатну правничу допомогу: 0 800 213 103.", "Збережіть повідомлення, фото й інші матеріали лише якщо це не створює додаткового ризику."],
    draftHead: "Тема: Запит на первинну правничу допомогу",
    draftIntro: "Добрий день! Прошу допомогти визначити порядок дій у такій ситуації:",
    draftContext: "Додатковий контекст:", draftEvidence: "Наявні матеріали:", draftEnd: "Прошу повідомити, куди мені звернутися, які документи підготувати та чи є строки, яких потрібно дотриматися."
  },
  en: {
    defaultTitle: "Start with Ukraine’s Free Legal Aid system",
    summary: "Your description is ready for an initial consultation. Here is a short route without speculative legal advice.",
    urgent: "Put immediate safety first", urgentSummary: "Because you flagged a threat, emergency support comes first. The legal request can follow once you are safe.", recommended: "Recommended", urgentBadge: "Urgent",
    actions: ["Call Ukraine’s Free Legal Aid system: 0 800 213 103.", "Briefly describe the event, location, and nearest known deadline.", "Prepare any documents and messages you have; missing evidence should not delay the first consultation.", "Ask for your request to be recorded and which authority or office should guide the next step."],
    urgentActions: ["If danger is ongoing, call 102 or 112 and move to a safe place.", "Tell a trusted person where you are, if it is safe to do so.", "Once immediate danger has passed, call Free Legal Aid: 0 800 213 103.", "Keep messages, photos, and other material only if doing so does not increase risk."],
    draftHead: "Subject: Request for initial legal assistance", draftIntro: "Hello. Please help me identify the right next steps for this situation:", draftContext: "Additional context:", draftEvidence: "Available materials:", draftEnd: "Please tell me where to apply, which documents to prepare, and whether any deadlines may apply."
  }
};

function applyLanguage() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[state.lang][key]) el.textContent = translations[state.lang][key];
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[state.lang][key]) el.placeholder = translations[state.lang][key];
  });
  $("#langSwitch").innerHTML = state.lang === "uk" ? "<b>UA</b><span>EN</span>" : "<span>UA</span><b>EN</b>";
  updateProgress();
  if (state.step === 4) buildResult();
}

function updateProgress() {
  $("#progressLabel").textContent = state.lang === "uk" ? `Крок ${state.step} із 4` : `Step ${state.step} of 4`;
  $$('[data-step-nav]').forEach(item => {
    const n = Number(item.dataset.stepNav);
    item.classList.toggle("active", n === state.step);
    item.classList.toggle("done", n < state.step);
  });
}

function showStep(step) {
  state.step = Math.min(4, Math.max(1, step));
  $$('[data-step]').forEach(el => el.classList.toggle("active", Number(el.dataset.step) === state.step));
  backButton.hidden = state.step === 1 || state.step === 4;
  nextButton.hidden = state.step === 4;
  restartButton.hidden = state.step !== 4;
  $("#emergencyBanner").hidden = !(state.step >= 2 && $("#danger").checked);
  const labels = state.lang === "uk" ? ["Далі: контекст", "Далі: докази", "Побудувати маршрут"] : ["Next: context", "Next: evidence", "Build my route"];
  $("[data-i18n='buildRoute']").textContent = labels[Math.min(state.step - 1, 2)];
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep() {
  if (state.step === 1 && story.value.trim().length < 20) {
    story.classList.add("invalid");
    $("#storyError").hidden = false;
    story.focus();
    return false;
  }
  return true;
}

function selectedValues(name) { return $$(`input[name="${name}"]:checked`).map(el => el.value); }

function buildResult() {
  const copy = routeCopy[state.lang];
  const isUrgent = $("#danger").checked;
  $("#resultTitle").textContent = isUrgent ? copy.urgent : copy.defaultTitle;
  $("#resultSummary").textContent = isUrgent ? copy.urgentSummary : copy.summary;
  $("#urgencyBadge").textContent = isUrgent ? copy.urgentBadge : copy.recommended;
  $("#actionList").innerHTML = (isUrgent ? copy.urgentActions : copy.actions).map(item => `<li>${escapeHtml(item)}</li>`).join("");

  const statuses = selectedValues("status");
  const evidence = selectedValues("evidence");
  const region = $("#region").value || (state.lang === "uk" ? "не вказано" : "not specified");
  const deadline = $("#deadline").selectedOptions[0].textContent;
  const statusText = statuses.length ? statuses.join(", ") : (state.lang === "uk" ? "не вказано" : "not specified");
  const evidenceText = evidence.length ? evidence.join(", ") : (state.lang === "uk" ? "поки немає" : "none yet");
  const draft = `${copy.draftHead}\n\n${copy.draftIntro}\n${story.value.trim()}\n\n${copy.draftContext}\n— ${state.lang === "uk" ? "Місце" : "Location"}: ${region}\n— ${state.lang === "uk" ? "Строк" : "Deadline"}: ${deadline}\n— ${state.lang === "uk" ? "Статус" : "Status"}: ${statusText}\n\n${copy.draftEvidence} ${evidenceText}.\n\n${copy.draftEnd}`;
  $("#draftText").textContent = draft;
}

function escapeHtml(value) { const el = document.createElement("div"); el.textContent = value; return el.innerHTML; }

story.addEventListener("input", () => {
  $("#charCount").textContent = `${story.value.length} / 1200`;
  if (story.value.trim().length >= 20) { story.classList.remove("invalid"); $("#storyError").hidden = true; }
});

$$('.topic-chip').forEach(button => button.addEventListener("click", () => {
  state.topic = button.dataset.topic;
  $$('.topic-chip').forEach(el => el.classList.toggle("selected", el === button));
  story.value = topicSamples[state.lang][state.topic];
  story.dispatchEvent(new Event("input"));
  story.focus();
}));

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateStep()) return;
  if (state.step < 3) showStep(state.step + 1);
  else { buildResult(); showStep(4); }
});

backButton.addEventListener("click", () => showStep(state.step - 1));
$("#danger").addEventListener("change", () => { $("#emergencyBanner").hidden = !$("#danger").checked; });
$("#langSwitch").addEventListener("click", () => { state.lang = state.lang === "uk" ? "en" : "uk"; applyLanguage(); });
restartButton.addEventListener("click", () => {
  form.reset(); state.topic = ""; story.value = ""; story.dispatchEvent(new Event("input")); $$('.topic-chip').forEach(el => el.classList.remove("selected")); showStep(1);
});
$("#copyDraft").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#draftText").textContent); showToast(state.lang === "uk" ? "Чернетку скопійовано" : "Draft copied"); }
  catch { showToast(state.lang === "uk" ? "Виділіть текст і скопіюйте вручну" : "Select and copy the text manually"); }
});

function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2200); }

applyLanguage();
showStep(1);

// WebMCP: expose the same primary route-building journey to supporting agents.
function registerModelTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tool = {
    name: "stage_legal_support_route",
    title: "Stage a CaseBridge support route",
    description: "Fill the CaseBridge UA intake with a plain-language situation and show the resulting first-action route. This does not send or store the request.",
    inputSchema: {
      type: "object",
      properties: {
        situation: { type: "string", minLength: 20, maxLength: 1200 },
        topic: { type: "string", enum: ["housing", "documents", "payments", "work", "safety", "other"] },
        danger: { type: "boolean" },
        region: { type: "string", maxLength: 80 }
      },
      required: ["situation"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input) {
      if (!input || typeof input.situation !== "string" || input.situation.trim().length < 20 || input.situation.length > 1200) {
        throw new Error("situation must contain 20–1200 characters");
      }
      story.value = input.situation.trim();
      state.topic = input.topic || "other";
      $("#danger").checked = Boolean(input.danger);
      if (input.region) {
        const option = $$("#region option").find(item => item.textContent === input.region);
        if (option) $("#region").value = option.value;
      }
      story.dispatchEvent(new Event("input"));
      buildResult();
      showStep(4);
      return { status: "staged", urgent: Boolean(input.danger), officialContact: "0 800 213 103" };
    }
  };
  try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch {}
}

registerModelTools();
