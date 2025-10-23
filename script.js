/* Frontend-only "mock AI" captions generator.
   - Generates variations based on niche + topic
   - Ready to replace `mockGenerate()` with an API call when you add a backend or client API.
*/

const nicheEl = document.getElementById('niche');
const topicEl = document.getElementById('topic');
const generateBtn = document.getElementById('generate');
const clearBtn = document.getElementById('clear');
const resultsEl = document.getElementById('results');
const loadingEl = document.getElementById('loading');
const copyAllBtn = document.getElementById('copyAll');

generateBtn.addEventListener('click', async () => {
  const niche = nicheEl.value.trim();
  const topic = topicEl.value.trim();

  if (!topic) {
    topicEl.focus();
    return toast('Please enter a topic or keyword.');
  }

  startLoading();
  // Simulate latency like an AI (improves UX)
  await delay(700);

  // Generate 5 caption variants
  const captions = mockGenerate(niche, topic, 5);
  showResults(captions);

  stopLoading();
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
  toast('All captions copied to clipboard');
});

/* helper functions */

function startLoading(){
  loadingEl.classList.remove('hidden');
  generateBtn.disabled = true;
  clearBtn.disabled = true;
}
function stopLoading(){
  loadingEl.classList.add('hidden');
  generateBtn.disabled = false;
  clearBtn.disabled = false;
}
function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

function showResults(list){
  resultsEl.innerHTML = '';
  list.forEach((txt, idx) => {
    const item = document.createElement('div');
    item.className = 'result-item';

    const text = document.createElement('div');
    text.className = 'result-text';
    text.innerText = txt;

    const actions = document.createElement('div');
    actions.className = 'result-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerText = 'Copy';
    copyBtn.addEventListener('click', async () => {
      await copyToClipboard(txt);
      copyBtn.innerText = 'Copied!';
      setTimeout(()=> copyBtn.innerText = 'Copy', 1000);
    });

    actions.appendChild(copyBtn);
    item.appendChild(text);
    item.appendChild(actions);
    resultsEl.appendChild(item);
  });
}

/* Mock generator: uses templates + minor randomization to simulate AI captions */
function mockGenerate(niche, topic, count = 5){
  const base = topic.trim();
  const adjective = pick(['Amazing', 'Unbelievable', 'Quick', 'Surprising', 'Pro Tip', 'Must-see']);
  const hooks = [
    `How to ${base} in 30s`,
    `${adjective} ${niche === 'space' ? 'space' : ''} facts about ${base}`,
    `Stop scrolling — ${base} explained`,
    `You won't believe this about ${base}`,
    `${base}: what nobody tells you`,
    `Best ${niche} tips for ${base}`,
    `Make your ${base} stand out today`,
    `3 quick reasons to try ${base}`
  ];

  const toneAdjust = {
    marketing: ['Boost engagement with', 'Turn views into customers —', 'Copy this caption:'],
    fitness: ['Crush your next session —', 'Gym tip:', 'Try this:'],
    food: ['Delicious:', 'Recipe idea:', 'Chef tip:'],
    fashion: ['Style tip:', 'Trend alert:', 'Outfit inspo:'],
    funny: ['LOL:', 'When you realize', 'That moment when'],
    motivation: ['Daily motivation:', 'Don\'t quit —', 'Keep going:'],
    space: ['Space fact:', 'Astronomy:', 'Cosmic:'],
    general: ['FYI:', 'Quick thought:', 'Caption:']
  };

  const prefixList = toneAdjust[niche] || toneAdjust.general;

  const results = [];
  for(let i=0;i<count;i++){
    const hook = pick(hooks);
    const prefix = pick(prefixList);
    const emoji = pick(['🚀','🔥','✨','💡','😲','📌','🎯','🍳','🏋️']);
    // slight template mixing
    const variants = [
      `${prefix} ${hook} ${emoji}`,
      `${emoji} ${hook} — ${shorten(base, 40)}`,
      `${prefix} ${base} — ${pick(['Read this', 'Save it', 'Try it'])} ${emoji}`,
      `${capitalize(pick(['why', 'how', 'what']))} ${base}? ${pick(['Here\'s why', 'Find out'])} ${emoji}`,
      `${capitalize(base)}: ${pick(['3 facts', 'A quick guide', 'Must-try tips'])} ${emoji}`
    ];
    results.push(variants[i % variants.length]);
  }

  // add subtle uniqueness (numbers, CTA)
  return results.map((r, idx) => {
    if (idx === 0) return `${r} • #1 tip`;
    if (idx === 1) return `${r} • Try it today`;
    return r;
  });
}

/* utilities */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shorten(s, max){
  if (s.length <= max) return s;
  return s.slice(0, max-1) + '…';
}
function capitalize(s){ if(!s) return s; return s.charAt(0).toUpperCase() + s.slice(1); }

async function copyToClipboard(text){
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea'); ta.value = text;
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
}

function toast(msg){
  // small ephemeral message in help bar
  const help = document.getElementById('help');
  const old = help.innerText;
  help.innerText = msg;
  setTimeout(()=> help.innerText = old, 2000);
}
