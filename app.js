(function () {
  const STORAGE_KEYS = {
    session: 'wander-web-demo-active-session',
    draft: 'wander-web-demo-draft',
    diaries: 'wander-web-demo-diaries',
  };

  const fallbackTasks = [
    {
      id: 'task_window_blue',
      title: '门缝里的旧蓝',
      subtitle: '找一扇半开的门，看褪色停在哪里。',
      prompt: '停在某扇半掩的门前，看看门缝边缘漆皮翘起的地方，那些褪下去的颜色是不是还留着旧时的笔触？',
      tags: ['剥落漆层', '铁锈', '门缝', '旧蓝'],
    },
    {
      id: 'task_time_corner',
      title: '被时间磨亮的边角',
      subtitle: '也许是扶手，也许是门边。',
      prompt: '留意那些被手、风和年月反复摸亮的地方。它们不张扬，却总有人从那里经过。',
      tags: ['磨痕', '金属', '边角'],
    },
    {
      id: 'task_plant_claim',
      title: '植物偷偷伸进来的地方',
      subtitle: '不是花园，是边缘悄悄变绿。',
      prompt: '找一处植物慢慢改写建筑边界的地方，看看它是贴着、攀着，还是只在边缘轻轻停一下。',
      tags: ['植物', '墙面', '阴影'],
    },
  ];

  const state = {
    screen: 'home',
    activeSession: load(STORAGE_KEYS.session, null),
    draft: load(STORAGE_KEYS.draft, null),
    diaries: load(STORAGE_KEYS.diaries, []),
    tasks: [],
    selectedTaskIds: [],
    selectedTasks: [],
    photoItems: [],
    currentImageIndex: 0,
    summaryMode: 'photo',
    currentSummary: null,
    pageAnimating: false,
  };

  const refs = {
    app: document.getElementById('app'),
    screens: {
      home: document.getElementById('homeScreen'),
      focus: document.getElementById('focusScreen'),
      develop: document.getElementById('developScreen'),
      summary: document.getElementById('summaryScreen'),
    },
    transition: document.getElementById('pageTransition'),
    greetingText: document.getElementById('greetingText'),
    dateText: document.getElementById('dateText'),
    sessionNote: document.getElementById('sessionNote'),
    homeFocusPaper: document.getElementById('homeFocusPaper'),
    homeDevelopPaper: document.getElementById('homeDevelopPaper'),
    focusEyebrow: document.getElementById('focusEyebrow'),
    focusCopy: document.getElementById('focusCopy'),
    focusAction: document.getElementById('focusAction'),
    focusCarryNote: document.getElementById('focusCarryNote'),
    developEyebrow: document.getElementById('developEyebrow'),
    developCopy: document.getElementById('developCopy'),
    developAction: document.getElementById('developAction'),
    recentSection: document.getElementById('recentSection'),
    recentList: document.getElementById('recentList'),
    emptyDesk: document.getElementById('emptyDesk'),
    focusHeadTitle: document.getElementById('focusHeadTitle'),
    focusHeadSub: document.getElementById('focusHeadSub'),
    focusAddress: document.getElementById('focusAddress'),
    focusDesk: document.getElementById('focusDesk'),
    focusPaper: document.getElementById('focusPaper'),
    focusClosed: document.getElementById('focusClosed'),
    focusOpen: document.getElementById('focusOpen'),
    taskList: document.getElementById('taskList'),
    focusLocaleText: document.getElementById('focusLocaleText'),
    selectedTasksSummary: document.getElementById('selectedTasksSummary'),
    focusBottomAction: document.getElementById('focusBottomAction'),
    planeLayer: document.getElementById('planeLayer'),
    focusLeavesLeft: document.getElementById('focusLeavesLeft'),
    focusLeavesRight: document.getElementById('focusLeavesRight'),
    developPageSub: document.getElementById('developPageSub'),
    developCarryNote: document.getElementById('developCarryNote'),
    photoInput: document.getElementById('photoInput'),
    photoGrid: document.getElementById('photoGrid'),
    photoCountText: document.getElementById('photoCountText'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    loadingSub: document.getElementById('loadingSub'),
    summaryDateText: document.getElementById('summaryDateText'),
    summaryLocationText: document.getElementById('summaryLocationText'),
    summaryTaskCard: document.getElementById('summaryTaskCard'),
    summaryMainImage: document.getElementById('summaryMainImage'),
    summaryCounter: document.getElementById('summaryCounter'),
    thumbRow: document.getElementById('thumbRow'),
    readingText: document.getElementById('readingText'),
    questionText: document.getElementById('questionText'),
    reflectionInput: document.getElementById('reflectionInput'),
    summaryText: document.getElementById('summaryText'),
    showPhotoModeBtn: document.getElementById('showPhotoModeBtn'),
    showSketchModeBtn: document.getElementById('showSketchModeBtn'),
    sketchBtn: document.getElementById('sketchBtn'),
  };

  bindEvents();
  bootstrap();

  function bindEvents() {
    refs.homeFocusPaper.addEventListener('click', () => openFocusFromHome());
    refs.homeDevelopPaper.addEventListener('click', () => openDevelopFromHome());
    refs.focusAction.addEventListener('click', () => openFocusFromHome());
    refs.developAction.addEventListener('click', () => openDevelopFromHome());

    document.getElementById('openTasksBtn').addEventListener('click', openTasks);
    document.getElementById('openGenericBtn').addEventListener('click', () => openTasks(true));
    document.getElementById('resetLocaleBtn').addEventListener('click', resetFocusLocale);
    document.getElementById('confirmFocusBtn').addEventListener('click', confirmFocusSelection);

    refs.photoInput.addEventListener('change', onChoosePhotos);
    document.getElementById('generateDraftBtn').addEventListener('click', () => buildDraft(false));
    document.getElementById('skipAiBtn').addEventListener('click', () => buildDraft(true));

    refs.showPhotoModeBtn.addEventListener('click', () => setSummaryMode('photo'));
    refs.showSketchModeBtn.addEventListener('click', () => setSummaryMode('sketch'));
    refs.sketchBtn.addEventListener('click', enableSketchMode);
    refs.reflectionInput.addEventListener('input', syncReflectionAnswer);
    document.getElementById('saveDiaryBtn').addEventListener('click', saveDiary);
    document.getElementById('backHomeBtn').addEventListener('click', () => showScreen('home'));

    document.querySelectorAll('[data-back]').forEach((button) => {
      button.addEventListener('click', () => showScreen(button.dataset.back));
    });
  }

  function bootstrap() {
    renderDate();
    renderHome();
    showScreen('home', true);
  }

  function renderDate() {
    const now = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const greetingHour = now.getHours();
    let greeting = '晚上好，慢慢看一会儿';
    if (greetingHour < 6) greeting = '夜深了，先让眼睛休息一下';
    else if (greetingHour < 12) greeting = '早上好，慢慢看一会儿';
    else if (greetingHour < 18) greeting = '下午好，慢慢看一会儿';
    refs.greetingText.textContent = greeting;
    refs.dateText.textContent = `${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekDays[now.getDay()]}`;
  }

  function renderHome() {
    const session = state.activeSession;
    const latestDiary = state.diaries[0] || null;

    if (!session) {
      refs.sessionNote.textContent = '今天还没给眼睛调焦';
      refs.focusEyebrow.textContent = '今天的眼睛';
      refs.focusCopy.textContent = '挑 1 到 3 张今天想带出去的纸条。';
      refs.focusAction.textContent = '挑几张纸条';
      refs.focusCarryNote.classList.add('hidden');
      refs.focusCopy.classList.remove('hidden');
      refs.developEyebrow.textContent = '把瞬间慢慢留下来';
      refs.developCopy.textContent = '回来以后，把今天的几张慢慢放进一页里。';
      refs.developAction.textContent = '走进暗房';
    } else if (session.status === 'completed') {
      refs.sessionNote.textContent = '今天已经显出来了';
      refs.focusEyebrow.textContent = '这一张已经留下来了';
      refs.focusCopy.textContent = '刚才带出去的线索已经落在这一页里。要不要再换一组新的？';
      refs.focusAction.textContent = '再挑一组';
      refs.focusCarryNote.classList.add('hidden');
      refs.focusCopy.classList.remove('hidden');
      refs.developEyebrow.textContent = '今天的一页';
      refs.developCopy.textContent = '再翻一翻今天那一页。';
      refs.developAction.textContent = '看看这一页';
    } else {
      const titles = joinTaskTitles(session.selectedTasks);
      refs.sessionNote.textContent = titles ? `今天带着：「${titles}」` : '今天带着几条线索出门';
      refs.focusEyebrow.textContent = '这个角度已经放进今天';
      refs.focusCarryNote.innerHTML = `<strong>${session.selectedTasks.length > 1 ? `今天带着 ${session.selectedTasks.length} 条线索` : session.selectedTasks[0].title}</strong><br>${titles}`;
      refs.focusCarryNote.classList.remove('hidden');
      refs.focusCopy.classList.add('hidden');
      refs.focusAction.textContent = '换一个角度';
      refs.developEyebrow.textContent = session.selectedTasks.length > 1 ? '等你带着这些线索回来' : `等你带着「${session.selectedTasks[0].title}」回来`;
      refs.developCopy.textContent = session.selectedTasks.length > 1
        ? `回来以后，把「${titles}」和路上真正吸引你的瞬间一起慢慢显出来。`
        : `回来以后，把刚才那张「${session.selectedTasks[0].title}」和照片一起慢慢显出来。`;
      refs.developAction.textContent = '我回来了';
    }

    if (state.diaries.length) {
      refs.recentSection.classList.remove('hidden');
      refs.emptyDesk.classList.add('hidden');
      refs.recentList.innerHTML = state.diaries.slice(0, 4).map((item, index) => `
        <article class="recent-item" data-recent-index="${index}">
          <img src="${item.photos[0].url}" alt="${escapeHtml(item.summary)}" />
          <div>
            <h4>${escapeHtml(item.summary || '一页散步')}</h4>
            <p>${escapeHtml(item.dateText || '')}</p>
          </div>
        </article>
      `).join('');
      refs.recentList.querySelectorAll('[data-recent-index]').forEach((node) => {
        node.addEventListener('click', () => {
          const item = state.diaries[Number(node.dataset.recentIndex)];
          if (!item) return;
          state.currentSummary = clone(item);
          state.currentImageIndex = 0;
          state.summaryMode = item.hasSketch ? 'sketch' : 'photo';
          renderSummary();
          showScreen('summary');
        });
      });
    } else {
      refs.recentSection.classList.add('hidden');
      refs.emptyDesk.classList.remove('hidden');
    }

    if (latestDiary && state.activeSession && state.activeSession.status === 'completed') {
      refs.sessionNote.textContent = '今天已经显出来了';
    }
  }

  function openFocusFromHome() {
    if (state.pageAnimating) return;
    refs.homeFocusPaper.classList.add('is-opening');
    triggerTransition('focus', () => {
      refs.homeFocusPaper.classList.remove('is-opening');
      showScreen('focus');
      resetFocusScreen();
    });
  }

  function openDevelopFromHome() {
    if (state.pageAnimating) return;
    refs.homeDevelopPaper.classList.add('is-opening');
    triggerTransition('develop', () => {
      refs.homeDevelopPaper.classList.remove('is-opening');
      showScreen('develop');
      renderDevelopScreen();
    });
  }

  function triggerTransition(type, done) {
    state.pageAnimating = true;
    refs.transition.classList.add('is-active');
    refs.transition.classList.toggle('page-transition--focus', type === 'focus');
    refs.transition.classList.toggle('page-transition--develop', type === 'develop');
    window.setTimeout(() => {
      done();
      refs.transition.classList.remove('is-active', 'page-transition--focus', 'page-transition--develop');
      state.pageAnimating = false;
    }, 430);
  }

  function showScreen(name, instant) {
    state.screen = name;
    Object.entries(refs.screens).forEach(([key, node]) => {
      node.classList.toggle('screen--active', key === name);
    });
    if (!instant && name === 'focus') {
      refs.focusPaper.classList.add('is-entering');
      window.setTimeout(() => refs.focusPaper.classList.remove('is-entering'), 380);
    }
  }

  function resetFocusScreen() {
    refs.focusHeadTitle.textContent = '今天想去哪儿走走？';
    refs.focusHeadSub.textContent = '写下来，我替你把那张纸打开。';
    refs.focusClosed.classList.remove('hidden');
    refs.focusOpen.classList.add('hidden');
    refs.focusBottomAction.classList.add('hidden');
    refs.focusAddress.value = '';
    refs.focusLocaleText.textContent = '今天没指定地方，先从普通街区开始';
    refs.taskList.innerHTML = '';
    state.tasks = [];
    state.selectedTaskIds = [];
    state.selectedTasks = [];
    refs.selectedTasksSummary.textContent = '';
  }

  function openTasks(useGeneric) {
    const address = useGeneric ? '' : refs.focusAddress.value.trim();
    refs.focusHeadTitle.textContent = address ? `去「${address}」之前` : '出门之前';
    refs.focusHeadSub.textContent = '挑 1 到 3 张想带出去的纸条。挑完，产品就退场。';
    refs.focusLocaleText.textContent = address ? `今天想去「${address}」走一段` : '今天没指定地方，先从普通街区开始';
    refs.focusClosed.classList.add('hidden');
    refs.focusOpen.classList.remove('hidden');
    state.tasks = buildTaskSet(address);
    renderTaskCards();
  }

  function resetFocusLocale() {
    resetFocusScreen();
  }

  function renderTaskCards() {
    refs.taskList.classList.toggle('has-selection', state.selectedTaskIds.length > 0);
    refs.taskList.innerHTML = state.tasks.map((task, index) => {
      const selected = state.selectedTaskIds.includes(task.id);
      return `
        <article id="task-${task.id}" class="task-card task-card--${index % 3} ${selected ? 'is-selected' : ''}" data-task-id="${task.id}">
          <div class="task-card__crease"></div>
          <p class="eyebrow">No. 0${index + 1}</p>
          <h4>${escapeHtml(task.title)}</h4>
          <p>${escapeHtml(task.subtitle)}</p>
          <div class="task-tags">${task.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          ${selected ? `<p>${escapeHtml(task.prompt)}</p>` : ''}
        </article>
      `;
    }).join('');

    refs.taskList.querySelectorAll('[data-task-id]').forEach((node) => {
      node.addEventListener('click', () => toggleTask(node.dataset.taskId));
    });

    refs.focusBottomAction.classList.toggle('hidden', state.selectedTaskIds.length === 0);
    refs.selectedTasksSummary.textContent = state.selectedTaskIds.length
      ? `先带 ${state.selectedTaskIds.length} 张出去：${joinTaskTitles(state.selectedTasks)}`
      : '';
    document.getElementById('confirmFocusBtn').textContent = state.selectedTaskIds.length > 1 ? '把这些折好，带出门' : '把它折好，带出门';
  }

  function toggleTask(taskId) {
    const existingIndex = state.selectedTaskIds.indexOf(taskId);
    if (existingIndex >= 0) {
      state.selectedTaskIds.splice(existingIndex, 1);
      state.selectedTasks.splice(existingIndex, 1);
    } else {
      if (state.selectedTaskIds.length >= 3) return;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      state.selectedTaskIds.push(taskId);
      state.selectedTasks.push(task);
    }
    renderTaskCards();
  }

  async function confirmFocusSelection() {
    if (!state.selectedTasks.length) return;
    const rects = state.selectedTaskIds.map((id) => {
      const el = document.getElementById(`task-${id}`);
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + Math.max(18, rect.height * 0.28),
        left: rect.left + rect.width * 0.5,
      };
    });

    document.querySelectorAll('.task-card.is-selected').forEach((node) => node.classList.add('is-folding'));
    launchPlanes(rects);

    state.activeSession = {
      id: `session_${Date.now()}`,
      status: 'focused',
      createdAt: Date.now(),
      selectedTasks: clone(state.selectedTasks),
    };
    save(STORAGE_KEYS.session, state.activeSession);

    window.setTimeout(() => {
      state.activeSession.status = 'focused';
      refs.focusLeavesLeft.classList.remove('is-swaying');
      refs.focusLeavesRight.classList.remove('is-swaying');
      renderHome();
      showScreen('home');
    }, 1700);
  }

  function launchPlanes(rects) {
    refs.planeLayer.innerHTML = '';
    rects.forEach((rect, index) => {
      const plane = document.createElement('div');
      plane.className = 'paper-plane';
      plane.style.top = `${rect.top}px`;
      plane.style.left = `${rect.left}px`;
      plane.style.animationDelay = `${index * 140}ms`;
      refs.planeLayer.appendChild(plane);
    });

    window.setTimeout(() => {
      refs.focusLeavesLeft.classList.add('is-swaying');
      refs.focusLeavesRight.classList.add('is-swaying');
    }, 380);

    window.setTimeout(() => {
      refs.planeLayer.innerHTML = '';
      document.querySelectorAll('.task-card.is-selected').forEach((node) => node.classList.remove('is-folding'));
    }, 1650);
  }

  function renderDevelopScreen() {
    const session = state.activeSession;
    if (session && session.selectedTasks && session.selectedTasks.length) {
      refs.developPageSub.textContent = session.selectedTasks.length > 1
        ? `带着「${joinTaskTitles(session.selectedTasks)}」回来了。`
        : `带着「${session.selectedTasks[0].title}」回来了。`;
      refs.developCarryNote.classList.remove('hidden');
      refs.developCarryNote.innerHTML = `<strong>${session.selectedTasks.length > 1 ? `这次带着 ${session.selectedTasks.length} 条线索` : `「${session.selectedTasks[0].title}」`}</strong><br>${joinTaskTitles(session.selectedTasks)}`;
    } else {
      refs.developPageSub.textContent = '没有调焦也可以显影今天。';
      refs.developCarryNote.classList.add('hidden');
    }
    renderPhotoGrid();
  }

  function onChoosePhotos(event) {
    const files = Array.from(event.target.files || []).slice(0, 9 - state.photoItems.length);
    files.forEach((file) => {
      state.photoItems.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        url: URL.createObjectURL(file),
      });
    });
    renderPhotoGrid();
    refs.photoInput.value = '';
  }

  function renderPhotoGrid() {
    refs.photoCountText.textContent = `${state.photoItems.length} / 9`;
    refs.photoGrid.innerHTML = state.photoItems.map((item, index) => `
      <div class="photo-item">
        <img src="${item.url}" alt="照片 ${index + 1}" />
        <button type="button" data-remove-index="${index}">×</button>
      </div>
    `).join('');
    refs.photoGrid.querySelectorAll('[data-remove-index]').forEach((node) => {
      node.addEventListener('click', () => {
        state.photoItems.splice(Number(node.dataset.removeIndex), 1);
        renderPhotoGrid();
      });
    });
  }

  function buildDraft(skipAi) {
    if (!state.photoItems.length) return;

    const session = state.activeSession;
    if (session && session.status === 'focused') {
      session.status = 'developing';
      save(STORAGE_KEYS.session, session);
    }

    refs.loadingOverlay.classList.remove('hidden');
    refs.loadingText.textContent = skipAi ? '把这一页慢慢放平…' : '我试着帮你看见它…';
    refs.loadingSub.textContent = `已带回 ${state.photoItems.length} / ${state.photoItems.length}`;

    window.setTimeout(() => {
      const draft = createDraft(skipAi);
      state.currentSummary = draft;
      state.draft = draft;
      save(STORAGE_KEYS.draft, draft);
      refs.loadingOverlay.classList.add('hidden');
      renderSummary();
      showScreen('summary');
    }, skipAi ? 900 : 1300);
  }

  function createDraft(skipAi) {
    const session = state.activeSession;
    const selectedTasks = session && session.selectedTasks ? clone(session.selectedTasks) : [];
    const selectedTask = selectedTasks[0] || null;
    const photoReadings = state.photoItems.map((item, index) => ({
      index,
      url: item.url,
      reading: buildReading(index, selectedTasks),
    }));
    const reflectionQuestion = selectedTasks.length
      ? (selectedTasks.length > 1
        ? '带着这些线索走时，最先留住你的是哪一处？'
        : `带着「${selectedTasks[0].title}」走时，什么先留住了你？`)
      : '如果给这段散步留一句话，你会写什么？';

    return {
      id: `draft_${Date.now()}`,
      dateText: formatDisplayDate(),
      locationText: refs.focusAddress.value.trim() || '',
      selectedTasks,
      selectedTask,
      skippedTask: !selectedTasks.length,
      photos: clone(state.photoItems),
      photoReadings,
      reflectionQuestion,
      reflectionAnswer: '',
      summary: skipAi ? fallbackSummary(selectedTasks) : buildSummary(selectedTasks, state.photoItems.length),
      hasSketch: false,
    };
  }

  function renderSummary() {
    const summary = state.currentSummary || state.draft;
    if (!summary) return;
    refs.summaryDateText.textContent = summary.dateText || formatDisplayDate();
    refs.summaryLocationText.textContent = summary.locationText || '';
    refs.summaryLocationText.classList.toggle('hidden', !summary.locationText);

    if (summary.selectedTasks && summary.selectedTasks.length) {
      refs.summaryTaskCard.classList.remove('hidden');
      refs.summaryTaskCard.innerHTML = `
        <p class="eyebrow">出门前带着的线索</p>
        <p class="summary-card__body"><strong>${escapeHtml(joinTaskTitles(summary.selectedTasks))}</strong></p>
        <p class="summary-card__body">${summary.selectedTasks.length === 1 ? escapeHtml(summary.selectedTasks[0].prompt) : '它们只是出门前带上的几条线索，不是必须完成的目标。真正让你停下来的，还是街道后来交给你的东西。'}</p>
      `;
    } else {
      refs.summaryTaskCard.classList.add('hidden');
    }

    refs.readingText.textContent = summary.photoReadings[state.currentImageIndex]?.reading || '';
    refs.questionText.textContent = summary.reflectionQuestion || '';
    refs.summaryText.textContent = summary.summary || '';
    refs.reflectionInput.value = summary.reflectionAnswer || '';

    refs.thumbRow.innerHTML = summary.photos.map((item, index) => `
      <button class="thumb-item" data-thumb-index="${index}" type="button">
        <img src="${item.url}" alt="缩略图 ${index + 1}" />
      </button>
    `).join('');
    refs.thumbRow.querySelectorAll('[data-thumb-index]').forEach((node) => {
      node.addEventListener('click', () => {
        state.currentImageIndex = Number(node.dataset.thumbIndex);
        updateSummaryImage();
      });
    });

    setSummaryMode(summary.hasSketch ? 'sketch' : 'photo');
    updateSummaryImage();
  }

  function updateSummaryImage() {
    const summary = state.currentSummary || state.draft;
    if (!summary || !summary.photos.length) return;
    const item = summary.photos[state.currentImageIndex] || summary.photos[0];
    refs.summaryMainImage.src = item.url;
    refs.summaryCounter.textContent = `${state.currentImageIndex + 1} / ${summary.photos.length}`;
    refs.readingText.textContent = summary.photoReadings[state.currentImageIndex]?.reading || summary.photoReadings[0]?.reading || '';
  }

  function setSummaryMode(mode) {
    state.summaryMode = mode;
    const frame = refs.summaryMainImage.closest('.summary-stage__frame');
    frame.classList.toggle('is-sketch', mode === 'sketch');
    refs.showPhotoModeBtn.classList.toggle('switch-pill--active', mode === 'photo');
    refs.showSketchModeBtn.classList.toggle('switch-pill--active', mode === 'sketch');
  }

  function enableSketchMode() {
    const summary = state.currentSummary || state.draft;
    if (!summary) return;
    refs.loadingOverlay.classList.remove('hidden');
    refs.loadingText.textContent = '显影成手绘版…';
    refs.loadingSub.textContent = 'Web Demo 版会模拟一层纸上记忆感';
    window.setTimeout(() => {
      refs.loadingOverlay.classList.add('hidden');
      summary.hasSketch = true;
      setSummaryMode('sketch');
    }, 1000);
  }

  function syncReflectionAnswer() {
    const summary = state.currentSummary || state.draft;
    if (!summary) return;
    summary.reflectionAnswer = refs.reflectionInput.value;
    if (state.draft && summary.id === state.draft.id) {
      save(STORAGE_KEYS.draft, summary);
    }
  }

  function saveDiary() {
    const summary = state.currentSummary || state.draft;
    if (!summary) return;

    summary.reflectionAnswer = refs.reflectionInput.value.trim();
    summary.dateText = formatDisplayDate();
    const saved = {
      ...clone(summary),
      id: `diary_${Date.now()}`,
      savedAt: Date.now(),
    };

    state.diaries.unshift(saved);
    state.diaries = state.diaries.slice(0, 12);
    save(STORAGE_KEYS.diaries, state.diaries);

    if (state.activeSession) {
      state.activeSession.status = 'completed';
      state.activeSession.completedAt = Date.now();
      save(STORAGE_KEYS.session, state.activeSession);
    }

    state.currentSummary = saved;
    state.draft = null;
    save(STORAGE_KEYS.draft, null);
    renderHome();
    showScreen('home');
  }

  function buildTaskSet(address) {
    if (!address) return clone(fallbackTasks);
    return [
      {
        id: 'task_window_story',
        title: '门缝里的旧蓝',
        subtitle: `去「${address}」时，看看褪色停在哪里。`,
        prompt: `在「${address}」附近，找一扇让你愿意停一下的门，不用解释它。`,
        tags: ['门缝', '旧漆', '旧蓝'],
      },
      {
        id: 'task_tree_light',
        title: '树影碰到建筑的时候',
        subtitle: '不是树本身，是它挨近墙面的一刻。',
        prompt: `在「${address}」附近，留意树影落到墙面、窗沿或屋檐上的时候。`,
        tags: ['树影', '墙面', '微光'],
      },
      {
        id: 'task_time_corner',
        title: '被时间磨亮的边角',
        subtitle: '也许是扶手，也许是门把手旁边。',
        prompt: `在「${address}」附近，看看哪些地方被反复经过、反复触碰过。`,
        tags: ['磨痕', '边角', '金属'],
      },
    ];
  }

  function buildReading(index, selectedTasks) {
    const lines = [
      '你停在这里，像是先看见了安静。',
      '这一眼留下来的，是光和表面的呼吸。',
      '吸引你的也许不是主体，而是它旁边的余白。',
      '它没有招呼你，却让你慢了一步。',
    ];
    if (selectedTasks.length > 1 && index === 0) {
      return '几条出门前带上的线索，在这里慢慢碰到了一起。';
    }
    if (selectedTasks.length === 1 && index === 0) {
      return `你像是在替「${selectedTasks[0].title}」找一个落点。`;
    }
    return lines[index % lines.length];
  }

  function buildSummary(selectedTasks, photoCount) {
    if (selectedTasks.length > 1) {
      return '街上的细节慢慢把这些线索都带回到了你手里。';
    }
    if (selectedTasks.length === 1) {
      return `那条街把「${selectedTasks[0].title}」慢慢交给了你。`;
    }
    return photoCount > 1 ? '你带回来了几处值得停一下的瞬间。' : '这一眼先被留下来，已经足够了。';
  }

  function fallbackSummary(selectedTasks) {
    if (selectedTasks.length) {
      return selectedTasks.length > 1 ? '先把这些线索和照片轻轻放在一起。' : `先把「${selectedTasks[0].title}」和照片轻轻放在一起。`;
    }
    return '先把今天带回来的这一眼轻轻放好。';
  }

  function joinTaskTitles(tasks) {
    return (tasks || []).map((item) => item.title).filter(Boolean).slice(0, 3).join(' / ');
  }

  function formatDisplayDate() {
    const now = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} 星期${weekDays[now.getDay()]}`;
  }

  function save(key, value) {
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  function load(key, fallbackValue) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallbackValue;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
