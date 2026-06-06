const API = '/api';
let token = localStorage.getItem('wgg_token') || '';
let categories = [];
let store = { panels: [], customCommands: [], ticketCounter: 0 };
let editingType = null;
let editingId = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2800);
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function logout() {
  token = '';
  localStorage.removeItem('wgg_token');
  $('#dashboard-screen').classList.add('hidden');
  $('#login-screen').classList.remove('hidden');
}

function initTheme() {
  const saved = localStorage.getItem('wgg_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  $('#theme-toggle').textContent = saved === 'dark' ? '☀' : '☾';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('wgg_theme', next);
  $('#theme-toggle').textContent = next === 'dark' ? '☀' : '☾';
}

function discordPreview(embed, button) {
  const color = embed.color || '#5865F2';
  return `
    <div class="discord-preview">
      <div class="discord-embed" style="border-color:${color}">
        <div class="discord-embed-title">${escapeHtml(embed.title || 'Title')}</div>
        <div class="discord-embed-desc">${escapeHtml(embed.description || 'Description')}</div>
        ${embed.footer ? `<div class="discord-embed-footer">${escapeHtml(embed.footer)}</div>` : ''}
      </div>
      ${button ? `<div class="discord-button">${button?.emoji || '📩'} ${escapeHtml(button?.label || 'Create ticket')}</div>` : ''}
    </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPanels() {
  const grid = $('#panels-grid');
  if (!store.panels.length) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No panels yet. Create one to get started.</p>';
    return;
  }

  grid.innerHTML = store.panels
    .map(
      (panel) => `
    <div class="glass-card item-card" data-type="panel" data-id="${panel.id}">
      <div class="item-card-header">
        <h3>${escapeHtml(panel.name)}</h3>
        <span class="badge">${escapeHtml(panel.categoryKey)}</span>
      </div>
      ${discordPreview(panel.embed, panel.button)}
      <div class="item-meta">
        <span class="meta-tag">${panel.id}</span>
        ${panel.enabled === false ? '<span class="meta-tag">disabled</span>' : ''}
      </div>
    </div>`,
    )
    .join('');

  grid.querySelectorAll('.item-card').forEach((card) => {
    card.addEventListener('click', () => openPanelEditor(card.dataset.id));
  });
}

function renderCommands() {
  const grid = $('#commands-grid');
  if (!store.customCommands.length) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No custom commands yet.</p>';
    return;
  }

  grid.innerHTML = store.customCommands
    .map(
      (cmd) => `
    <div class="glass-card item-card" data-type="command" data-id="${cmd.id}">
      <div class="item-card-header">
        <h3>/${escapeHtml(cmd.name)}</h3>
        <span class="badge">${cmd.staffOnly ? 'staff' : 'public'}</span>
      </div>
      ${discordPreview(cmd.embed, null)}
      <div class="item-meta">
        <span class="meta-tag">${escapeHtml(cmd.description)}</span>
      </div>
    </div>`,
    )
    .join('');

  grid.querySelectorAll('.item-card').forEach((card) => {
    card.addEventListener('click', () => openCommandEditor(card.dataset.id));
  });
}

function renderSettings() {
  $('#ticket-counter').value = store.ticketCounter;
  const next = store.ticketCounter + 1;
  $('#next-ticket-preview').textContent = `wgg-ticket-${String(next).padStart(4, '0')}`;
}

async function loadData() {
  store = await api('/store');
  categories = await api('/categories');
  renderPanels();
  renderCommands();
  renderSettings();
}

function categoryOptions(selected) {
  return categories
    .map((c) => `<option value="${c.key}" ${c.key === selected ? 'selected' : ''}>${c.emoji} ${c.label}</option>`)
    .join('');
}

function openPanelEditor(id) {
  const isNew = !id;
  const panel = isNew
    ? {
        name: 'New Panel',
        categoryKey: 'account',
        enabled: true,
        embed: { title: '', description: '', color: '#57F287', footer: 'WGG Ticket System' },
        button: { label: 'Create ticket', emoji: '📩', style: 'Secondary' },
        welcomeEmbed: { title: '🎫 Ticket Received', description: 'Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\n⚠️ Please do not spam messages.', color: '#57F287', footer: 'WGG Support Team' },
        pingStaff: true,
      }
    : store.panels.find((p) => p.id === id);

  editingType = 'panel';
  editingId = id;

  $('#modal-title').textContent = isNew ? 'New Panel' : `Edit: ${panel.name}`;
  $('#modal-delete').classList.toggle('hidden', isNew);

  $('#modal-body').innerHTML = `
    <div class="form-grid">
      <div class="form-row"><label>Panel Name</label><input id="f-name" value="${escapeHtml(panel.name)}" /></div>
      <div class="form-row"><label>Category</label><select id="f-category">${categoryOptions(panel.categoryKey)}</select></div>
    </div>
    <div class="form-section"><h4>Panel Embed</h4>
      <div class="form-row"><label>Title</label><input id="f-embed-title" value="${escapeHtml(panel.embed.title)}" /></div>
      <div class="form-row"><label>Description</label><textarea id="f-embed-desc">${escapeHtml(panel.embed.description)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Color</label><input id="f-embed-color" type="color" value="${panel.embed.color || '#57F287'}" /></div>
        <div class="form-row"><label>Footer</label><input id="f-embed-footer" value="${escapeHtml(panel.embed.footer || '')}" /></div>
      </div>
    </div>
    <div class="form-section"><h4>Button</h4>
      <div class="form-grid">
        <div class="form-row"><label>Label</label><input id="f-btn-label" value="${escapeHtml(panel.button.label)}" /></div>
        <div class="form-row"><label>Emoji</label><input id="f-btn-emoji" value="${escapeHtml(panel.button.emoji || '')}" /></div>
      </div>
      <div class="form-row"><label>Style</label>
        <select id="f-btn-style">
          ${['Primary', 'Secondary', 'Success', 'Danger'].map((s) => `<option ${panel.button.style === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-section"><h4>Welcome Message (auto-sent in new ticket)</h4>
      <p class="field-hint">Placeholders: <code>{user}</code> <code>{username}</code> <code>{staff}</code></p>
      <div class="form-row"><label>Title</label><input id="f-welcome-title" value="${escapeHtml(panel.welcomeEmbed.title)}" /></div>
      <div class="form-row"><label>Description</label><textarea id="f-welcome-desc" rows="8">${escapeHtml(panel.welcomeEmbed.description)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Color</label><input id="f-welcome-color" type="color" value="${panel.welcomeEmbed.color || '#57F287'}" /></div>
        <div class="form-row"><label>Footer</label><input id="f-welcome-footer" value="${escapeHtml(panel.welcomeEmbed.footer || '')}" /></div>
      </div>
      <div class="form-row"><label><input type="checkbox" id="f-ping-staff" ${panel.pingStaff !== false ? 'checked' : ''} /> Ping staff role when ticket opens</label></div>
    </div>`;

  openModal();
}

function openCommandEditor(id) {
  const isNew = !id;
  const cmd = isNew
    ? {
        name: 'thankyou',
        description: 'Send a thank you message',
        staffOnly: true,
        embed: { title: 'Thank You!', description: '', color: '#5865F2', footer: 'WGG Support' },
      }
    : store.customCommands.find((c) => c.id === id);

  editingType = 'command';
  editingId = id;

  $('#modal-title').textContent = isNew ? 'New Command' : `Edit: /${cmd.name}`;
  $('#modal-delete').classList.toggle('hidden', isNew);

  $('#modal-body').innerHTML = `
    <div class="form-grid">
      <div class="form-row"><label>Command Name (no slash)</label><input id="f-cmd-name" value="${escapeHtml(cmd.name)}" /></div>
      <div class="form-row"><label>Description</label><input id="f-cmd-desc" value="${escapeHtml(cmd.description)}" /></div>
    </div>
    <div class="form-row"><label><input type="checkbox" id="f-cmd-staff" ${cmd.staffOnly ? 'checked' : ''} /> Staff only</label></div>
    <div class="form-section"><h4>Embed Message</h4>
      <div class="form-row"><label>Title</label><input id="f-cmd-title" value="${escapeHtml(cmd.embed.title)}" /></div>
      <div class="form-row"><label>Description</label><textarea id="f-cmd-embed-desc">${escapeHtml(cmd.embed.description)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Color</label><input id="f-cmd-color" type="color" value="${cmd.embed.color || '#5865F2'}" /></div>
        <div class="form-row"><label>Footer</label><input id="f-cmd-footer" value="${escapeHtml(cmd.embed.footer || '')}" /></div>
      </div>
    </div>`;

  openModal();
}

function openModal() {
  $('#modal').classList.remove('hidden');
}

function closeModal() {
  $('#modal').classList.add('hidden');
  editingType = null;
  editingId = null;
}

async function saveModal() {
  try {
    if (editingType === 'panel') {
      const body = {
        name: $('#f-name').value,
        categoryKey: $('#f-category').value,
        embed: {
          title: $('#f-embed-title').value,
          description: $('#f-embed-desc').value,
          color: $('#f-embed-color').value,
          footer: $('#f-embed-footer').value,
        },
        button: {
          label: $('#f-btn-label').value,
          emoji: $('#f-btn-emoji').value,
          style: $('#f-btn-style').value,
        },
        welcomeEmbed: {
          title: $('#f-welcome-title').value,
          description: $('#f-welcome-desc').value,
          color: $('#f-welcome-color').value,
          footer: $('#f-welcome-footer').value,
        },
        pingStaff: $('#f-ping-staff').checked,
      };

      if (editingId) {
        await api(`/panels/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/panels', { method: 'POST', body: JSON.stringify(body) });
      }
      showToast('Panel saved — bot will reload commands automatically');
    }

    if (editingType === 'command') {
      const body = {
        name: $('#f-cmd-name').value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        description: $('#f-cmd-desc').value,
        staffOnly: $('#f-cmd-staff').checked,
        embed: {
          title: $('#f-cmd-title').value,
          description: $('#f-cmd-embed-desc').value,
          color: $('#f-cmd-color').value,
          footer: $('#f-cmd-footer').value,
        },
      };

      if (editingId) {
        await api(`/commands/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/commands', { method: 'POST', body: JSON.stringify(body) });
      }
      showToast('Command saved — slash command will re-register shortly');
    }

    closeModal();
    await loadData();
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteModal() {
  if (!editingId || !confirm('Delete this item?')) return;

  try {
    if (editingType === 'panel') {
      await api(`/panels/${editingId}`, { method: 'DELETE' });
    } else {
      await api(`/commands/${editingId}`, { method: 'DELETE' });
    }
    closeModal();
    await loadData();
    showToast('Deleted');
  } catch (err) {
    showToast(err.message);
  }
}

// Events
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = $('#login-password').value;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error();
    token = data.token;
    localStorage.setItem('wgg_token', token);
    $('#login-screen').classList.add('hidden');
    $('#dashboard-screen').classList.remove('hidden');
    await loadData();
  } catch {
    $('#login-error').classList.remove('hidden');
  }
});

$('#logout-btn').addEventListener('click', logout);
$('#theme-toggle').addEventListener('click', toggleTheme);
$('#add-panel-btn').addEventListener('click', () => openPanelEditor(null));
$('#add-command-btn').addEventListener('click', () => openCommandEditor(null));
$('#modal-close').addEventListener('click', closeModal);
$('#modal-cancel').addEventListener('click', closeModal);
$('#modal-save').addEventListener('click', saveModal);
$('#modal-delete').addEventListener('click', deleteModal);
$('.modal-backdrop').addEventListener('click', closeModal);

$('#save-counter-btn').addEventListener('click', async () => {
  try {
    await api('/settings', {
      method: 'PUT',
      body: JSON.stringify({ ticketCounter: Number($('#ticket-counter').value) }),
    });
    await loadData();
    showToast('Counter updated');
  } catch (err) {
    showToast(err.message);
  }
});

$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((t) => t.classList.remove('active'));
    $$('.tab-content').forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    $(`#tab-${tab.dataset.tab}`).classList.add('active');
  });
});

initTheme();

if (token) {
  $('#login-screen').classList.add('hidden');
  $('#dashboard-screen').classList.remove('hidden');
  loadData().catch(logout);
}
