const socket = window.io();
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const processing = document.querySelector('#processing');
const nameInput = document.querySelector('.loginname');
const submit = document.querySelector('.submit');
const intro = document.querySelector('.intro');
const aboutLinks = document.querySelectorAll('.what');
const about = document.querySelector('#about');

let players = [];
let sessionId = null;
let audioContext;
let analyser;
let microphone;
const remoteTones = new Map();
const stars = Array.from({ length: 90 }, () => ({
  x: Math.random(), y: Math.random(), radius: Math.random() * 1.5 + 0.4, alpha: Math.random() * 0.35 + 0.08
}));

processing.appendChild(canvas);

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawBackground(time) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const gradient = context.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
  gradient.addColorStop(0, '#1b2a4a');
  gradient.addColorStop(1, '#090d1c');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  stars.forEach((star, index) => {
    const drift = Math.sin(time * 0.00015 + index) * 3;
    const x = star.x * width + drift;
    const y = star.y * height;
    context.beginPath();
    context.fillStyle = `rgba(173, 199, 255, ${star.alpha})`;
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fill();
  });
}

function drawConnections() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  players.forEach((player, index) => {
    players.slice(index + 1).forEach((other) => {
      const distance = Math.hypot((player.x - other.x) * width, (player.y - other.y) * height);
      if (distance > 280) return;
      const opacity = (1 - distance / 280) * 0.22;
      context.beginPath();
      context.moveTo(player.x * width, player.y * height);
      context.lineTo(other.x * width, other.y * height);
      context.strokeStyle = `rgba(169, 194, 255, ${opacity})`;
      context.lineWidth = 1;
      context.stroke();
    });
  });
}

function drawPlayers(time) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  players.forEach((player, index) => {
    const x = player.x * width;
    const y = player.y * height;
    const pulse = Math.sin(time * 0.002 + index) * 2;
    const radius = 22 + player.level * 44 + pulse;
    const glow = context.createRadialGradient(x, y, 0, x, y, radius * 2.8);
    glow.addColorStop(0, `${player.color}aa`);
    glow.addColorStop(0.35, `${player.color}25`);
    glow.addColorStop(1, `${player.color}00`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, radius * 2.8, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = player.color;
    context.globalAlpha = 0.88;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    context.fillStyle = '#f3f6ff';
    context.font = '12px "DM Mono", monospace';
    context.textAlign = 'center';
    context.fillText(player.id === sessionId ? 'you' : player.name, x, y + radius + 20);
  });
}

function render(time = 0) {
  drawBackground(time);
  drawConnections();
  drawPlayers(time);
  requestAnimationFrame(render);
}

async function startAudio() {
  if (audioContext) {
    await audioContext.resume();
    return;
  }
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);
  readMicrophone();
}

function readMicrophone() {
  if (!analyser) return;
  const values = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(values);
  const average = values.reduce((sum, value) => sum + Math.abs(value - 128), 0) / values.length / 128;
  socket.emit('player:sound', Math.min(1, average * 4));
  requestAnimationFrame(readMicrophone);
}

function openTone(playerId, level) {
  if (!audioContext || playerId === sessionId) return;
  let tone = remoteTones.get(playerId);
  if (!tone) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.connect(gain).connect(audioContext.destination);
    gain.gain.value = 0;
    oscillator.start();
    tone = { oscillator, gain };
    remoteTones.set(playerId, tone);
  }
  tone.oscillator.frequency.setTargetAtTime(220 + level * 680, audioContext.currentTime, 0.06);
  tone.gain.gain.setTargetAtTime(Math.min(0.035, level * 0.05), audioContext.currentTime, 0.08);
}

function join() {
  const name = nameInput.value.trim() || 'Stranger';
  socket.emit('player:join', { name });
  intro.classList.add('is-entered');
  startAudio().catch(() => {
    document.querySelector('.mic-note').textContent = 'Microphone unavailable · visual mode enabled';
  });
}

socket.on('session:ready', (data) => { sessionId = data.id; });
socket.on('players:state', (state) => { players = state; });
socket.on('player:sound', ({ id, level }) => openTone(id, level));
socket.on('player:left', (id) => {
  const tone = remoteTones.get(id);
  if (tone) {
    tone.gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
    window.setTimeout(() => tone.oscillator.stop(), 180);
    remoteTones.delete(id);
  }
});

submit.addEventListener('click', join);
nameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') join();
});
aboutLinks.forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  about.style.display = about.style.display === 'block' ? 'none' : 'block';
}));
window.addEventListener('resize', resize);

resize();
requestAnimationFrame(render);
