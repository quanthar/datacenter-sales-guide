/**
 * ЦОД & Cloud Sales Academy - Interactive Learning Logic
 */

// --- Application State ---
const APP_STATE = {
  activeMode: 'guide', // 'guide' | 'flashcards' | 'objections' | 'cheatsheet'
  completedSections: new Set(JSON.parse(localStorage.getItem('dc_sales_completed') || '[]')),
  checkedQuestions: new Set(JSON.parse(localStorage.getItem('dc_sales_checklist') || '[]')),
  knownFlashcards: new Set(JSON.parse(localStorage.getItem('dc_sales_known_fc') || '[]')),
  currentFcIndex: 0,
  theme: localStorage.getItem('dc_sales_theme') || 'dark'
};

// --- Data: Flashcards ---
const FLASHCARDS = [
  {
    category: "1. Модели облаков",
    q: "Что такое Colocation и чем отличается от IaaS?",
    a: "<b>Colocation:</b> клиент привозит СВОЙ физический сервер в дата-центр провайдера (провайдер дает стойку, питание 2N, охлаждение, охрану).<br><br><b>IaaS:</b> клиент арендует ВИРТУАЛЬНЫЙ сервер, физическое железо покупать вообще не нужно."
  },
  {
    category: "1. Модели облаков",
    q: "Как объяснить разницу IaaS, PaaS, SaaS по аналогии с пиццей?",
    a: "• <b>On-Premise:</b> готовишь сам дома с нуля.<br>• <b>Colocation:</b> готовишь на чужой профессиональной кухне.<br>• <b>IaaS:</b> дали готовое тесто и духовку.<br>• <b>PaaS:</b> дали тесто с начинкой, осталось запечь.<br>• <b>SaaS:</b> заказал готовую пиццу с доставкой."
  },
  {
    category: "2. Colocation",
    q: "Что такое 1U (юнит) и сколько юнитов в стандартной стойке?",
    a: "<b>1U (Rack Unit)</b> = 44.45 мм (≈4.4 см) высоты серверного слота в 19-дюймовой стойке.<br><br>Стандартная серверная стойка = <b>42U</b> (или 48U). Серверы обычно занимают 1U, 2U или 4U."
  },
  {
    category: "2. Colocation",
    q: "Что гарантирует стандарт Tier III для ЦОД?",
    a: "Надёжность <b>99.982% uptime</b> (простой не более 1.6 часа в год). Резервирование компонентов N+1 или 2N, возможность проводить ремонт и обслуживание без остановки работы оборудования."
  },
  {
    category: "2. Colocation",
    q: "Что такое Cross-Connect (кросс-коннект)?",
    a: "Прямое физическое кабельное соединение (оптика или медь) между стойками разных клиентов или операторов внутри одного ЦОД с минимальной задержкой (latency) и без выхода в публичный интернет."
  },
  {
    category: "3. AI Inference",
    q: "В чем разница между Training и Inference в ИИ?",
    a: "• <b>Training (обучение):</b> создание модели с нуля на петабайтах данных (стоит $10M–$100M+).<br>• <b>Inference (инференс):</b> запуск уже обученной нейросети для ответа на запрос пользователя (ChatGPT отвечает вам — это inference)."
  },
  {
    category: "3. AI Inference",
    q: "Почему компании берут GPU-as-a-Service вместо покупки серверов?",
    a: "Сервер с NVIDIA H100/A100 стоит <b>от 5-8 млн ₽</b>, его сложно купить из-за санкций и нужно мощное охлаждение (до 10 кВт). В ЦОД его арендуют от <b>150 000 ₽/мес</b> с мгновенным стартом и масштабированием."
  },
  {
    category: "4. Kubernetes",
    q: "Что такое Kubernetes и как объяснить его простым языком?",
    a: "Kubernetes — это <b>автоматический диспетчер</b> для контейнеров (приложений в чемоданах). Он сам запускает новые копии при наплыве клиентов, перезапускает упавшие сервисы и балансирует нагрузку."
  },
  {
    category: "4. Kubernetes",
    q: "Что продает менеджер под видом Managed Kubernetes?",
    a: "Управляемый кластер: клиент не нанимает дорогого DevOps для администрирования «под капотом». Провайдер берет на себя апдейты, отказоустойчивость master-нод, безопасность и мониторинг."
  },
  {
    category: "5. Хранение данных",
    q: "В чем отличие S3 (Object Storage) от блочного диска?",
    a: "• <b>Блочный диск:</b> быстрый системный диск для ОС и баз данных (дорогой, ⚡ высокая скорость).<br>• <b>S3 (Объектное):</b> хранилище файлов по API, идеальное для бэкапов, логов и медиа (очень дешёвое — от 2 ₽/ГБ/мес, безграничный объем)."
  },
  {
    category: "5. Хранение данных",
    q: "В чем заключается золотое правило бэкапа «3-2-1»?",
    a: "• <b>3</b> копии важных данных (1 оригинал + 2 бэкапа).<br>• <b>2</b> разных типа носителей (локальный диск + облако S3).<br>• <b>1</b> копия в географически удаленном месте (другой ЦОД/город) на случай пожара или аварии."
  },
  {
    category: "6. Экономика TCO",
    q: "Что такое TCO и почему клиент ошибается, считая только цену железа?",
    a: "<b>TCO (Total Cost of Ownership)</b> — совокупная стоимость владения за 3-5 лет. Клиент забывает посчитать: электричество 24/7, промышленный кондиционер, дизель-генератор, 2 интернет-канала, зарплату сисадмина и главное — <b>цену часа простоя</b>."
  },
  {
    category: "7. Возражения",
    q: "Как ответить на возражение: «У нас свой сисадмин, он справляется»?",
    a: "«Он молодец! А что произойдет, если он уйдет в отпуск, заболеет или уволится в момент сбоя? ЦОД — это страховка: дежурные инженеры 24/7, 'удалённые руки' для замены диска за 15 минут и финансовый SLA в договоре.»"
  },
  {
    category: "7. Возражения",
    q: "Как ответить на возражение: «Данные нельзя отдавать на сторону»?",
    a: "«При Colocation ваши данные физически хранятся на ваших серверах, к которым у нас нет доступа (стойка под замком со СКУД). ЦОД сертифицирован по ФЗ-152 и 187-ФЗ (КИИ) — именно это требуют регуляторы и банки.»"
  },
  {
    category: "7. Возражения",
    q: "Когда клиенту НЕ ВЫГОДЕН Colocation?",
    a: "1) У него всего 1 легкий сервер (дешевле взять VPS в IaaS).<br>2) Закон требует размещение внутри периметра гос. объекта.<br>3) Компания только что сделала свежий ремонт серверной за миллионы (предлагаем бэкап-площадку)."
  }
];

// --- Data: Objection Simulator ---
const OBJECTIONS_DATA = [
  {
    id: "obj-1",
    client: "«У нас серверная прямо в офисе в подвале, всё работает, зачем нам куда-то переезжать?»",
    context: "Компания среднего бизнеса (производство или ритейл), сисадмин сидит рядом.",
    script: "«Понимаю вас. Однако весной подвалы часто подтапливает, а летом бытовой кондиционер не справляется с жарой. Если сервер встанет в разгар отгрузок — сколько часов простоя бизнес переживет без потерь? В дата-центре уровня Tier III вы получаете гарантированное 2N питание, пожаротушение газом и температуру +22°C круглый год. Давайте рассчитаем стоимость резервного размещения для критичных систем?»",
    why: "Смещает фокус с 'у нас работает' на 'риск катастрофического простоя' и предлагает мягкий шаг (расчёт)."
  },
  {
    id: "obj-2",
    client: "«У нас всё уже в облаке (Yandex Cloud / Selectel), нам ваши стойки не нужны.»",
    context: "ИТ-компания или стартап, все сервисы подняты на виртуалках.",
    script: "«Отличный выбор, облако дает гибкость! А где вы держите холодные бэкапы? Хранить всё у одного провайдера рискованно. Кроме того, при постоянной высокой нагрузке (например, базы данных или AI-инференс) Colocation на своем железе в 2–3 раза дешевле облачных виртуалок. Какой у вас сейчас ежемесячный чек за облако?»",
    why: "Хвалит клиента за облако, предлагает geo-бэкап или оптимизацию затрат на стабильных ресурсах."
  },
  {
    id: "obj-3",
    client: "«Это слишком дорого! Стойка стоит от 50 000 руб./мес, за 3 года это почти 2 миллиона!»",
    context: "Финансовый директор или бережливый собственник.",
    script: "«Цифра звучит весомо, если смотреть изолированно. Но давайте посчитаем: сколько вы платите за электричество для серверов и кондиционеров в офисе по коммерческому тарифу? Сколько стоит обслуживание ИБП, замена батарей, 2 отдельных интернет-канала и доля зарплаты сисадмина? По нашему расчету TCO, аренда стойки экономит бизнесу до 40-45% прямых расходов за 3 года. Я пришлю вам 1-страничную сравнительную таблицу, согласны взглянуть?»",
    why: "Переводит спор о цене в плоскость совокупной стоимости владения (TCO)."
  },
  {
    id: "obj-4",
    client: "«Мы слишком маленькие для ЦОД, у нас всего 2 сервера.»",
    context: "Небольшая компания, бухгалтерская база 1С и файлообменник.",
    script: "«Как раз для таких задач дата-центры предлагают поюнитное размещение (от 1U или 2U), вам не нужно арендовать целую стойку! А если вы не хотите покупать новые серверы взамен устаревших, мы можем предоставить вам виртуальный IaaS под 1С с оплатой помесячно. Ваши бухгалтеры получат доступ 24/7 с гарантией от шифровальщиков.»",
    why: "Снимает страх масштаба, предлагает 1U Colocation или переход на IaaS."
  },
  {
    id: "obj-5",
    client: "«Служба безопасности запрещает вывозить серверы: данные конфиденциальны!»",
    context: "Банк, медицина, юридическая или государственная сфера.",
    script: "«Безопасность превыше всего. В Colocation вы не передаете данные третьим лицам: оборудование ваше, зашифровано вашими ключами. Дата-центр обеспечивает физическую защиту: охрана Росгвардии, биометрия, видеонаблюдение за каждой стойкой и сертификаты соответствия ФЗ-152 (УЗ-1) и 187-ФЗ КИИ. Большинство банков топ-10 хранят данные именно в коммерческих ЦОД. Могу прислать выписку сертификатов для вашего CISO?»",
    why: "Аргументирует нормативными сертификатами (ФЗ-152, КИИ) и физической недоступностью данных для персонала ЦОД."
  }
];

// --- Data: Pizza Analogy Models ---
const PIZZA_DATA = {
  onprem: {
    title: "On-Premise (Своя серверная)",
    pizza: "🍕 Готовишь сам дома: сам покупаешь муку, духовку, моешь посуду, платишь за электричество.",
    tech: "🏢 Полный стек у клиента: сам покупаешь серверы, строишь серверную, ставишь кондиционер, ИБП, тянешь кабели и чинишь железо.",
    clientManages: ["Здание и охлаждение", "Электропитание и ИБП", "Серверы и сеть", "Виртуализацию", "ОС и базы данных", "Приложения и данные"],
    providerManages: ["Ничего (всё на вас)"],
    products: "Собственная серверная комната в офисе, сервер в подвале",
    clientType: "Госсектор с секретностью, консервативные заводы"
  },
  colo: {
    title: "Colocation (Аренда стойки в ЦОД)",
    pizza: "🍕 Готовишь на арендованной профи-кухне: шеф-повар твой, продукты твои, но плита, вытяжка и пожарные датчики — ресторанные.",
    tech: "🏢 Твоё железо в профессиональном здании ЦОД: провайдер даёт 2N питание, кондиционеры, охрану и оптоволокно. Железом и софтом рулит клиент.",
    clientManages: ["Свои серверы и диски", "Настройку сети", "Операционную систему", "Приложения и данные"],
    providerManages: ["Здание ЦОД и охрану", "Питание 2N и дизель-генераторы", "Прецизионный климат 24/7", "Каналы связи и пиринг", "SLA 99.98%"],
    products: "Selectel Colocation, DataLine, Т2 ЦОД, Linxdatacenter",
    clientType: "Банки, финтех, зрелый e-commerce, средний и крупный бизнес"
  },
  iaas: {
    title: "IaaS (Аренда виртуальных серверов)",
    pizza: "🍕 Доставка полуфабрикатов: тебе привезли готовое раскатанное тесто и печь. Начинку кладёшь и печёшь сам.",
    tech: "🏢 Инфраструктура как сервис: клиент арендует виртуальные ядра (vCPU), память (RAM) и диски в облаке через панель управления.",
    clientManages: ["Выбор и настройку ОС", "Установку баз данных", "Код приложений", "Резервные копии и безопасность"],
    providerManages: ["Физические серверы", "Систему виртуализации (KVM/ESXi)", "СХД и сетевую фабрику", "ЦОД, питание и охлаждение"],
    products: "Yandex Cloud Compute, VK Cloud, Selectel Cloud, Cloud.ru",
    clientType: "Стартапы, разработчики, сезонный ритейл (распродажи), быстрорастущий бизнес"
  },
  paas: {
    title: "PaaS (Платформа как сервис)",
    pizza: "🍕 Готовая пицца для запекания: пицца собрана, тебе осталось только нажать кнопку духовки.",
    tech: "🏢 Платформа для приложений: клиент загружает код или базы данных, провайдер сам настраивает кластеры, репликацию и патчи.",
    clientManages: ["Код приложения", "Бизнес-логику", "Данные"],
    providerManages: ["Установку и тюнинг СУБД (PostgreSQL, ClickHouse)", "Кластеры Kubernetes", "ОС и патчи безопасности", "Всё нижнее железо"],
    products: "Managed Service for PostgreSQL, Managed K8s, Cloud Functions",
    clientType: "DevOps-команды, разработчики мобильных приложений и SaaS-сервисов"
  },
  saas: {
    title: "SaaS (Готовое ПО по подписке)",
    pizza: "🍕 Заказ готовой пиццы в ресторане: привезли горячую, открыл коробку и ешь. Не думаешь о кухне вообще.",
    tech: "🏢 Программное обеспечение как услуга: открываешь браузер или приложение и сразу работаешь.",
    clientManages: ["Свои учётные записи и пароли", "Введённые данные"],
    providerManages: ["Весь программный код", "Базы данных и бэкапы", "Масштабирование и обновления", "Всю инфраструктуру целиком"],
    products: "amoCRM, Битрикс24, 1С:Фреш, МойСклад, Яндекс 360",
    clientType: "Любой бизнес от 1 человека до корпораций"
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavModes();
  initSidebar();
  initProgressTracker();
  initPizzaAnalogy();
  initTcoCalculator();
  initFlashcards();
  initObjectionTrainer();
  initChecklist();
  initSearch();
  initCopyButtons();
});

// ==========================================================================
// Theme Management
// ==========================================================================
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  document.documentElement.setAttribute('data-theme', APP_STATE.theme);
  updateThemeIcon();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', APP_STATE.theme);
      localStorage.setItem('dc_sales_theme', APP_STATE.theme);
      updateThemeIcon();
      showToast(`Переключено на ${APP_STATE.theme === 'dark' ? 'тёмную' : 'светлую'} тему`);
    });
  }
}

function updateThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (APP_STATE.theme === 'dark') {
    icon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`; // Moon
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`; // Sun
  }
}

// ==========================================================================
// View Mode Switching (Tabs & Mobile Bottom Nav)
// ==========================================================================
function initNavModes() {
  const modeButtons = document.querySelectorAll('.nav-tab-btn');
  const mobileModeButtons = document.querySelectorAll('.mobile-nav-item[data-mode]');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  mobileModeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  const mobTocBtn = document.getElementById('mob-nav-toc');
  if (mobTocBtn) {
    mobTocBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }
}

function switchMode(targetMode) {
  APP_STATE.activeMode = targetMode;
  
  // Update desktop top tabs
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === targetMode);
  });

  // Update mobile bottom nav items
  document.querySelectorAll('.mobile-nav-item[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === targetMode);
  });

  // Toggle tab panels
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${targetMode}`);
  });

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// Sidebar, Drawer & ScrollSpy
// ==========================================================================
function openMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function initSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      openMobileSidebar();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  if (sidebar) {
    sidebar.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        closeMobileSidebar();
      });
    });
  }

  // Section completion toggles in sidebar & inside sections
  document.querySelectorAll('.toc-check').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sectionId = btn.dataset.section;
      toggleSectionComplete(sectionId);
    });
  });

  document.querySelectorAll('.section-mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.section;
      toggleSectionComplete(sectionId);
    });
  });

  // Scrollspy to highlight active TOC item
  const sections = document.querySelectorAll('.guide-section');
  const tocLinks = document.querySelectorAll('.toc-item');

  window.addEventListener('scroll', () => {
    if (APP_STATE.activeMode !== 'guide') return;
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        currentId = sec.getAttribute('id');
      }
    });

    tocLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }, { passive: true });
}

function toggleSectionComplete(sectionId) {
  if (APP_STATE.completedSections.has(sectionId)) {
    APP_STATE.completedSections.delete(sectionId);
    showToast(`Раздел убран из изученных`);
  } else {
    APP_STATE.completedSections.add(sectionId);
    showToast(`✓ Раздел отмечен как изученный!`);
  }
  localStorage.setItem('dc_sales_completed', JSON.stringify([...APP_STATE.completedSections]));
  updateProgressUI();
}

function initProgressTracker() {
  updateProgressUI();
}

function updateProgressUI() {
  const totalSections = 9;
  const completedCount = APP_STATE.completedSections.size;
  const pct = Math.round((completedCount / totalSections) * 100);

  const fillEl = document.getElementById('progress-bar-fill');
  const pctEl = document.getElementById('progress-pct-val');
  const statsEl = document.getElementById('progress-stats-val');

  if (fillEl) fillEl.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (statsEl) statsEl.textContent = `${completedCount} из ${totalSections} тем`;

  // Update checkmarks in TOC
  document.querySelectorAll('.toc-check').forEach(checkBtn => {
    const sId = checkBtn.dataset.section;
    const isDone = APP_STATE.completedSections.has(sId);
    checkBtn.classList.toggle('checked', isDone);
    checkBtn.innerHTML = isDone ? '✓' : '';
  });

  // Update inside-section mark buttons
  document.querySelectorAll('.section-mark-btn').forEach(btn => {
    const sId = btn.dataset.section;
    const isDone = APP_STATE.completedSections.has(sId);
    btn.classList.toggle('completed', isDone);
    btn.innerHTML = isDone 
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Изучено`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Отметить изученным`;
  });
}

// ==========================================================================
// Pizza Analogy Interactive Component
// ==========================================================================
function initPizzaAnalogy() {
  const tabs = document.querySelectorAll('.pizza-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderPizzaModel(tab.dataset.model);
    });
  });

  // Initial render
  renderPizzaModel('colo');
}

function renderPizzaModel(modelKey) {
  const data = PIZZA_DATA[modelKey];
  if (!data) return;

  const container = document.getElementById('pizza-dynamic-content');
  if (!container) return;

  container.innerHTML = `
    <div class="pizza-detail-card">
      <div class="analogy-box">
        <h4 style="color: var(--accent-warning); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
          🍕 Аналогия из жизни
        </h4>
        <p style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">${data.pizza}</p>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          <strong>Типичные продукты:</strong> ${data.products}
        </div>
      </div>
      <div class="tech-box">
        <h4 style="color: var(--accent-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
          💻 ИТ-реальность
        </h4>
        <p style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">${data.tech}</p>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          <strong>Целевой клиент:</strong> ${data.clientType}
        </div>
      </div>
    </div>
    <div class="responsibility-bars">
      <div>
        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--accent-primary); margin-bottom: 6px;">
          Клиент контролирует:
        </div>
        ${data.clientManages.map(item => `
          <div class="resp-item client" style="margin-bottom: 4px;">👤 ${item}</div>
        `).join('')}
      </div>
      <div>
        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--accent-success); margin-bottom: 6px;">
          Провайдер ЦОД обеспечивает:
        </div>
        ${data.providerManages.map(item => `
          <div class="resp-item provider" style="margin-bottom: 4px;">🏢 ${item}</div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================================================
// TCO Live Interactive Calculator
// ==========================================================================
function initTcoCalculator() {
  const inputs = {
    servers: document.getElementById('calc-servers'),
    serverCost: document.getElementById('calc-server-cost'),
    rent: document.getElementById('calc-rent'),
    power: document.getElementById('calc-power'),
    admin: document.getElementById('calc-admin'),
    downtime: document.getElementById('calc-downtime')
  };

  if (!inputs.servers) return;

  // Add event listeners to all sliders
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', updateTcoCalculations);
  });

  updateTcoCalculations();
}

function updateTcoCalculations() {
  const servers = parseInt(document.getElementById('calc-servers').value);
  const serverCost = parseInt(document.getElementById('calc-server-cost').value);
  const rentPerMonth = parseInt(document.getElementById('calc-rent').value);
  const powerPerMonth = parseInt(document.getElementById('calc-power').value);
  const adminSalary = parseInt(document.getElementById('calc-admin').value);
  const downtimeCostPerHour = parseInt(document.getElementById('calc-downtime').value);

  // Update slider label numbers
  document.getElementById('val-servers').textContent = `${servers} шт.`;
  document.getElementById('val-server-cost').textContent = formatCurrency(serverCost);
  document.getElementById('val-rent').textContent = `${formatCurrency(rentPerMonth)}/мес`;
  document.getElementById('val-power').textContent = `${formatCurrency(powerPerMonth)}/мес`;
  document.getElementById('val-admin').textContent = `${formatCurrency(adminSalary)}/мес`;
  document.getElementById('val-downtime').textContent = `${formatCurrency(downtimeCostPerHour)}/час`;

  // 3-Year On-Premises Calculations
  const hardwareCost = servers * serverCost;
  const onpremFacility = (rentPerMonth * 36) + 100000; // Room rent + conditioning capital/maintenance
  const onpremElectricity = powerPerMonth * 36;
  const onpremCoolingMaintenance = 5000 * 36;
  const onpremUpsDk = 350000; // UPS + generator share
  const onpremInternet = 6000 * 36; // 2 redundant office channels
  const onpremAdmin = (adminSalary * 0.20) * 36; // 20% of admin salary spent on hardware/cooling babysitting
  const onpremDowntime = (downtimeCostPerHour * 4) * 3; // 4 hours downtime per year

  const totalOnprem = hardwareCost + onpremFacility + onpremElectricity + 
                      onpremCoolingMaintenance + onpremUpsDk + onpremInternet + 
                      onpremAdmin + onpremDowntime;

  // 3-Year Colocation Calculations
  // 1 rack holds up to 10-15 servers. Calculate racks needed
  const racksNeeded = Math.ceil(servers / 10);
  const coloRackRentMonthly = racksNeeded * 15000;
  const coloRackTotal = coloRackRentMonthly * 36;
  const coloInternet = 3000 * 36; // Cheap peering
  const coloAdmin = (adminSalary * 0.10) * 36; // 10% admin overhead (smart hands handle physical layer)
  const coloDowntime = (downtimeCostPerHour * 0.4) * 3; // 99.95% SLA (< 0.4 hr/yr)

  const totalColo = hardwareCost + coloRackTotal + coloInternet + coloAdmin + coloDowntime;

  const savingsRub = totalOnprem - totalColo;
  const savingsPct = Math.round((savingsRub / totalOnprem) * 100);

  // Render to DOM
  document.getElementById('tco-onprem-total').textContent = formatCurrency(totalOnprem);
  document.getElementById('tco-colo-total').textContent = formatCurrency(totalColo);
  document.getElementById('tco-savings-rub').textContent = `Экономия: ${formatCurrency(savingsRub)}`;
  document.getElementById('tco-savings-pct').textContent = `−${savingsPct}%`;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
}

// ==========================================================================
// Flashcards Interactive System
// ==========================================================================
function initFlashcards() {
  renderCurrentFlashcard();

  const stage = document.getElementById('fc-stage');
  const card = document.getElementById('fc-card');
  const btnPrev = document.getElementById('fc-prev');
  const btnNext = document.getElementById('fc-next');
  const btnKnow = document.getElementById('fc-know');
  const btnAgain = document.getElementById('fc-again');

  if (card && stage) {
    stage.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      navigateFlashcard(-1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      navigateFlashcard(1);
    });
  }

  if (btnKnow) {
    btnKnow.addEventListener('click', () => {
      APP_STATE.knownFlashcards.add(APP_STATE.currentFcIndex);
      saveKnownFlashcards();
      showToast('✓ Добавлено в освоенные карточки!');
      navigateFlashcard(1);
    });
  }

  if (btnAgain) {
    btnAgain.addEventListener('click', () => {
      APP_STATE.knownFlashcards.delete(APP_STATE.currentFcIndex);
      saveKnownFlashcards();
      showToast('Отмечено для повторения');
      navigateFlashcard(1);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (APP_STATE.activeMode !== 'flashcards') return;
    if (e.code === 'Space') {
      e.preventDefault();
      card.classList.toggle('flipped');
    } else if (e.code === 'ArrowRight') {
      navigateFlashcard(1);
    } else if (e.code === 'ArrowLeft') {
      navigateFlashcard(-1);
    }
  });
}

function navigateFlashcard(direction) {
  const card = document.getElementById('fc-card');
  if (card) card.classList.remove('flipped');

  setTimeout(() => {
    let nextIdx = APP_STATE.currentFcIndex + direction;
    if (nextIdx >= FLASHCARDS.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = FLASHCARDS.length - 1;
    APP_STATE.currentFcIndex = nextIdx;
    renderCurrentFlashcard();
  }, 150);
}

function renderCurrentFlashcard() {
  const fc = FLASHCARDS[APP_STATE.currentFcIndex];
  if (!fc) return;

  const categoryEl = document.getElementById('fc-category');
  const qEl = document.getElementById('fc-question');
  const aEl = document.getElementById('fc-answer');
  const counterEl = document.getElementById('fc-counter');
  const statusBadge = document.getElementById('fc-status-badge');

  if (categoryEl) categoryEl.textContent = fc.category;
  if (qEl) qEl.innerHTML = fc.q;
  if (aEl) aEl.innerHTML = fc.a;
  if (counterEl) counterEl.textContent = `${APP_STATE.currentFcIndex + 1} / ${FLASHCARDS.length}`;

  const isKnown = APP_STATE.knownFlashcards.has(APP_STATE.currentFcIndex);
  if (statusBadge) {
    statusBadge.textContent = isKnown ? 'Освоено ✓' : 'На изучении';
    statusBadge.className = `tag ${isKnown ? 'tag-green' : 'tag-amber'}`;
  }
}

function saveKnownFlashcards() {
  localStorage.setItem('dc_sales_known_fc', JSON.stringify([...APP_STATE.knownFlashcards]));
}

// ==========================================================================
// Objection Trainer
// ==========================================================================
function initObjectionTrainer() {
  const container = document.getElementById('objections-list');
  if (!container) return;

  container.innerHTML = OBJECTIONS_DATA.map((obj, idx) => `
    <div class="objection-card" id="${obj.id}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="tag tag-rose">Возражение #${idx + 1}</span>
        <button class="copy-btn copy-script-btn" data-script="${encodeURIComponent(obj.script)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          Скопировать скрипт
        </button>
      </div>

      <div class="client-quote-box">
        <div class="client-avatar">👤</div>
        <div>
          <div class="client-text">${obj.client}</div>
          <div class="client-context">Контекст: ${obj.context}</div>
        </div>
      </div>

      <button class="objection-reveal-btn" data-target="solution-${obj.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
        Показать эталонный ответ сейла
      </button>

      <div class="script-solution-box" id="solution-${obj.id}">
        <div class="solution-header">
          <span class="solution-tag">💬 Скрипт ответа:</span>
        </div>
        <div class="sales-script-text">${obj.script}</div>
        <div class="solution-why">
          <strong>💡 Почему это работает:</strong> ${obj.why}
        </div>
      </div>
    </div>
  `).join('');

  // Add click handlers for reveal buttons
  container.querySelectorAll('.objection-reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const box = document.getElementById(targetId);
      if (box) {
        const isShown = box.classList.toggle('visible');
        btn.innerHTML = isShown 
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"></path></svg> Скрыть эталонный ответ`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg> Показать эталонный ответ сейла`;
      }
    });
  });
}

// ==========================================================================
// Interactive Discovery Checklist (Section 8)
// ==========================================================================
const CHECKLIST_ITEMS = [
  "Сколько у вас серверов / стоек сейчас?",
  "Какая потребляемая мощность на стойку (в среднем 3–10 кВт)?",
  "Где сейчас стоит оборудование? (офис / подвал / свой серверный шкаф / другой ЦОД)?",
  "Какой уровень доступности (Uptime / SLA) вам необходим для бизнеса (99.9% или 99.99%)?",
  "Есть ли специфические требования регулятора? (ФЗ-152 персональные данные, КИИ 187-ФЗ, требования ЦБ)?",
  "Нужен ли прямой Cross-connect с другими операторами / клиентами внутри площадки?",
  "Какой суммарный объём данных и как часто настраиваете бэкапы?",
  "Планируете ли расширение мощностей или запуск AI/ML проектов в ближайшие 1–3 года?",
  "Кто принимает итоговое решение (CISO, CTO, Генеральный) и согласован ли ориентировочный бюджет?"
];

function initChecklist() {
  const container = document.getElementById('checklist-items-wrap');
  if (!container) return;

  container.innerHTML = CHECKLIST_ITEMS.map((text, idx) => {
    const isChecked = APP_STATE.checkedQuestions.has(idx);
    return `
      <label class="checklist-item ${isChecked ? 'checked' : ''}" data-idx="${idx}">
        <input type="checkbox" ${isChecked ? 'checked' : ''}>
        <span class="checklist-text">${idx + 1}. ${text}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const idx = parseInt(item.dataset.idx);
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }

      if (checkbox.checked) {
        APP_STATE.checkedQuestions.add(idx);
        item.classList.add('checked');
      } else {
        APP_STATE.checkedQuestions.delete(idx);
        item.classList.remove('checked');
      }

      localStorage.setItem('dc_sales_checklist', JSON.stringify([...APP_STATE.checkedQuestions]));
      updateChecklistCounter();
    });
  });

  const copyBtn = document.getElementById('copy-checklist-crm');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const lines = CHECKLIST_ITEMS.map((q, idx) => {
        const mark = APP_STATE.checkedQuestions.has(idx) ? '[x]' : '[ ]';
        return `${mark} ${q}`;
      }).join('\n');
      navigator.clipboard.writeText(`Опросник квалификации клиента (Т2 / B2B ЦОД):\n${lines}`);
      showToast('✓ Опросник скопирован для вставки в CRM / Заметки!');
    });
  }

  const resetBtn = document.getElementById('reset-checklist');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      APP_STATE.checkedQuestions.clear();
      localStorage.removeItem('dc_sales_checklist');
      initChecklist();
      showToast('Чек-лист сброшен');
    });
  }

  updateChecklistCounter();
}

function updateChecklistCounter() {
  const countEl = document.getElementById('checklist-counter-badge');
  if (countEl) {
    countEl.textContent = `${APP_STATE.checkedQuestions.size} / ${CHECKLIST_ITEMS.length} пройдено`;
  }
}

// ==========================================================================
// Global Search (Ctrl + K)
// ==========================================================================
const SEARCH_INDEX = [
  { title: "Пирамида облачных сервисов (IaaS, PaaS, SaaS)", snippet: "Сравнение моделей On-Premise, Colocation, IaaS, PaaS, SaaS через пиццу", target: "#sec-1" },
  { title: "Colocation (Аренда стойко-места в ЦОД)", snippet: "Что входит, 1U, мощность в кВт, Tier III SLA 99.98%, Cross-connect", target: "#sec-2" },
  { title: "AI Inference & GPU-as-a-Service", snippet: "Разница Training vs Inference, аренда NVIDIA A100/H100 вместо покупки", target: "#sec-3" },
  { title: "Kubernetes (K8s) и контейнеры", snippet: "Диспетчер для приложений-чемоданов, Managed K8s для разработчиков", target: "#sec-4" },
  { title: "Хранение данных: Блочное vs Объектное S3", snippet: "Правило бэкапа 3-2-1, geo-redundancy, стоимость от 2 руб./ГБ", target: "#sec-5" },
  { title: "TCO: Как считать экономию ЦОД vs Своя серверная", snippet: "Формула совокупной стоимости владения, таблица на 3 года, экономия -45%", target: "#sec-6" },
  { title: "Скрипты продаж и отработка возражений", snippet: "Первый звонок Т2, ответы на 'дорого', 'у нас сисадмин', 'всё в облаке'", target: "#sec-7" },
  { title: "Чек-лист квалификации клиента перед КП", snippet: "9 обязательных вопросов: питание кВт, uptime, ФЗ-152, бэкапы", target: "#sec-8" },
  { title: "Роадмап обучения менеджера по продажам", snippet: "Приоритеты 1, 2, 3: экскурсии Selectel, курсы, сертификации", target: "#sec-9" },
  { title: "Tier III надежность дата-центра", snippet: "Uptime 99.982%, не более 1.6 ч простоя в год, 2N резервирование питания", target: "#sec-2" },
  { title: "Правило бэкапа 3-2-1", snippet: "3 копии данных, 2 разных типа носителя, 1 копия в удаленном ЦОД", target: "#sec-5" }
];

function initSearch() {
  const modal = document.getElementById('search-modal');
  const triggerBtn = document.getElementById('search-trigger');
  const input = document.getElementById('search-input');
  const resultsList = document.getElementById('search-results');

  if (!modal || !triggerBtn || !input) return;

  function openSearch() {
    modal.classList.add('open');
    input.value = '';
    renderSearchResults('');
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    modal.classList.remove('open');
  }

  triggerBtn.addEventListener('click', openSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('open')) closeSearch();
      else openSearch();
    } else if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeSearch();
    }
  });

  input.addEventListener('input', (e) => {
    renderSearchResults(e.target.value.trim().toLowerCase());
  });

  function renderSearchResults(query) {
    const filtered = query === '' 
      ? SEARCH_INDEX.slice(0, 6)
      : SEARCH_INDEX.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.snippet.toLowerCase().includes(query)
        );

    if (filtered.length === 0) {
      resultsList.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Ничего не найдено по запросу "${query}"</div>`;
      return;
    }

    resultsList.innerHTML = filtered.map(item => `
      <div class="search-result-item" data-target="${item.target}">
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-snippet">${item.snippet}</div>
      </div>
    `).join('');

    resultsList.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        closeSearch();
        switchMode('guide');
        setTimeout(() => {
          const targetEl = document.querySelector(target);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    });
  }
}

// ==========================================================================
// Copy to Clipboard Helpers & Toast
// ==========================================================================
function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;

    let textToCopy = '';
    if (copyBtn.dataset.script) {
      textToCopy = decodeURIComponent(copyBtn.dataset.script);
    } else {
      const quoteEl = copyBtn.closest('.pitch-card')?.querySelector('.pitch-quote');
      if (quoteEl) textToCopy = quoteEl.innerText;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showToast('✓ Текст скопирован в буфер обмена!');
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
