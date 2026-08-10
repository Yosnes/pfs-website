(() => {
  'use strict';

  const screens = [...document.querySelectorAll('.screen')];
  const backButton = document.getElementById('back-button');
  const stepLabel = document.getElementById('step-label');
  const meterFill = document.getElementById('meter-fill');
  const announcement = document.getElementById('announcement');
  const sessionKey = 'pfs-career-navigator-prototype';

  const pathTitles = {
    adjacent: 'Director of Customer Operations',
    growth: 'Product Operations Lead',
    reinvention: 'Independent Experience Consultant'
  };

  const state = {
    screen: 1,
    name: '',
    email: '',
    consent: true,
    resumeReady: false,
    path: 'growth',
    timeline: 'now',
    priorities: ['Meaningful work', 'Higher income', 'Stability'],
    feedback: {},
    skills: {
      explicit: ['Team leadership', 'Process improvement', 'Customer experience', 'Performance measurement', 'Stakeholder management'],
      inferred: ['Change management', 'Product operations', 'Service design']
    }
  };

  const plans = {
    now: {
      intro: 'Because you’re looking now, the first 30 days focus on visibility, conversations, and targeted applications.',
      phases: [
        ['Days 1–30', 'Position and activate', ['Rewrite your résumé and headline', 'Build a 30-company target list', 'Hold 8 focused conversations']],
        ['Days 31–60', 'Create interview momentum', ['Apply selectively each week', 'Build 5 evidence stories', 'Close one priority skill gap']],
        ['Days 61–90', 'Convert and choose', ['Prepare role-specific cases', 'Evaluate fit, not only salary', 'Negotiate from your priorities']]
      ],
      action: ['Rewrite your headline around product operations.', 'Lead with the bridge between customer insight, operational systems, and cross-functional delivery.']
    },
    soon: {
      intro: 'Because you want to move soon while employed, the plan protects your current position while building a discreet pipeline.',
      phases: [
        ['Days 1–30', 'Clarify and position', ['Define your non-negotiables', 'Update materials privately', 'Reconnect with trusted contacts']],
        ['Days 31–60', 'Test the market', ['Hold discreet exploratory calls', 'Research priority employers', 'Complete one visible proof project']],
        ['Days 61–90', 'Make the move', ['Begin targeted applications', 'Practice transition stories', 'Compare opportunities deliberately']]
      ],
      action: ['Schedule three discreet market conversations.', 'Choose people who can validate the role, the culture, and the skills employers actually value.']
    },
    'one-three': {
      intro: 'Your 1–3 month timeline gives you room to improve positioning before beginning a focused search.',
      phases: [
        ['Days 1–30', 'Research and reframe', ['Interview 5 people in the field', 'Rewrite your value proposition', 'Identify your strongest proof']],
        ['Days 31–60', 'Build credibility', ['Complete a focused skill sprint', 'Create a small proof project', 'Expand your target network']],
        ['Days 61–90', 'Enter the market', ['Launch targeted outreach', 'Apply to high-fit roles', 'Refine from response data']]
      ],
      action: ['Interview one Product Operations leader.', 'Ask what their team owns, which backgrounds translate well, and what proof gets candidates noticed.']
    },
    'three-six': {
      intro: 'Your 3–6 month timeline allows you to test the pathway and build evidence before committing to a move.',
      phases: [
        ['Days 1–30', 'Explore deeply', ['Map the role ecosystem', 'Run 5 curiosity interviews', 'Audit your experience gaps']],
        ['Days 31–60', 'Run a small experiment', ['Take on an adjacent project', 'Learn one priority method', 'Document measurable results']],
        ['Days 61–90', 'Build your bridge', ['Create a portfolio case', 'Strengthen 10 relationships', 'Decide whether to pursue']]
      ],
      action: ['Find one product-adjacent project in your current role.', 'Use it to test your interest and create evidence before making a larger commitment.']
    },
    exploring: {
      intro: 'With no fixed deadline, your plan emphasizes low-risk experiments that create clarity through experience.',
      phases: [
        ['Days 1–30', 'Follow the energy', ['Notice work that pulls you in', 'Explore all three pathways', 'Speak with 3 role models']],
        ['Days 31–60', 'Test assumptions', ['Try one micro-project', 'Join a relevant community', 'Track energy and curiosity']],
        ['Days 61–90', 'Choose the next test', ['Compare what you learned', 'Name your strongest direction', 'Design a deeper experiment']]
      ],
      action: ['Choose one two-hour pathway experiment.', 'Test the work itself before judging whether you are qualified to make the change.']
    }
  };

  function saveState() {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(state));
    } catch (_) {
      // The prototype still works when browser storage is unavailable.
    }
  }

  function restoreState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey));
      if (saved && typeof saved === 'object') Object.assign(state, saved);
    } catch (_) {
      sessionStorage.removeItem(sessionKey);
    }
  }

  function journeyStage(screen) {
    if (screen <= 1) return 1;
    if (screen <= 4) return 2;
    if (screen <= 6) return 3;
    return 4;
  }

  function updateJourney(screen) {
    const activeStage = journeyStage(screen);
    document.querySelectorAll('.journey-steps li').forEach((item) => {
      const stage = Number(item.dataset.stage);
      item.classList.toggle('active', stage === activeStage);
      item.classList.toggle('complete', stage < activeStage);
    });
  }

  function showScreen(number, options = {}) {
    const next = Math.max(1, Math.min(8, Number(number)));
    state.screen = next;
    screens.forEach((screen) => screen.classList.toggle('active', Number(screen.dataset.screen) === next));
    backButton.hidden = next === 1 || next === 3 || next === 8;
    stepLabel.textContent = `Step ${next} of 8`;
    meterFill.style.width = `${next * 12.5}%`;
    updateJourney(next);
    announcement.textContent = `Step ${next} of 8`;
    saveState();

    if (next === 3 && !options.skipProcessing) runProcessing();
    if (next === 4) renderSkills();
    if (next === 7) renderPlan();
    if (next === 8) document.getElementById('delivery-email').textContent = state.email || 'your email address';
    renderScreenFeedback(next);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const heading = document.querySelector(`.screen[data-screen="${next}"] h2`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      setTimeout(() => heading.focus({ preventScroll: true }), 60);
    }
  }

  function previousScreen() {
    const overrides = { 4: 2, 7: 6 };
    showScreen(overrides[state.screen] || state.screen - 1, { skipProcessing: true });
  }

  function validateContact() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    name.removeAttribute('aria-invalid');
    email.removeAttribute('aria-invalid');

    if (!name.value.trim()) {
      document.getElementById('name-error').textContent = 'Please enter a name.';
      name.setAttribute('aria-invalid', 'true');
      valid = false;
    }
    if (!emailPattern.test(email.value.trim())) {
      document.getElementById('email-error').textContent = 'Please enter a valid email address.';
      email.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (valid) {
      state.name = name.value.trim();
      state.email = email.value.trim();
      state.consent = document.getElementById('contact-consent').checked;
    }
    return valid;
  }

  function setResumeReady(title, subtitle) {
    state.resumeReady = true;
    document.getElementById('upload-zone').classList.add('ready');
    document.getElementById('upload-title').textContent = title;
    document.getElementById('upload-subtitle').textContent = subtitle;
    document.querySelector('.upload-button').textContent = 'Change file';
    document.getElementById('analyze-resume').disabled = false;
    saveState();
  }

  function handleFile(file) {
    if (!file) return;
    const allowed = ['pdf', 'docx', 'txt'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(extension) || file.size > 10 * 1024 * 1024) {
      document.getElementById('upload-title').textContent = 'Choose a PDF, DOCX, or TXT under 10 MB';
      document.getElementById('upload-subtitle').textContent = 'That file cannot be used in this prototype.';
      return;
    }
    setResumeReady(file.name, 'Selected locally · It will not be uploaded in this prototype');
  }

  function runProcessing() {
    const items = [...document.querySelectorAll('#processing-list li')];
    const continueButton = document.getElementById('continue-profile');
    continueButton.hidden = true;
    items.forEach((item) => item.classList.remove('done'));
    items.forEach((item, index) => {
      setTimeout(() => item.classList.add('done'), 450 + index * 520);
    });
    setTimeout(() => {
      continueButton.hidden = false;
      announcement.textContent = 'Your sample career profile is ready to review.';
    }, 2850);
  }

  function renderScreenFeedback(screenNumber) {
    const panel = document.getElementById('screen-feedback');
    const comment = document.getElementById('screen-feedback-comment');
    const response = document.getElementById('screen-feedback-response');
    const text = document.getElementById('screen-feedback-text');
    const saved = state.feedback[String(screenNumber)] || {};

    panel.hidden = screenNumber === 8;
    document.getElementById('feedback-screen-number').textContent = screenNumber;
    document.querySelectorAll('[data-screen-feedback]').forEach((button) => {
      const selected = button.dataset.screenFeedback === saved.rating;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    comment.hidden = !saved.rating;
    text.value = saved.comment || '';
    response.textContent = saved.rating ? 'Thanks — saved in this prototype.' : '';
  }

  function saveScreenFeedback(rating) {
    const key = String(state.screen);
    const existing = state.feedback[key] || {};
    state.feedback[key] = { ...existing, rating };
    saveState();
    renderScreenFeedback(state.screen);
    document.getElementById('screen-feedback-text').focus();
  }

  function skillMarkup(skill, type) {
    const safeSkill = skill.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
    return `<span class="skill-chip ${type === 'inferred' ? 'inferred' : ''}">${safeSkill}<button type="button" data-remove-skill="${encodeURIComponent(skill)}" data-skill-type="${type}" aria-label="Remove ${safeSkill}">×</button></span>`;
  }

  function renderSkills() {
    document.getElementById('explicit-skills').innerHTML = state.skills.explicit.map((skill) => skillMarkup(skill, 'explicit')).join('');
    document.getElementById('inferred-skills').innerHTML = state.skills.inferred.map((skill) => skillMarkup(skill, 'inferred')).join('');
    const count = state.skills.explicit.length + state.skills.inferred.length;
    document.getElementById('skill-count').textContent = `${count} identified`;
  }

  function removeSkill(type, encodedSkill) {
    const skill = decodeURIComponent(encodedSkill);
    state.skills[type] = state.skills[type].filter((item) => item !== skill);
    renderSkills();
    saveState();
  }

  function addSkill() {
    const input = document.getElementById('new-skill');
    const skill = input.value.trim();
    if (!skill) return;
    const allSkills = [...state.skills.explicit, ...state.skills.inferred].map((item) => item.toLowerCase());
    if (!allSkills.includes(skill.toLowerCase())) state.skills.explicit.push(skill);
    input.value = '';
    renderSkills();
    saveState();
  }

  function selectPath(path) {
    state.path = path;
    document.querySelectorAll('.pathway-card').forEach((card) => {
      const selected = card.dataset.path === path;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      card.querySelector('.select-indicator').textContent = selected ? 'Selected' : 'Select';
    });
    saveState();
  }

  function renderPlan() {
    const plan = plans[state.timeline] || plans.now;
    document.getElementById('plan-intro').textContent = plan.intro;
    document.getElementById('selected-path-title').textContent = pathTitles[state.path];
    document.getElementById('plan-timeline').innerHTML = plan.phases.map((phase) => `
      <article class="plan-phase">
        <span>${phase[0]}</span>
        <h3>${phase[1]}</h3>
        <ul>${phase[2].map((item) => `<li>${item}</li>`).join('')}</ul>
      </article>
    `).join('');
    document.getElementById('first-action-title').textContent = plan.action[0];
    document.getElementById('first-action-copy').textContent = plan.action[1];
  }

  function openCalendly() {
    const url = 'https://calendly.com/andrew-projectfutureself/30min';
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  restoreState();

  document.getElementById('contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateContact()) showScreen(2);
  });

  document.getElementById('sample-details').addEventListener('click', () => {
    document.getElementById('name').value = 'Alex Morgan';
    document.getElementById('email').value = 'alex.morgan@example.com';
    document.getElementById('contact-consent').checked = true;
  });

  const uploadZone = document.getElementById('upload-zone');
  const resumeInput = document.getElementById('resume-file');
  resumeInput.addEventListener('change', () => handleFile(resumeInput.files[0]));
  ['dragenter', 'dragover'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.remove('dragging');
  }));
  uploadZone.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));

  document.getElementById('resume-text').addEventListener('input', (event) => {
    if (event.target.value.trim().length >= 80) setResumeReady('Pasted résumé text ready', 'Sample processing only · Text remains in this browser tab');
  });
  document.getElementById('sample-resume').addEventListener('click', () => setResumeReady('Alex-Morgan-Sample-Resume.pdf', 'Fictional sample résumé · Ready to preview'));
  document.getElementById('analyze-resume').addEventListener('click', () => showScreen(3));
  document.getElementById('continue-profile').addEventListener('click', () => showScreen(4, { skipProcessing: true }));

  document.addEventListener('click', (event) => {
    const nextButton = event.target.closest('[data-next]');
    const backToButton = event.target.closest('[data-back-to]');
    const removeButton = event.target.closest('[data-remove-skill]');
    if (nextButton) showScreen(nextButton.dataset.next);
    if (backToButton) showScreen(backToButton.dataset.backTo);
    if (removeButton) removeSkill(removeButton.dataset.skillType, removeButton.dataset.removeSkill);
  });

  backButton.addEventListener('click', previousScreen);
  document.getElementById('add-skill').addEventListener('click', addSkill);
  document.getElementById('new-skill').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  });
  document.getElementById('edit-summary').addEventListener('click', () => document.getElementById('career-summary').focus());

  document.getElementById('priority-options').addEventListener('change', (event) => {
    const checked = [...document.querySelectorAll('#priority-options input:checked')];
    if (checked.length > 3) {
      event.target.checked = false;
      document.getElementById('priority-error').textContent = 'Choose up to three priorities.';
    } else {
      document.getElementById('priority-error').textContent = '';
    }
  });

  document.getElementById('goals-form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.timeline = document.querySelector('input[name="timeline"]:checked').value;
    state.priorities = [...document.querySelectorAll('#priority-options input:checked')].map((input) => input.value);
    showScreen(6);
  });

  document.querySelectorAll('.pathway-card').forEach((card) => card.addEventListener('click', () => selectPath(card.dataset.path)));
  document.getElementById('choose-pathway').addEventListener('click', () => showScreen(7));

  document.querySelectorAll('.rating-buttons button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.rating-buttons button').forEach((item) => item.classList.toggle('selected', item === button));
    document.getElementById('rating-response').textContent = 'Thank you — this will be recorded in the live pilot.';
  }));

  document.querySelectorAll('[data-screen-feedback]').forEach((button) => button.addEventListener('click', () => {
    saveScreenFeedback(button.dataset.screenFeedback);
  }));
  document.getElementById('screen-feedback-text').addEventListener('input', (event) => {
    const key = String(state.screen);
    const existing = state.feedback[key] || {};
    state.feedback[key] = { ...existing, comment: event.target.value };
    saveState();
  });

  document.getElementById('calendly-button').addEventListener('click', openCalendly);
  document.getElementById('restart').addEventListener('click', () => {
    sessionStorage.removeItem(sessionKey);
    window.location.reload();
  });

  if (state.name) document.getElementById('name').value = state.name;
  if (state.email) document.getElementById('email').value = state.email;
  document.getElementById('contact-consent').checked = state.consent;
  document.querySelectorAll('input[name="timeline"]').forEach((input) => { input.checked = input.value === state.timeline; });
  document.querySelectorAll('#priority-options input').forEach((input) => { input.checked = state.priorities.includes(input.value); });
  selectPath(state.path);
  if (state.resumeReady) setResumeReady('Sample résumé selected', 'Ready to continue the prototype');

  if (state.screen === 3) state.screen = 2;
  showScreen(state.screen, { skipProcessing: true });
})();
