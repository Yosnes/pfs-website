(() => {
  'use strict';

  const screens = [...document.querySelectorAll('.screen')];
  const backButton = document.getElementById('back-button');
  const stepLabel = document.getElementById('step-label');
  const meterFill = document.getElementById('meter-fill');
  const announcement = document.getElementById('announcement');
  const sessionKey = 'pfs-career-navigator-pilot-v2';
  const localHost = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  const isLocalPreview = (window.location.protocol === 'file:' || localHost) && !new URLSearchParams(window.location.search).has('live');
  let selectedResumeFile = null;
  let pastedResumeText = '';

  const pathTitles = {
    adjacent: 'Director of Customer Operations',
    growth: 'Product Operations Lead',
    reinvention: 'Independent Experience Consultant'
  };

  const sampleProfile = {
    summary: 'Operations and customer-experience leader with 12+ years guiding cross-functional teams, improving service delivery, and turning complex problems into measurable business results.',
    current_role: 'Senior Operations Manager',
    experience_context: 'National service organization · 2019–Present',
    achievements: ['Led a 24-person, cross-functional service team', 'Reduced customer response time by 31%', 'Introduced performance dashboards used by senior leadership'],
    explicit_skills: ['Team leadership', 'Process improvement', 'Customer experience', 'Performance measurement', 'Stakeholder management'],
    inferred_skills: ['Change management', 'Product operations', 'Service design']
  };

  const samplePathways = [
    { id: 'adjacent', type: 'Adjacent move', title: 'Director of Customer Operations', description: 'Build on your operations leadership while moving closer to customer strategy and organizational influence.', fit_reason: 'The fastest transition from your confirmed experience.', tags: ['Fastest transition', 'Strong evidence'], confirmed_skills_used: ['Team leadership', 'Customer experience', 'Performance measurement'] },
    { id: 'growth', type: 'Growth move', title: 'Product Operations Lead', description: 'Translate customer and operational insight into better product decisions, launches, and cross-functional execution.', fit_reason: 'A credible stretch that uses six confirmed skills.', tags: ['High growth', 'Uses 6 confirmed skills'], confirmed_skills_used: ['Process improvement', 'Customer experience', 'Stakeholder management'] },
    { id: 'reinvention', type: 'Reinvention move', title: 'Independent Experience Consultant', description: 'Package your leadership and service-transformation expertise into advisory work for growing organizations.', fit_reason: 'A more independent direction worth testing before committing.', tags: ['More autonomy', 'Requires market testing'], confirmed_skills_used: ['Change management', 'Service design', 'Team leadership'] }
  ];

  const timelineLabels = {
    now: 'Out of work and looking now',
    soon: 'As soon as possible, while employed',
    'one-three': 'Within 1–3 months',
    'three-six': 'Within 3–6 months',
    exploring: 'Exploring without a fixed deadline'
  };

  const state = {
    screen: 1,
    name: '',
    email: '',
    consent: true,
    resumeReady: false,
    sampleMode: false,
    sessionId: (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
    path: 'growth',
    timeline: 'now',
    priorities: ['Meaningful work', 'Higher income', 'Stability'],
    leaveBehind: 'Constant firefighting and roles where customer insight is ignored.',
    feedback: {},
    profile: { ...sampleProfile },
    pathways: samplePathways.map((pathway) => ({ ...pathway })),
    skills: {
      explicit: ['Team leadership', 'Process improvement', 'Customer experience', 'Performance measurement', 'Stakeholder management'],
      inferred: ['Change management', 'Product operations', 'Service design']
    }
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  async function apiRequest(path, payload) {
    if (isLocalPreview) throw new Error('The local preview cannot connect to the secure pilot services. Use the sample résumé here, or test a deployed development preview.');
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
    return result;
  }

  function setBusy(button, busy, label) {
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.innerHTML;
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    button.innerHTML = busy ? label : button.dataset.originalLabel;
  }

  const plans = {
    now: {
      intro: 'Because you’re looking now, your search begins today. The first week creates immediate visibility, applications, and conversations while you keep improving your positioning.',
      phases: [
        ['Days 1–7', 'Launch immediately', ['Update your résumé and headline in 48 hours', 'Apply to 5–8 strong-fit roles', 'Contact 10 people in your network']],
        ['Days 8–30', 'Build interview momentum', ['Continue targeted applications each week', 'Hold 8 focused conversations', 'Prepare and practise 5 evidence stories']],
        ['Days 31–60', 'Convert the pipeline', ['Follow up and expand your target list', 'Prepare for role-specific interviews', 'Evaluate and negotiate opportunities']]
      ],
      action: ['Apply to one strong-fit role today.', 'Tailor your opening summary to the role, then send two messages to people who may know the team.'],
      badge: 'Today'
    },
    soon: {
      intro: 'Because you want to move soon while employed, the plan protects your current position while building a discreet pipeline.',
      phases: [
        ['Days 1–7', 'Clarify and position', ['Define your non-negotiables', 'Update materials privately', 'Identify 15 priority employers']],
        ['Days 8–30', 'Enter the market discreetly', ['Reconnect with trusted contacts', 'Begin targeted applications', 'Hold 5 exploratory conversations']],
        ['Days 31–90', 'Interview and choose', ['Build role-specific evidence stories', 'Interview without risking your current role', 'Compare opportunities deliberately']]
      ],
      action: ['Schedule three discreet market conversations.', 'Choose people who can validate the role, the culture, and the skills employers actually value.'],
      badge: 'Within 3 days'
    },
    'one-three': {
      intro: 'Your 1–3 month timeline gives you a short positioning window, followed by outreach and applications early enough to make the move on schedule.',
      phases: [
        ['Days 1–14', 'Research and reframe', ['Interview 3 people in the field', 'Rewrite your value proposition', 'Identify your strongest proof']],
        ['Days 15–45', 'Build and activate', ['Complete a focused skill sprint', 'Create a small proof project', 'Begin targeted outreach and applications']],
        ['Days 46–90', 'Interview and transition', ['Apply to high-fit roles each week', 'Practise role-specific stories', 'Refine from response data']]
      ],
      action: ['Interview one Product Operations leader.', 'Ask what their team owns, which backgrounds translate well, and what proof gets candidates noticed.'],
      badge: 'This week'
    },
    'three-six': {
      intro: 'Your 3–6 month timeline allows you to test the pathway and build evidence before committing to a move.',
      phases: [
        ['Months 1–2', 'Explore and test', ['Map the role ecosystem', 'Run 5 curiosity interviews', 'Audit your experience gaps']],
        ['Months 3–4', 'Build your bridge', ['Take on an adjacent project', 'Learn one priority method', 'Document measurable results']],
        ['Months 5–6', 'Enter the market', ['Create a portfolio case', 'Begin targeted outreach and applications', 'Prepare your transition story']]
      ],
      action: ['Find one product-adjacent project in your current role.', 'Use it to test your interest and create evidence before making a larger commitment.'],
      badge: 'This month'
    },
    exploring: {
      intro: 'With no fixed deadline, your plan emphasizes low-risk experiments that create clarity through experience.',
      phases: [
        ['Days 1–30', 'Follow the energy', ['Notice work that pulls you in', 'Explore all three pathways', 'Speak with 3 role models']],
        ['Days 31–60', 'Test assumptions', ['Try one micro-project', 'Join a relevant community', 'Track energy and curiosity']],
        ['Days 61–90', 'Choose the next test', ['Compare what you learned', 'Name your strongest direction', 'Design a deeper experiment']]
      ],
      action: ['Choose one two-hour pathway experiment.', 'Test the work itself before judging whether you are qualified to make the change.'],
      badge: 'This week'
    }
  };

  function saveState() {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(state));
    } catch (_) {
      // The journey still works when browser storage is unavailable.
    }
  }

  function restoreState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey));
      if (saved && typeof saved === 'object') {
        Object.assign(state, saved);
        state.profile = { ...sampleProfile, ...(saved.profile || {}) };
        state.skills = {
          explicit: Array.isArray(saved.skills?.explicit) ? saved.skills.explicit : [...sampleProfile.explicit_skills],
          inferred: Array.isArray(saved.skills?.inferred) ? saved.skills.inferred : [...sampleProfile.inferred_skills]
        };
        state.pathways = Array.isArray(saved.pathways) && saved.pathways.length === 3
          ? saved.pathways
          : samplePathways.map((pathway) => ({ ...pathway }));
      }
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
    if (next === 4) renderProfile();
    if (next === 6) renderPathways();
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
      document.getElementById('upload-subtitle').textContent = 'That file cannot be used.';
      return;
    }
    selectedResumeFile = file;
    pastedResumeText = '';
    state.sampleMode = false;
    document.getElementById('resume-text').value = '';
    setResumeReady(file.name, 'Selected locally · The original file stays on this device');
  }

  function markProcessingStep(items, index) {
    if (items[index]) items[index].classList.add('done');
  }

  async function runProcessing() {
    const items = [...document.querySelectorAll('#processing-list li')];
    const continueButton = document.getElementById('continue-profile');
    const error = document.getElementById('processing-error');
    const note = document.getElementById('processing-note');
    continueButton.hidden = true;
    backButton.hidden = true;
    error.hidden = true;
    items.forEach((item) => item.classList.remove('done'));

    try {
      if (state.sampleMode) {
        note.textContent = 'Using fictional sample information. No AI request is being made.';
        items.forEach((item, index) => setTimeout(() => markProcessingStep(items, index), 300 + index * 350));
        await new Promise((resolve) => setTimeout(resolve, 1750));
        state.profile = { ...sampleProfile };
        state.skills = { explicit: [...sampleProfile.explicit_skills], inferred: [...sampleProfile.inferred_skills] };
        state.pathways = samplePathways.map((pathway) => ({ ...pathway }));
      } else {
        note.textContent = 'Your original file is being read only in this browser.';
        let extractedText = pastedResumeText;
        if (selectedResumeFile) extractedText = await window.PFSResume.extractFileText(selectedResumeFile);
        markProcessingStep(items, 0);

        const anonymized = window.PFSResume.anonymize(extractedText, { name: state.name, email: state.email });
        extractedText = '';
        selectedResumeFile = null;
        resumeInput.value = '';
        if (anonymized.text.length < 250) throw new Error('We could not find enough readable résumé text. Try pasting the résumé text instead.');
        markProcessingStep(items, 1);
        note.textContent = `${anonymized.totalRedactions} personal detail${anonymized.totalRedactions === 1 ? '' : 's'} removed. Sending anonymized text for analysis.`;

        const result = await apiRequest('/api/career-navigator-analyze', {
          resumeText: anonymized.text,
          sessionId: state.sessionId
        });
        markProcessingStep(items, 2);
        state.profile = result.profile;
        state.skills = {
          explicit: [...result.profile.explicit_skills],
          inferred: [...result.profile.inferred_skills]
        };
        markProcessingStep(items, 3);
      }

      renderProfile();
      saveState();
      continueButton.hidden = false;
      backButton.hidden = true;
      note.textContent = state.sampleMode ? 'Your sample profile is ready.' : 'Your anonymized career profile is ready to review.';
      announcement.textContent = 'Your career profile is ready to review.';
    } catch (processingError) {
      note.textContent = 'Your original résumé has not been uploaded or stored.';
      error.textContent = processingError.message || 'We could not read that résumé. Please try again.';
      error.hidden = false;
      backButton.hidden = false;
      announcement.textContent = error.textContent;
    }
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
    response.textContent = saved.rating ? 'Thanks — your feedback is saved.' : '';
  }

  function saveScreenFeedback(rating) {
    const key = String(state.screen);
    const existing = state.feedback[key] || {};
    state.feedback[key] = { ...existing, rating };
    saveState();
    renderScreenFeedback(state.screen);
    document.getElementById('screen-feedback-text').focus();
    submitFeedback(key);
  }

  async function submitFeedback(screenNumber) {
    const entry = state.feedback[String(screenNumber)];
    if (!entry?.rating || isLocalPreview) return;
    try {
      await apiRequest('/api/career-navigator-feedback', {
        email: state.email,
        screen: String(screenNumber),
        rating: entry.rating,
        comment: entry.comment || ''
      });
    } catch (_) {
      // Feedback must never interrupt the user's journey.
    }
  }

  function syncConfirmedProfile() {
    state.profile = {
      ...state.profile,
      summary: document.getElementById('career-summary').value.trim(),
      explicit_skills: [...state.skills.explicit],
      inferred_skills: [...state.skills.inferred]
    };
    saveState();
  }

  function renderProfile() {
    document.getElementById('career-summary').value = state.profile.summary || '';
    document.getElementById('profile-current-role').textContent = state.profile.current_role || 'Career experience';
    document.getElementById('profile-context').textContent = state.profile.experience_context || 'Based on your résumé';
    document.getElementById('profile-achievements').innerHTML = (state.profile.achievements || [])
      .slice(0, 5)
      .map((achievement) => `<li>${escapeHtml(achievement)}</li>`)
      .join('');
    renderSkills();
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

  function renderPathways() {
    const typeClasses = { adjacent: 'adjacent-text', growth: 'growth-text', reinvention: 'reinvention-text' };
    document.getElementById('pathway-list').innerHTML = state.pathways.map((pathway, index) => {
      const selected = pathway.id === state.path;
      const recommended = pathway.id === 'growth';
      return `<button class="pathway-card${selected ? ' selected' : ''}${recommended ? ' recommended' : ''}" type="button" data-path="${escapeHtml(pathway.id)}" aria-pressed="${selected}">
        ${recommended ? '<span class="recommendation-ribbon">Strongest overall fit</span>' : ''}
        <span class="path-number">${String(index + 1).padStart(2, '0')}</span>
        <div class="path-main"><span class="path-type ${typeClasses[pathway.id] || ''}">${escapeHtml(pathway.type)}</span><h3>${escapeHtml(pathway.title)}</h3><p>${escapeHtml(pathway.description)}</p><div class="path-tags">${(pathway.tags || []).slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div>
        <span class="select-indicator">${selected ? 'Selected' : 'Select'}</span>
      </button>`;
    }).join('');
  }

  function planForSelection() {
    const base = plans[state.timeline] || plans.now;
    const selectedPath = state.pathways.find((pathway) => pathway.id === state.path) || state.pathways[0];
    const title = selectedPath?.title || 'your selected pathway';
    const actions = {
      now: [`Apply to one strong-fit ${title} role today.`, 'Tailor your opening summary to that role, then send two messages to people who may know the team.'],
      soon: [`Schedule three discreet conversations about becoming a ${title}.`, 'Choose people who can validate the work, culture, and evidence employers actually value.'],
      'one-three': [`Interview one person working as a ${title}.`, 'Ask what the role owns, which backgrounds translate well, and what proof gets candidates noticed.'],
      'three-six': [`Find one project that builds evidence for ${title}.`, 'Use it to test your interest and create credible proof before making a larger commitment.'],
      exploring: [`Choose one two-hour experiment related to ${title}.`, 'Test a small piece of the work before judging whether the full direction fits you.']
    };
    return { ...base, action: actions[state.timeline] || base.action };
  }

  function renderPlan() {
    const plan = planForSelection();
    const selectedPath = state.pathways.find((pathway) => pathway.id === state.path) || state.pathways[0];
    document.getElementById('plan-intro').textContent = plan.intro;
    document.getElementById('selected-path-title').textContent = selectedPath?.title || pathTitles[state.path];
    document.getElementById('plan-timeline').innerHTML = plan.phases.map((phase) => `
      <article class="plan-phase">
        <span>${phase[0]}</span>
        <h3>${phase[1]}</h3>
        <ul>${phase[2].map((item) => `<li>${item}</li>`).join('')}</ul>
      </article>
    `).join('');
    document.getElementById('first-action-title').textContent = plan.action[0];
    document.getElementById('first-action-copy').textContent = plan.action[1];
    document.getElementById('first-action-timing').textContent = plan.badge;
  }

  async function createPathways() {
    const button = document.getElementById('create-pathways');
    const error = document.getElementById('pathways-error');
    error.hidden = true;
    state.timeline = document.querySelector('input[name="timeline"]:checked').value;
    state.priorities = [...document.querySelectorAll('#priority-options input:checked')].map((input) => input.value);
    state.leaveBehind = document.getElementById('leave-behind').value.trim();
    syncConfirmedProfile();
    setBusy(button, true, 'Creating your pathways…');

    try {
      if (!state.sampleMode) {
        const result = await apiRequest('/api/career-navigator-pathways', {
          profile: state.profile,
          timeline: timelineLabels[state.timeline],
          priorities: state.priorities,
          leaveBehind: state.leaveBehind,
          sessionId: state.sessionId
        });
        state.pathways = result.pathways;
      } else {
        state.pathways = samplePathways.map((pathway) => ({ ...pathway }));
      }
      state.path = state.pathways.some((pathway) => pathway.id === 'growth') ? 'growth' : state.pathways[0].id;
      renderPathways();
      selectPath(state.path);
      showScreen(6);
    } catch (pathwayError) {
      error.textContent = pathwayError.message || 'We could not create your pathways. Please try again.';
      error.hidden = false;
    } finally {
      setBusy(button, false, '');
    }
  }

  async function emailReport() {
    const button = document.getElementById('email-report');
    const error = document.getElementById('report-error');
    error.hidden = true;
    setBusy(button, true, 'Sending your report…');
    const selectedPath = state.pathways.find((pathway) => pathway.id === state.path) || state.pathways[0];
    const plan = planForSelection();

    try {
      if (isLocalPreview) {
        document.getElementById('screen-8-title').textContent = 'Your Career Navigator preview is ready.';
        document.getElementById('delivery-message').innerHTML = `Local previews cannot send email. Your report would be sent to <strong id="delivery-email">${escapeHtml(state.email)}</strong> from the protected development site.`;
      } else {
        await apiRequest('/api/career-navigator-report', {
          name: state.name,
          email: state.email,
          consent: state.consent,
          timeline: timelineLabels[state.timeline],
          profile: state.profile,
          pathways: state.pathways,
          selectedPath,
          plan,
          feedback: state.feedback
        });
        document.getElementById('screen-8-title').textContent = 'Your Career Navigator report has been sent.';
        document.getElementById('delivery-message').innerHTML = `Your full report has been emailed to <strong id="delivery-email">${escapeHtml(state.email)}</strong>.`;
      }
      showScreen(8);
    } catch (reportError) {
      error.textContent = reportError.message || 'We could not email your report. Please try again.';
      error.hidden = false;
    } finally {
      setBusy(button, false, '');
    }
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
    pastedResumeText = event.target.value.trim();
    selectedResumeFile = null;
    state.sampleMode = false;
    if (pastedResumeText.length >= 80) setResumeReady('Pasted résumé text ready', 'Text stays in this browser until personal details are removed');
  });
  document.getElementById('sample-resume').addEventListener('click', () => {
    selectedResumeFile = null;
    pastedResumeText = '';
    resumeInput.value = '';
    document.getElementById('resume-text').value = '';
    state.sampleMode = true;
    setResumeReady('Alex-Morgan-Sample-Resume.pdf', 'Fictional sample résumé · No AI request required');
  });
  document.getElementById('analyze-resume').addEventListener('click', () => showScreen(3));
  document.getElementById('continue-profile').addEventListener('click', () => showScreen(4, { skipProcessing: true }));

  document.addEventListener('click', (event) => {
    const nextButton = event.target.closest('[data-next]');
    const backToButton = event.target.closest('[data-back-to]');
    const removeButton = event.target.closest('[data-remove-skill]');
    const pathwayButton = event.target.closest('.pathway-card');
    if (nextButton) {
      if (state.screen === 4) syncConfirmedProfile();
      showScreen(nextButton.dataset.next);
    }
    if (backToButton) showScreen(backToButton.dataset.backTo);
    if (removeButton) removeSkill(removeButton.dataset.skillType, removeButton.dataset.removeSkill);
    if (pathwayButton) selectPath(pathwayButton.dataset.path);
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

  document.getElementById('goals-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await createPathways();
  });

  document.getElementById('choose-pathway').addEventListener('click', () => showScreen(7));
  document.getElementById('email-report').addEventListener('click', emailReport);

  document.querySelectorAll('.rating-buttons button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.rating-buttons button').forEach((item) => item.classList.toggle('selected', item === button));
    state.feedback.overall = { rating: button.dataset.rating };
    saveState();
    submitFeedback('overall');
    document.getElementById('rating-response').textContent = 'Thank you — your rating has been recorded.';
  }));

  document.querySelectorAll('[data-screen-feedback]').forEach((button) => button.addEventListener('click', () => {
    saveScreenFeedback(button.dataset.screenFeedback);
  }));
  let feedbackTimer;
  document.getElementById('screen-feedback-text').addEventListener('input', (event) => {
    const key = String(state.screen);
    const existing = state.feedback[key] || {};
    state.feedback[key] = { ...existing, comment: event.target.value };
    saveState();
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => submitFeedback(key), 700);
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
  if (state.resumeReady && state.sampleMode) setResumeReady('Sample résumé selected', 'Fictional sample résumé · No AI request required');
  if (state.resumeReady && !state.sampleMode && state.screen <= 2) {
    state.resumeReady = false;
    document.getElementById('analyze-resume').disabled = true;
  }

  if (state.screen === 3) state.screen = 2;
  showScreen(state.screen, { skipProcessing: true });
})();
