// Set your Replit backend URL here (no trailing slash)
const BACKEND_URL = "REPLIT_BACKEND_URL";

const nicheEl = document.getElementById('niche');
const topicEl = document.getElementById('topic');
const toneEl = document.getElementById('tone');
const lengthEl = document.getElementById('length');
const countEl = document.getElementById('count');
const generateBtn = document.getElementById('generate');
const clearBtn = document.getElementById('clear');
const resultsEl = document.getElementById('results');
const loadingEl = document.getElementById('loading');
const copyAllBtn = document.getElementById('copyAll');
const examplePicker = document.getElementById('examplePicker');
const exportJsonBtn = document.getElementById('exportJson');
const exportCsvBtn = document.getElementById('exportCsv');
const helpEl = document.getElementById('help');

examplePicker.addEventListener('change', () => {
  const val = examplePicker.value;
  if (val === 'new-product') {
    nicheEl.value = 'fashion';
    topicEl.value = 'New summer jacket launch, premium cotton, Lagos collection, limited run';
    toneEl.value = 'sales';
    lengthEl.value = 160;
    countEl.value = 3;
  } else if (val === 'blog-post') {
    nicheEl.value = 'tech';
    topicEl.value = 'Explainer: how the new X app saves developers time';
    toneEl.value = 'professional';
    lengthEl.value = 200;
    countEl.value = 2;
  } else if (val === 'event') {
    nicheEl.value = 'music';
    topicEl.value = 'Live DJ night at The Dome, Friday, 9pm — RSVP';
    toneEl.value = 'casual';
    lengthEl.value = 120;
    countEl.value = 3;
  } else if (val === 'testimonial') {
    nicheEl.value = 'food';
    topicEl.value = 'Customer review: best jollof in town, friendly staff';
    toneEl.value = 'casual';
    lengthEl.value = 120;
    countEl.value = 3;
  }
});

// UI helpers
function startLoading(){ loadingEl.classList.remove('hidden'); generateBtn.disabled = true; clearBtn.disabled = true; }
function stopLoading(){ loadingEl.classList.add('hidden'); generateBtn.disabled = false; clearBtn.disabled = false; }
function toast(msg){ const old = helpEl.innerText; helpEl.innerText = msg; setTimeout(()=> helpEl.innerText = old, 3000); }

generateBtn.addEventListener('click', async () => {
  const niche = nicheEl.value.trim();
  const topic = topicEl.value.trim();
  const tone = toneEl.value.trim();
  const length = parseInt(lengthEl.value) || 140;
  const count = parseInt(countEl.value) || 3;

  if (!topic) { topicEl.focus(); return toast('Please enter a topic or brief.'); }

  startLoading();
  try {
    const resp = await fetch(BACKEND_URL + '/generate', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ niche, topic, tone, length, count })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(()=>({error:'server error'}));
      throw new Error(err.error || err.details || 'Server error');
    }
    const data = await resp.json();
    const posts = data.posts || [];
    showResults(posts);
  } catch (e) {
    console.error(e);
    toast(String(e.message || e));
  } finally {
    stopLoading();
  }
});

clearBtn.addEventListener('click', () => {
  topicEl.value = '';
  resultsEl.innerHTML = '';
});

copyAllBtn.addEventListener('click', async () => {
  const texts = Array.from(resultsEl.querySelectorAll('.result-text')).map(n => n.innerText);
  if (!texts.length) return;
  const all = texts.join('\n\n');
  await copyToClipboard(all);
  toast('All posts copied to clipboard');
});

exportJsonBtn.addEventListener('click', () => {
  const posts = collectPosts();
  if (!posts.length) return toast('No posts to export');
  const blob = new Blob([JSON.stringify(posts, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'posts.json'; a.click(); URL.revokeObjectURL(url);
});

exportCsvBtn.addEventListener('click', () => {
  const posts = collectPosts();
  if (!posts.length) return toast('No posts to export');
  let csv = 'text,notes,hashtags\n';
  posts.forEach(p => {
    const h = (p.hashtags || []).join(' ');
    csv += `"${(p.text||'').replace(/"/g,'""')}","${(p.notes||'').replace(/"/g,'""')}","${h.replace(/"/g,'""')}"\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'posts.csv'; a.click(); URL.revokeObjectURL(url);
});

function collectPosts(){
  return Array.from(resultsEl.querySelectorAll('.result-item')).map(node => {
    return {
      text: node.querySelector('.result-text').innerText,
      notes: node.querySelector('.result-notes') ? node.querySelector('.result-notes').innerText : '',
      hashtags: node.dataset.hashtags ? node.dataset.hashtags.split(',').filter(Boolean) : []
    };
  });
}

function showResults(list){
  resultsEl.innerHTML = '';
  if (!list || !list.length) {
    resultsEl.innerHTML = '<div class="result-item"><div class="result-text">No posts returned.</div></div>';
    return;
  }

  list.forEach(item => {
    const text = item.text || item;
    const notes = item.notes || '';
    const hashtags = item.hashtags || [];

    const wrapper = document.createElement('div');
    wrapper.className = 'result-item';
    if (hashtags.length) wrapper.dataset.hashtags = hashtags.join(',');

    const content = document.createElement('div');
    content.style.flex = '1';

    const tdiv = document.createElement('div');
    tdiv.className = 'result-text';
    tdiv.innerText = text;

    const meta = document.createElement('div');
    meta.className = 'result-meta';
    meta.innerText = notes || (hashtags.length ? 'Suggested hashtags: ' + hashtags.join(' ') : '');

    content.appendChild(tdiv);
    content.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'result-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerText = 'Copy';
    copyBtn.addEventListener('click', async () => {
      await copyToClipboard(text);
      copyBtn.innerText = 'Copied!';
      setTimeout(()=> copyBtn.innerText = 'Copy', 1200);
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'copy-btn';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => {
      topicEl.value = text; window.scrollTo({top:0,behavior:'smooth'});
      toast('Loaded post into the brief box — edit and regenerate if you like');
    });

    actions.appendChild(copyBtn);
    actions.appendChild(editBtn);

    wrapper.appendChild(content);
    wrapper.appendChild(actions);
    resultsEl.appendChild(wrapper);
  });
}

async function copyToClipboard(text){
  try { await navigator.clipboard.writeText(text); }
  catch(e){
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
}
