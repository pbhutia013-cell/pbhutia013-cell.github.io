const languageSelect = document.getElementById('language');
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

const languageOptions = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
  { label: 'Italian', value: 'it-IT' },
  { label: 'Portuguese', value: 'pt-BR' },
  { label: 'Japanese', value: 'ja-JP' },
  { label: 'Korean', value: 'ko-KR' },
  { label: 'Chinese', value: 'zh-CN' },
  { label: 'Hindi', value: 'hi-IN' },
  { label: 'Arabic', value: 'ar-SA' },
  { label: 'Russian', value: 'ru-RU' }
];

let voices = [];
let currentUtterance = null;

function populateLanguageSelect() {
  languageOptions.forEach((option) => {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.label;
    languageSelect.appendChild(el);
  });
}

function populateVoiceSelect() {
  voiceSelect.innerHTML = '';

  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  if (!voiceSelect.value && voices.length) {
    voiceSelect.value = voices[0].name;
  }
}

function getSelectedVoice() {
  return voices.find((voice) => voice.name === voiceSelect.value) || null;
}

function updateRateLabel() {
  rateValue.textContent = `${Number(rateInput.value).toFixed(1)}x`;
}

function setVoiceByLanguage(lang) {
  const matches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
  const fallback = voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0])) || voices[0];
  const chosen = matches[0] || fallback;

  if (chosen) {
    voiceSelect.value = chosen.name;
  }
}

function speakText() {
  const text = textInput.value.trim();
  if (!text) {
    alert('Please enter some text to speak.');
    return;
  }

  if ('speechSynthesis' in window === false) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }

  const selectedVoice = getSelectedVoice();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value;
  utterance.rate = Number(rateInput.value);
  utterance.pitch = 1;
  utterance.volume = 1;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  currentUtterance = utterance;
  speakBtn.disabled = true;
  window.speechSynthesis.speak(utterance);

  utterance.onend = () => {
    speakBtn.disabled = false;
    currentUtterance = null;
  };

  utterance.onerror = () => {
    speakBtn.disabled = false;
    currentUtterance = null;
  };
}

function pauseSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

function resumeSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
  speakBtn.disabled = false;
}

function initVoices() {
  voices = window.speechSynthesis.getVoices();
  populateVoiceSelect();

  const initialLanguage = languageSelect.value;
  setVoiceByLanguage(initialLanguage);
}

populateLanguageSelect();
updateRateLabel();
initVoices();

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    populateVoiceSelect();
    setVoiceByLanguage(languageSelect.value);
  };
}

languageSelect.addEventListener('change', () => {
  setVoiceByLanguage(languageSelect.value);
});

rateInput.addEventListener('input', () => {
  updateRateLabel();
});

speakBtn.addEventListener('click', speakText);
pauseBtn.addEventListener('click', pauseSpeech);
resumeBtn.addEventListener('click', resumeSpeech);
stopBtn.addEventListener('click', stopSpeech);

textInput.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    speakText();
  }
});
