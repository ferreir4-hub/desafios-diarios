const today = new Date();
const stateKey = "desafios-diarios-v5";
const previousStateKeys = ["desafios-diarios-v4", "desafios-diarios-v3", "desafios-diarios-v2", "desafios-diarios-v1"];
const todayKey = dateKey(today);

const weekDays = [
  { key: "0", name: "Domingo", short: "Dom" },
  { key: "1", name: "Segunda", short: "Seg" },
  { key: "2", name: "Terca", short: "Ter" },
  { key: "3", name: "Quarta", short: "Qua" },
  { key: "4", name: "Quinta", short: "Qui" },
  { key: "5", name: "Sexta", short: "Sex" },
  { key: "6", name: "Sabado", short: "Sab" },
];

const emptyPlan = weekDays.reduce((plan, day) => {
  plan[day.key] = "";
  return plan;
}, {});

const defaultState = {
  challenges: [
    createChallenge("Treino Diario", 30, 1),
    createChallenge("adwada", 30, 1),
    createChallenge("ola", 30, 0),
  ],
  water: {
    current: 1.5,
    goal: 1.5,
    completedDates: [todayKey],
  },
  exercises: [{ id: createId(), date: todayKey, text: "Kettlebell" }],
  trainingPlan: {
    ...emptyPlan,
    1: "Forca: peito e triceps",
    3: "Kettlebell e core",
    5: "Pernas e mobilidade",
  },
  notes: "",
  pet: {
    points: 0,
    ownedItems: [],
    flash: {
      activeId: null,
      acceptedAt: null,
      expiresAt: null,
      completedDates: {},
    },
  },
};

const suggestions = [
  "Caminhada de 20 minutos",
  "Alongamento",
  "Ler 10 paginas",
  "Meditar 5 minutos",
  "Sem acucar hoje",
  "Treino Diario",
];

const shopItems = [
  { id: "mat", name: "Tapete macio", cost: 20, icon: "\u25b0", type: "Base" },
  { id: "plant", name: "Planta calma", cost: 35, icon: "\u2663", type: "Decor" },
  { id: "ball", name: "Bola de treino", cost: 45, icon: "\u25cf", type: "Brinquedo" },
  { id: "lamp", name: "Luz quente", cost: 60, icon: "\u2726", type: "Luz" },
  { id: "window", name: "Janela solar", cost: 80, icon: "\u25a1", type: "Decor" },
  { id: "shelf", name: "Prateleira", cost: 95, icon: "\u25ad", type: "Decor" },
  { id: "cushion", name: "Almofada", cost: 110, icon: "\u25c6", type: "Conforto" },
  { id: "stars", name: "Luzes estrela", cost: 130, icon: "\u2727", type: "Luz" },
  { id: "books", name: "Livros pequenos", cost: 150, icon: "\u25a4", type: "Decor" },
  { id: "bowl", name: "Tigela premium", cost: 170, icon: "\u25e1", type: "Conforto" },
  { id: "rug", name: "Tapete grande", cost: 210, icon: "\u25ac", type: "Base" },
  { id: "tree", name: "Arvore interior", cost: 260, icon: "\u2660", type: "Decor" },
];

const flashMissions = [
  { id: "pushups", title: "Fazer 10 flexoes", description: "Completa 10 flexoes nos proximos 20 minutos.", reward: 10, minutes: 20 },
  { id: "squats", title: "20 agachamentos", description: "Faz 20 agachamentos com boa forma.", reward: 10, minutes: 20 },
  { id: "walk", title: "Caminhar 5 minutos", description: "Levanta-te e caminha durante 5 minutos.", reward: 10, minutes: 20 },
  { id: "mobility", title: "Mobilidade rapida", description: "Faz 3 minutos de ombros, pescoco e anca.", reward: 10, minutes: 20 },
  { id: "water", title: "250ml de agua", description: "Bebe 250ml de agua com calma.", reward: 10, minutes: 20 },
  { id: "plank", title: "Prancha curta", description: "Faz 30 segundos de prancha.", reward: 15, minutes: 20 },
];

let state = loadState();
let selectedExerciseDate = todayKey;
let selectedChallengeDate = todayKey;
let cloudClient = null;
let cloudUser = null;
let cloudSaveTimer = null;
let isHydratingCloudState = false;
reconcileMissedChallenges();

const els = {
  todayDate: document.querySelector("#today-date"),
  cloudForm: document.querySelector("#cloud-form"),
  cloudEmail: document.querySelector("#cloud-email"),
  cloudStatus: document.querySelector("#cloud-status"),
  cloudLogout: document.querySelector("#cloud-logout"),
  todayPlanTitle: document.querySelector("#today-plan-title"),
  todayPlanText: document.querySelector("#today-plan-text"),
  challengeList: document.querySelector("#challenge-list"),
  addChallenge: document.querySelector("#add-challenge"),
  suggestChallenge: document.querySelector("#suggest-challenge"),
  challengeForm: document.querySelector("#challenge-form"),
  challengeName: document.querySelector("#challenge-name"),
  challengeGoal: document.querySelector("#challenge-goal"),
  challengeDate: document.querySelector("#challenge-date"),
  challengeDateToday: document.querySelector("#challenge-date-today"),
  waterCurrent: document.querySelector("#water-current"),
  waterGoal: document.querySelector("#water-goal"),
  waterTarget: document.querySelector("#water-target"),
  waterProgressFill: document.querySelector("#water-progress-fill"),
  waterMinus: document.querySelector("#water-minus"),
  waterPlus: document.querySelector("#water-plus"),
  calendarMonth: document.querySelector("#calendar-month"),
  calendarGrid: document.querySelector("#calendar-grid"),
  exerciseForm: document.querySelector("#exercise-form"),
  exerciseInput: document.querySelector("#exercise-input"),
  exerciseDateFilter: document.querySelector("#exercise-date-filter"),
  exerciseToday: document.querySelector("#exercise-today"),
  exerciseList: document.querySelector("#exercise-list"),
  weeklyPlan: document.querySelector("#weekly-plan"),
  notes: document.querySelector("#notes"),
  petPoints: document.querySelector("#pet-points"),
  petMood: document.querySelector("#pet-mood"),
  petMessage: document.querySelector("#pet-message"),
  petHappinessFill: document.querySelector("#pet-happiness-fill"),
  petAvatar: document.querySelector("#pet-avatar"),
  roomItems: document.querySelector("#room-items"),
  shopGrid: document.querySelector("#shop-grid"),
  flashCard: document.querySelector("#flash-card"),
  flashTitle: document.querySelector("#flash-title"),
  flashDescription: document.querySelector("#flash-description"),
  flashReward: document.querySelector("#flash-reward"),
  flashTimer: document.querySelector("#flash-timer"),
  flashAction: document.querySelector("#flash-action"),
};

function loadState() {
  const saved = localStorage.getItem(stateKey) || previousStateKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) return structuredClone(defaultState);
  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeState(saved) {
  const base = structuredClone(defaultState);
  return {
    ...base,
    ...saved,
    water: { ...base.water, ...(saved.water || {}) },
    pet: normalizePet(saved.pet || base.pet),
    trainingPlan: { ...base.trainingPlan, ...(saved.trainingPlan || {}) },
    exercises: Array.isArray(saved.exercises) ? saved.exercises : base.exercises,
    challenges: Array.isArray(saved.challenges)
      ? saved.challenges.map((challenge) => normalizeChallenge(challenge))
      : base.challenges,
  };
}

function normalizePet(pet) {
  return {
    points: Number(pet.points || 0),
    ownedItems: Array.isArray(pet.ownedItems) ? pet.ownedItems : [],
    flash: normalizeFlash(pet.flash || {}),
  };
}

function normalizeFlash(flash) {
  return {
    activeId: flash.activeId || null,
    acceptedAt: flash.acceptedAt || null,
    expiresAt: flash.expiresAt || null,
    completedDates: flash.completedDates && typeof flash.completedDates === "object" ? flash.completedDates : {},
  };
}

function normalizeChallenge(challenge) {
  const completedDates = Array.isArray(challenge.completedDates) ? challenge.completedDates : [];
  return {
    id: challenge.id || createId(),
    title: challenge.title || "Novo desafio",
    days: Number(challenge.days || 0),
    goal: Number(challenge.goal || 30),
    lives: Number.isFinite(Number(challenge.lives)) ? Number(challenge.lives) : 3,
    createdDate: challenge.createdDate || todayKey,
    completedDates,
    missedDates: Array.isArray(challenge.missedDates) ? challenge.missedDates : [],
  };
}

function createChallenge(title, goal = 30, days = 0) {
  return {
    id: createId(),
    title,
    days,
    goal,
    lives: 3,
    createdDate: todayKey,
    completedDates: [],
    missedDates: [],
  };
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
  queueCloudSave();
}

function isSupabaseConfigured() {
  const config = window.SUPABASE_CONFIG;
  return Boolean(
    window.supabase &&
      config?.url &&
      config?.anonKey &&
      !config.url.includes("COLOCA_AQUI") &&
      !config.anonKey.includes("COLOCA_AQUI"),
  );
}

function setCloudStatus(message) {
  els.cloudStatus.textContent = message;
}

async function initCloudSync() {
  if (!isSupabaseConfigured()) {
    setCloudStatus("Cloud ainda nao configurada. Os dados estao guardados neste dispositivo.");
    return;
  }
  cloudClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  const { data } = await cloudClient.auth.getSession();
  await handleSession(data.session);
  cloudClient.auth.onAuthStateChange((_event, session) => {
    handleSession(session);
  });
}

async function handleSession(session) {
  cloudUser = session?.user || null;
  els.cloudLogout.hidden = !cloudUser;
  els.cloudForm.hidden = Boolean(cloudUser);
  if (!cloudUser) {
    setCloudStatus("Entra para sincronizar os dados online.");
    return;
  }
  setCloudStatus(`Sincronizado como ${cloudUser.email || "utilizador"}.`);
  await loadCloudState();
}

async function loadCloudState() {
  if (!cloudClient || !cloudUser) return;
  isHydratingCloudState = true;
  const { data, error } = await cloudClient
    .from("app_states")
    .select("app_state")
    .eq("user_id", cloudUser.id)
    .maybeSingle();
  if (error) {
    setCloudStatus("Nao consegui carregar a cloud. Continuo a guardar localmente.");
    isHydratingCloudState = false;
    return;
  }
  if (data?.app_state && Object.keys(data.app_state).length) {
    state = normalizeState(data.app_state);
    localStorage.setItem(stateKey, JSON.stringify(state));
    render();
    setCloudStatus(`Dados carregados da cloud para ${cloudUser.email || "a tua conta"}.`);
  } else {
    await saveCloudStateNow();
    setCloudStatus("Conta ligada. Enviei os teus dados atuais para a cloud.");
  }
  isHydratingCloudState = false;
}

function queueCloudSave() {
  if (isHydratingCloudState || !cloudClient || !cloudUser) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(saveCloudStateNow, 600);
}

async function saveCloudStateNow() {
  if (!cloudClient || !cloudUser) return;
  const { error } = await cloudClient.from("app_states").upsert({
    user_id: cloudUser.id,
    app_state: state,
  });
  if (error) {
    setCloudStatus("Guardado localmente. A sincronizacao online falhou por agora.");
    return;
  }
  setCloudStatus(`Guardado online para ${cloudUser.email || "a tua conta"}.`);
}

async function signInWithEmail(email) {
  if (!cloudClient) {
    setCloudStatus("Primeiro tens de configurar o Supabase.");
    return;
  }
  const { error } = await cloudClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.href,
    },
  });
  setCloudStatus(error ? "Nao consegui enviar o link de entrada." : "Enviei um link de entrada para o teu email.");
}

async function signOutCloud() {
  if (!cloudClient) return;
  await cloudClient.auth.signOut();
  cloudUser = null;
  els.cloudLogout.hidden = true;
  els.cloudForm.hidden = false;
  setCloudStatus("Sessao terminada. Os dados continuam guardados neste dispositivo.");
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function reconcileMissedChallenges() {
  const yesterday = addDays(parseDateKey(todayKey), -1);
  let changed = false;
  state.challenges.forEach((challenge) => {
    const start = parseDateKey(challenge.createdDate || todayKey);
    for (let day = start; day <= yesterday; day = addDays(day, 1)) {
      const key = dateKey(day);
      const completed = challenge.completedDates.includes(key);
      const alreadyPenalized = challenge.missedDates.includes(key);
      if (!completed && !alreadyPenalized && challenge.lives > 0) {
        challenge.lives = Math.max(0, challenge.lives - 1);
        challenge.missedDates.push(key);
        changed = true;
      }
    }
  });
  if (changed) saveState();
}

function displayDate(key) {
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

function formatLiters(value) {
  return Number(value).toLocaleString("pt-PT", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

function renderSummary() {
  const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
  });
  els.todayDate.textContent = capitalize(dateFormatter.format(today));
}

function renderTodayPlan() {
  const day = weekDays[today.getDay()];
  const workout = state.trainingPlan[day.key]?.trim();
  els.todayPlanTitle.textContent = day.name;
  els.todayPlanText.textContent = workout || "Sem treino planeado para hoje.";
}

function renderChallenges() {
  els.challengeList.innerHTML = "";
  els.challengeDate.value = selectedChallengeDate;
  els.challengeDate.max = todayKey;
  state.challenges.forEach((challenge) => {
    const progress = Math.min(100, (challenge.days / challenge.goal) * 100);
    const completedSelectedDay = challenge.completedDates.includes(selectedChallengeDate);
    const missedSelectedDay = challenge.missedDates.includes(selectedChallengeDate);
    const lives = Math.max(0, Math.min(3, Number(challenge.lives || 0)));
    const hearts = "\u2665 ".repeat(lives).trim() || "sem vidas";
    const canCorrectMissedDay = lives === 0 && missedSelectedDay;
    const item = document.createElement("article");
    item.className = `challenge${completedSelectedDay ? " is-done" : ""}${lives === 0 ? " is-failed" : ""}`;
    item.innerHTML = `
      <div class="challenge-top">
        <div class="challenge-title">${escapeHtml(challenge.title)}</div>
        <div class="challenge-tools">
          <span class="lives" aria-label="${lives} vidas restantes">${escapeHtml(hearts)}</span>
          <button class="check-button" data-action="complete" data-id="${challenge.id}" aria-label="Marcar desafio feito no dia selecionado" ${
            completedSelectedDay || (lives === 0 && !canCorrectMissedDay) ? "disabled" : ""
          }>${completedSelectedDay ? "\u2713" : "\u2713"}</button>
          <button class="trash" data-action="delete" data-id="${challenge.id}" aria-label="Apagar desafio">&#128465;</button>
        </div>
      </div>
      <div class="progress" aria-label="Progresso"><span style="width: ${progress}%"></span></div>
      <div class="challenge-meta">
        <span class="streak"><span class="flame">&#128293;</span> ${challenge.days} dias</span>
        <span>Objetivo: ${challenge.goal} dias</span>
      </div>
    `;
    els.challengeList.appendChild(item);
  });
}

function renderWater() {
  els.waterCurrent.textContent = formatLiters(state.water.current);
  els.waterTarget.textContent = formatLiters(state.water.goal);
  els.waterGoal.value = state.water.goal;
  els.waterProgressFill.style.width = `${Math.min(100, (state.water.current / state.water.goal) * 100)}%`;
  const doneToday = state.water.current >= state.water.goal;
  const hasToday = state.water.completedDates.includes(todayKey);
  if (doneToday && !hasToday) state.water.completedDates.push(todayKey);
  if (!doneToday && hasToday) {
    state.water.completedDates = state.water.completedDates.filter((date) => date !== todayKey);
  }
  saveState();
}

function renderCalendar() {
  const monthFormatter = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" });
  els.calendarMonth.textContent = capitalize(monthFormatter.format(today));
  els.calendarGrid.innerHTML = "";
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const offset = firstDay.getDay();
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("span");
    empty.className = "day";
    empty.setAttribute("aria-hidden", "true");
    els.calendarGrid.appendChild(empty);
  }
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const cell = document.createElement("button");
    cell.className = "day";
    cell.type = "button";
    cell.textContent = day;
    cell.setAttribute("aria-label", `${day} de ${els.calendarMonth.textContent}`);
    if (state.water.completedDates.includes(key)) {
      cell.classList.add("is-complete");
      cell.textContent = "\u2713";
    }
    if (key === todayKey) cell.classList.add("is-today");
    cell.addEventListener("click", () => toggleDate(key));
    els.calendarGrid.appendChild(cell);
  }
}

function renderExercises() {
  els.exerciseDateFilter.value = selectedExerciseDate;
  els.exerciseList.innerHTML = "";
  const entries = state.exercises.filter((entry) => entry.date === selectedExerciseDate);
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "empty-log";
    empty.textContent = `Sem exercicios registados em ${displayDate(selectedExerciseDate)}.`;
    els.exerciseList.appendChild(empty);
    return;
  }
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="log-text"><span class="log-date">${displayDate(entry.date)}:</span> ${escapeHtml(entry.text)}</span>
      <button class="trash" data-exercise="${entry.id}" aria-label="Apagar registo">&#128465;</button>
    `;
    els.exerciseList.appendChild(item);
  });
}

function renderWeeklyPlan() {
  els.weeklyPlan.innerHTML = "";
  weekDays.slice(1).concat(weekDays[0]).forEach((day) => {
    const planText = state.trainingPlan[day.key] || "";
    const summary = planText.trim() || "Sem treino planeado";
    const item = document.createElement("div");
    item.className = "plan-day";
    item.innerHTML = `
      <button class="plan-toggle" type="button" aria-expanded="false">
        <span>
          <strong>${day.name}</strong>
          <small>${escapeHtml(summary)}</small>
        </span>
        <span class="plan-chevron" aria-hidden="true">\u23c4</span>
      </button>
      <div class="plan-editor" hidden>
        <label for="plan-${day.key}">${day.name}</label>
        <textarea id="plan-${day.key}" data-plan-day="${day.key}" rows="2" placeholder="Planeia o treino deste dia">${escapeHtml(planText)}</textarea>
      </div>
    `;
    els.weeklyPlan.appendChild(item);
  });
}

function renderNotes() {
  els.notes.value = state.notes;
}

function getPetHappiness() {
  const completedToday = state.challenges.filter((challenge) => challenge.completedDates.includes(todayKey)).length;
  const challengeBonus = Math.min(45, completedToday * 15);
  const roomBonus = Math.min(25, state.pet.ownedItems.length * 5);
  return Math.min(100, 30 + challengeBonus + roomBonus);
}

function renderPet() {
  const happiness = getPetHappiness();
  els.petPoints.textContent = state.pet.points;
  els.petHappinessFill.style.width = `${happiness}%`;
  if (happiness >= 80) {
    els.petMood.textContent = "Radiante";
    els.petMessage.textContent = "O pet sente que hoje houve consistencia a serio.";
  } else if (happiness >= 55) {
    els.petMood.textContent = "Contente";
    els.petMessage.textContent = "O pet esta a gostar do ritmo que estas a construir.";
  } else {
    els.petMood.textContent = "A espera";
    els.petMessage.textContent = "Completa desafios diarios para ganhar pontos e melhorar este espaco.";
  }
  els.petAvatar.dataset.mood = happiness >= 80 ? "happy" : happiness >= 55 ? "content" : "calm";
  renderRoomItems();
  renderShop();
  renderFlashMission();
}

function getTodayFlashCompletions() {
  return state.pet.flash.completedDates[todayKey] || [];
}

function getActiveFlashMission() {
  if (!state.pet.flash.activeId) return null;
  return flashMissions.find((mission) => mission.id === state.pet.flash.activeId) || null;
}

function pickFlashMission() {
  const completed = getTodayFlashCompletions();
  const available = flashMissions.filter((mission) => !completed.includes(mission.id));
  if (!available.length) return null;
  const index = (Date.now() + completed.length) % available.length;
  return available[index];
}

function ensureFlashMission() {
  const active = getActiveFlashMission();
  const expired = state.pet.flash.expiresAt && Date.now() > Number(state.pet.flash.expiresAt);
  if (active && !expired) return active;
  const next = pickFlashMission();
  state.pet.flash.activeId = next?.id || null;
  state.pet.flash.acceptedAt = null;
  state.pet.flash.expiresAt = null;
  if (expired) saveState();
  return next;
}

function renderFlashMission() {
  const mission = ensureFlashMission();
  const completedToday = getTodayFlashCompletions();
  if (!mission) {
    els.flashCard.classList.add("is-complete");
    els.flashTitle.textContent = "Pontos Flash completos";
    els.flashDescription.textContent = "Ja fizeste as missoes rapidas de hoje. Volta amanha para novas oportunidades.";
    els.flashReward.textContent = "limite diario";
    els.flashTimer.textContent = "--:--";
    els.flashAction.textContent = "Feito";
    els.flashAction.disabled = true;
    return;
  }
  const accepted = Boolean(state.pet.flash.acceptedAt);
  const remaining = accepted ? Math.max(0, Number(state.pet.flash.expiresAt) - Date.now()) : mission.minutes * 60 * 1000;
  els.flashCard.classList.toggle("is-active", accepted);
  els.flashCard.classList.remove("is-complete");
  els.flashTitle.textContent = mission.title;
  els.flashDescription.textContent = mission.description;
  els.flashReward.textContent = `+${mission.reward} pts`;
  els.flashTimer.textContent = formatTime(remaining);
  els.flashAction.disabled = completedToday.includes(mission.id);
  els.flashAction.textContent = accepted ? "Concluir" : "Aceitar";
  if (accepted && remaining <= 0) {
    state.pet.flash.activeId = null;
    state.pet.flash.acceptedAt = null;
    state.pet.flash.expiresAt = null;
    saveState();
    renderFlashMission();
  }
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function handleFlashAction() {
  const mission = ensureFlashMission();
  if (!mission) return;
  if (!state.pet.flash.acceptedAt) {
    state.pet.flash.acceptedAt = Date.now();
    state.pet.flash.expiresAt = Date.now() + mission.minutes * 60 * 1000;
    saveState();
    renderFlashMission();
    return;
  }
  if (Date.now() > Number(state.pet.flash.expiresAt)) {
    state.pet.flash.activeId = null;
    state.pet.flash.acceptedAt = null;
    state.pet.flash.expiresAt = null;
    saveState();
    renderFlashMission();
    return;
  }
  const completed = getTodayFlashCompletions();
  if (!completed.includes(mission.id)) {
    state.pet.flash.completedDates[todayKey] = [...completed, mission.id];
    state.pet.points += mission.reward;
  }
  state.pet.flash.activeId = null;
  state.pet.flash.acceptedAt = null;
  state.pet.flash.expiresAt = null;
  saveState();
  renderPet();
}

function renderRoomItems() {
  els.roomItems.innerHTML = "";
  state.pet.ownedItems.forEach((id) => {
    const item = shopItems.find((shopItem) => shopItem.id === id);
    if (!item) return;
    const visual = document.createElement("span");
    visual.className = `room-item ${item.id}`;
    visual.textContent = item.icon;
    visual.setAttribute("aria-label", item.name);
    els.roomItems.appendChild(visual);
  });
}

function renderShop() {
  els.shopGrid.innerHTML = "";
  shopItems.forEach((item) => {
    const owned = state.pet.ownedItems.includes(item.id);
    const canBuy = state.pet.points >= item.cost && !owned;
    const card = document.createElement("article");
    card.className = `shop-item${owned ? " is-owned" : ""}`;
    card.innerHTML = `
      <div class="shop-top">
        <div class="shop-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
        <span class="shop-type">${escapeHtml(item.type)}</span>
      </div>
      <div>
        <div class="shop-name">${escapeHtml(item.name)}</div>
        <div class="shop-meta">${item.cost} pontos</div>
      </div>
      <button data-shop-id="${item.id}" ${owned || !canBuy ? "disabled" : ""}>${owned ? "Comprado" : "Comprar"}</button>
    `;
    els.shopGrid.appendChild(card);
  });
}

function render() {
  renderSummary();
  renderTodayPlan();
  renderChallenges();
  renderWater();
  renderCalendar();
  renderExercises();
  renderWeeklyPlan();
  renderNotes();
  renderPet();
}

function toggleDate(key) {
  const exists = state.water.completedDates.includes(key);
  state.water.completedDates = exists
    ? state.water.completedDates.filter((date) => date !== key)
    : [...state.water.completedDates, key];
  saveState();
  renderCalendar();
}

function addChallenge(title, goal = 30) {
  state.challenges.unshift(createChallenge(title, Number(goal) || 30, 0));
  saveState();
  renderSummary();
  renderChallenges();
}

function completeChallengeForSelectedDate(challenge) {
  if (challenge.completedDates.includes(selectedChallengeDate)) return;
  if (selectedChallengeDate > todayKey) return;
  if (challenge.lives <= 0 && !challenge.missedDates.includes(selectedChallengeDate)) return;
  challenge.completedDates.push(selectedChallengeDate);
  challenge.days = Math.min(challenge.goal, challenge.days + 1);
  state.pet.points += 10;
  if (challenge.missedDates.includes(selectedChallengeDate)) {
    challenge.missedDates = challenge.missedDates.filter((date) => date !== selectedChallengeDate);
    challenge.lives = Math.min(3, challenge.lives + 1);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function scheduleDailyRefresh() {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 2, 0);
  setTimeout(() => window.location.reload(), Math.max(1000, tomorrow - new Date()));
}

els.addChallenge.addEventListener("click", () => {
  els.challengeForm.hidden = false;
  els.challengeName.focus();
});

els.suggestChallenge.addEventListener("click", () => {
  const currentTitles = state.challenges.map((challenge) => challenge.title);
  const suggestion = suggestions.find((name) => !currentTitles.includes(name)) || suggestions[0];
  addChallenge(suggestion, 30);
});

els.challengeDate.addEventListener("change", () => {
  selectedChallengeDate = els.challengeDate.value && els.challengeDate.value <= todayKey ? els.challengeDate.value : todayKey;
  renderChallenges();
});

els.challengeDateToday.addEventListener("click", () => {
  selectedChallengeDate = todayKey;
  renderChallenges();
});

els.challengeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = els.challengeName.value.trim();
  if (!title) return;
  addChallenge(title, els.challengeGoal.value);
  els.challengeName.value = "";
  els.challengeForm.hidden = true;
});

els.challengeList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  const challenge = state.challenges.find((item) => item.id === id);
  if (action === "complete" && challenge) {
    completeChallengeForSelectedDate(challenge);
  }
  if (action === "delete") {
    state.challenges = state.challenges.filter((item) => item.id !== id);
  }
  saveState();
  renderSummary();
  renderChallenges();
  renderPet();
});

els.waterMinus.addEventListener("click", () => {
  state.water.current = Math.max(0, Number((state.water.current - 0.25).toFixed(2)));
  renderWater();
  renderCalendar();
});

els.waterPlus.addEventListener("click", () => {
  state.water.current = Math.min(12, Number((state.water.current + 0.25).toFixed(2)));
  renderWater();
  renderCalendar();
});

els.waterGoal.addEventListener("change", () => {
  state.water.goal = Math.max(0.5, Number(els.waterGoal.value) || 1.5);
  renderWater();
  renderCalendar();
});

els.exerciseDateFilter.addEventListener("change", () => {
  selectedExerciseDate = els.exerciseDateFilter.value || todayKey;
  renderExercises();
});

els.exerciseToday.addEventListener("click", () => {
  selectedExerciseDate = todayKey;
  renderExercises();
});

els.exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.exerciseInput.value.trim();
  if (!text) return;
  state.exercises.unshift({
    id: createId(),
    date: todayKey,
    text,
  });
  selectedExerciseDate = todayKey;
  els.exerciseInput.value = "";
  saveState();
  renderSummary();
  renderExercises();
});

els.exerciseList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-exercise]");
  if (!button) return;
  state.exercises = state.exercises.filter((entry) => entry.id !== button.dataset.exercise);
  saveState();
  renderSummary();
  renderExercises();
});

els.weeklyPlan.addEventListener("input", (event) => {
  const field = event.target.closest("[data-plan-day]");
  if (!field) return;
  state.trainingPlan[field.dataset.planDay] = field.value;
  saveState();
  renderTodayPlan();
});

els.weeklyPlan.addEventListener("click", (event) => {
  const toggle = event.target.closest(".plan-toggle");
  if (!toggle) return;
  const editor = toggle.nextElementSibling;
  const expanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!expanded));
  editor.hidden = expanded;
});

els.notes.addEventListener("input", () => {
  state.notes = els.notes.value;
  saveState();
});

els.shopGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-shop-id]");
  if (!button) return;
  const item = shopItems.find((shopItem) => shopItem.id === button.dataset.shopId);
  if (!item || state.pet.ownedItems.includes(item.id) || state.pet.points < item.cost) return;
  state.pet.points -= item.cost;
  state.pet.ownedItems.push(item.id);
  saveState();
  renderPet();
});

els.flashAction.addEventListener("click", handleFlashAction);

els.cloudForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = els.cloudEmail.value.trim();
  if (!email) return;
  signInWithEmail(email);
});

els.cloudLogout.addEventListener("click", signOutCloud);

render();
scheduleDailyRefresh();
setInterval(renderFlashMission, 1000);
initCloudSync();
