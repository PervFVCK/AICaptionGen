// ===== Initialize EmailJS =====
(function() {
  emailjs.init("23FmtaZ8HQsRcgUQ_"); // Replace with your actual EmailJS Public Key
})();

// Get DOM elements
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

// ===== Example Picker Logic =====
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

// ===== UI Helpers =====
function startLoading() {
  loadingEl.classList.remove('hidden');
  generateBtn.disabled = true;
  clearBtn.disabled = true;
}

function stopLoading() {
  loadingEl.classList.add('hidden');
  generateBtn.disabled = false;
  clearBtn.disabled = false;
}

function toast(msg) {
  const old = helpEl.innerText;
  helpEl.innerText = msg;
  setTimeout(() => helpEl.innerText = old, 3000);
}

// ===== Generate Button (EmailJS version) =====
generateBtn.addEventListener('click', async () => {
  const niche = nicheEl.value.trim();
  const topic = topicEl.value.trim();
  const tone = toneEl.value.trim();
  const length = parseInt(lengthEl.value) || 140;
  const count = parseInt(countEl.value) || 3;

  if (!topic) {
    topicEl.focus();
    return toast('Please enter a topic or brief.');
  }

  startLoading();

  try {
    const templateParams = {
      niche,
      topic,
      tone,
      length,
      count
    };

    const response = await emailjs.send('service_o9vk3jk', 'template_2y372x7', templateParams);
    console.log('SUCCESS!', response.status, response.text);
    toast('Request sent successfully! Check your email.');

    // Display on-screen confirmation
    resultsEl.innerHTML = `
      <div class="result-item">
        <div class="result-text">Your caption generation request was sent successfully via EmailJS.</div>
        <div class="result-meta">Check your email inbox for the details.</div>
      </div>
    `;
  } catch (error) {
    console.error('FAILED...', error);
    toast('Failed to send via EmailJS. Check console or your keys.');
  } finally {
    stopLoading();
  }
});

// ===== Clear Button =====
clearBtn.addEventListener('click', () => {
  topicEl.value = '';
  resultsEl.innerHTML = '';
});

// ===== Clipboard + Export Helpers (same as before) =====
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
  const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'posts.json';
  a.click();
  URL.revokeObjectURL(url);
});

exportCsvBtn.addEventListener('click', () => {
  const posts = collectPosts();
  if (!posts.length) return toast('No posts to export');
  let csv = 'text,notes,hashtags\n';
  posts.forEach(p => {
    const h = (p.hashtags || []).join(' ');
    csv += `"${(p.text || '').replace(/"/g, '""')}","${(p.notes || '').replace(/"/g, '""')}","${h.replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'posts.csv';
  a.click();
  URL.revokeObjectURL(url);
});

function collectPosts() {
  return Array.from(resultsEl.querySelectorAll('.result-item')).map(node => ({
    text: node.querySelector('.result-text')?.innerText || '',
    notes: node.querySelector('.result-notes')?.innerText || '',
    hashtags: node.dataset.hashtags ? node.dataset.hashtags.split(',').filter(Boolean) : []
  }));
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}
