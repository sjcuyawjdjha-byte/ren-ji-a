/**
 * 视频背景音乐自由切换 - 核心逻辑
 * 使用 Web Audio API 生成不同风格的 BGM
 */

// ===== BGM 配置 =====
const BGM_LIST = [
    { name: '轻快旋律', style: 'bright',   baseFreq: 523.25, type: 'sine',     desc: '明亮欢快' },
    { name: '动感节拍', style: 'rock',      baseFreq: 329.63, type: 'square',   desc: '摇滚动感' },
    { name: '优雅弦乐', style: 'classical', baseFreq: 440.00, type: 'sawtooth', desc: '古典优雅' },
    { name: '自然氛围', style: 'ambient',   baseFreq: 220.00, type: 'sine',     desc: '放松舒缓' },
    { name: '电子合成', style: 'electronic',baseFreq: 392.00, type: 'square',   desc: '科技未来' },
];

// ===== 全局状态 =====
let audioCtx = null;
let currentBgmIndex = -1;
let isPlaying = false;
let bgmVolume = 0.7;
let bgmNodes = null; // 当前播放的音频节点组
let masterGain = null;

// DOM 引用
const video = document.getElementById('videoPlayer');
const videoOverlay = document.getElementById('videoOverlay');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const progressBar = document.getElementById('progressBar');
const progressThumb = document.getElementById('progressThumb');
const progressBarWrapper = document.getElementById('progressBarWrapper');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const volumeIcon = document.getElementById('volumeIcon');
const currentBgmName = document.getElementById('currentBgmName');
const bgmGrid = document.getElementById('bgmGrid');
const bgmCards = document.querySelectorAll('.bgm-card');

// ===== 初始化 Audio Context =====
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = bgmVolume;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// ===== BGM 生成器 =====

// 1. 轻快旋律 - C大调音阶循环
function createBrightMelody() {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33];
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(masterGain);

    let noteIndex = 0;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = notes[0];

    // 添加轻微颤音
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    vibrato.frequency.value = 5;
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start();

    osc.connect(gainNode);
    osc.start();

    // 节拍切换音符
    const interval = setInterval(() => {
        noteIndex = (noteIndex + 1) % notes.length;
        osc.frequency.setTargetAtTime(notes[noteIndex], audioCtx.currentTime, 0.05);
    }, 300);

    return { nodes: [osc, vibrato], gains: [gainNode, vibratoGain], intervals: [interval] };
}

// 2. 动感节拍 - 方波+低频鼓点
function createRockBeat() {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.2;
    gainNode.connect(masterGain);

    // 主旋律
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 329.63;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    osc.connect(filter);
    filter.connect(gainNode);
    osc.start();

    // 低频鼓点
    const bassGain = audioCtx.createGain();
    bassGain.gain.value = 0.4;
    bassGain.connect(masterGain);

    const bassOsc = audioCtx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 80;
    bassOsc.connect(bassGain);
    bassOsc.start();

    // 节奏模式
    const riffNotes = [329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 329.63, 392.00];
    let idx = 0;
    const interval = setInterval(() => {
        idx = (idx + 1) % riffNotes.length;
        osc.frequency.setTargetAtTime(riffNotes[idx], audioCtx.currentTime, 0.02);
        // 鼓点节奏
        bassGain.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.01);
        bassGain.gain.setTargetAtTime(0.1, audioCtx.currentTime + 0.05, 0.05);
    }, 200);

    return { nodes: [osc, bassOsc], gains: [gainNode, bassGain], intervals: [interval], filters: [filter] };
}

// 3. 优雅弦乐 - 锯齿波+慢速琶音
function createClassicalStrings() {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.15;
    gainNode.connect(masterGain);

    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 440;

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 442; // 微微失谐，模拟弦乐合奏

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    osc1.start();
    osc2.start();

    // 慢速琶音
    const arpNotes = [440, 523.25, 659.25, 783.99, 659.25, 523.25];
    let idx = 0;
    const interval = setInterval(() => {
        idx = (idx + 1) % arpNotes.length;
        osc1.frequency.setTargetAtTime(arpNotes[idx], audioCtx.currentTime, 0.1);
        osc2.frequency.setTargetAtTime(arpNotes[idx] + 2, audioCtx.currentTime, 0.1);
    }, 600);

    return { nodes: [osc1, osc2], gains: [gainNode], intervals: [interval], filters: [filter] };
}

// 4. 自然氛围 - 白噪音+低通滤波
function createAmbientNature() {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.25;
    gainNode.connect(masterGain);

    // 白噪音
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();

    // 缓慢的低音垫底
    const padGain = audioCtx.createGain();
    padGain.gain.value = 0.1;
    padGain.connect(masterGain);

    const pad = audioCtx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 110;
    pad.connect(padGain);
    pad.start();

    // LFO 调制滤波器
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    return { nodes: [noise, pad, lfo], gains: [gainNode, padGain, lfoGain], intervals: [], filters: [filter] };
}

// 5. 电子合成 - FM合成+延迟
function createElectronicSynth() {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.2;
    gainNode.connect(masterGain);

    // FM 合成
    const carrier = audioCtx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = 392;

    const modulator = audioCtx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 392 * 2;

    const modGain = audioCtx.createGain();
    modGain.gain.value = 200;
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    // 延迟效果
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.25;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.3;

    carrier.connect(gainNode);
    carrier.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(gainNode);

    carrier.start();
    modulator.start();

    // 电子音序
    const seqNotes = [392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440];
    let idx = 0;
    const interval = setInterval(() => {
        idx = (idx + 1) % seqNotes.length;
        carrier.frequency.setTargetAtTime(seqNotes[idx], audioCtx.currentTime, 0.03);
        modulator.frequency.setTargetAtTime(seqNotes[idx] * 2, audioCtx.currentTime, 0.03);
    }, 250);

    return { nodes: [carrier, modulator], gains: [gainNode, modGain, feedback], intervals: [interval], delays: [delay] };
}

// BGM 创建函数映射
const BGM_CREATORS = [
    createBrightMelody,
    createRockBeat,
    createClassicalStrings,
    createAmbientNature,
    createElectronicSynth,
];

// ===== BGM 切换逻辑 =====
function stopCurrentBgm() {
    if (!bgmNodes) return;

    // 淡出
    if (masterGain) {
        masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }

    setTimeout(() => {
        // 停止所有振荡器和音源
        if (bgmNodes.nodes) {
            bgmNodes.nodes.forEach(n => {
                try { n.stop(); } catch (e) {}
            });
        }
        // 清除定时器
        if (bgmNodes.intervals) {
            bgmNodes.intervals.forEach(i => clearInterval(i));
        }
        // 断开连接
        if (bgmNodes.gains) {
            bgmNodes.gains.forEach(g => {
                try { g.disconnect(); } catch (e) {}
            });
        }
        if (bgmNodes.filters) {
            bgmNodes.filters.forEach(f => {
                try { f.disconnect(); } catch (e) {}
            });
        }
        if (bgmNodes.delays) {
            bgmNodes.delays.forEach(d => {
                try { d.disconnect(); } catch (e) {}
            });
        }
        bgmNodes = null;

        // 恢复音量
        if (masterGain) {
            masterGain.gain.value = bgmVolume;
        }
    }, 150);
}

function playBgm(index) {
    initAudioContext();
    stopCurrentBgm();

    setTimeout(() => {
        currentBgmIndex = index;
        bgmNodes = BGM_CREATORS[index]();
        masterGain.gain.value = bgmVolume;

        // 更新UI
        updateBgmCards();
        currentBgmName.textContent = BGM_LIST[index].name;
    }, 200);
}

function updateBgmCards() {
    bgmCards.forEach((card, i) => {
        card.classList.toggle('active', i === currentBgmIndex);
    });
}

// ===== 视频播放控制 =====
function togglePlay() {
    initAudioContext();

    if (video.paused) {
        video.play();
        isPlaying = true;
        playIcon.innerHTML = '&#10074;&#10074;';
        videoOverlay.classList.add('hidden');

        if (currentBgmIndex >= 0 && !bgmNodes) {
            playBgm(currentBgmIndex);
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } else {
        video.pause();
        isPlaying = false;
        playIcon.innerHTML = '&#9654;';
        videoOverlay.classList.remove('hidden');

        if (audioCtx && audioCtx.state === 'running') {
            audioCtx.suspend();
        }
    }
}

// ===== 进度条 =====
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = pct + '%';
        progressThumb.style.left = pct + '%';
        currentTimeEl.textContent = formatTime(video.currentTime);
        totalTimeEl.textContent = formatTime(video.duration);
    }
    requestAnimationFrame(updateProgress);
}

function seekVideo(e) {
    const rect = progressBarWrapper.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
}

// ===== 音量控制 =====
function updateVolume(val) {
    bgmVolume = val / 100;
    if (masterGain) {
        masterGain.gain.setTargetAtTime(bgmVolume, audioCtx.currentTime, 0.02);
    }
    updateVolumeIcon();
}

function toggleMute() {
    if (bgmVolume > 0) {
        volumeSlider.dataset.prevVolume = volumeSlider.value;
        volumeSlider.value = 0;
        updateVolume(0);
    } else {
        const prev = volumeSlider.dataset.prevVolume || 70;
        volumeSlider.value = prev;
        updateVolume(prev);
    }
}

function updateVolumeIcon() {
    if (bgmVolume === 0) {
        volumeIcon.innerHTML = '&#128263;';
    } else if (bgmVolume < 0.5) {
        volumeIcon.innerHTML = '&#128265;';
    } else {
        volumeIcon.innerHTML = '&#128266;';
    }
}

// ===== 事件绑定 =====

// BGM 卡片点击
bgmCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        card.classList.add('switching');
        setTimeout(() => card.classList.remove('switching'), 400);

        if (currentBgmIndex === index) {
            // 再次点击同一卡片：停止BGM
            stopCurrentBgm();
            currentBgmIndex = -1;
            updateBgmCards();
            currentBgmName.textContent = '未选择';
        } else {
            playBgm(index);
            // 如果视频未播放，自动开始
            if (video.paused) {
                togglePlay();
            }
        }
    });
});

// 视频播放控制
bigPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentBgmIndex < 0) {
        playBgm(0); // 默认选第一首
    }
    togglePlay();
});

videoOverlay.addEventListener('click', () => {
    if (currentBgmIndex < 0) {
        playBgm(0);
    }
    togglePlay();
});

playPauseBtn.addEventListener('click', togglePlay);

// 进度条
progressBarWrapper.addEventListener('click', seekVideo);
let isDragging = false;
progressBarWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    seekVideo(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) seekVideo(e);
});
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// 音量
volumeSlider.addEventListener('input', (e) => updateVolume(e.target.value));
volumeBtn.addEventListener('click', toggleMute);

// 视频结束时重播
video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play();
});

// 限制视频长度到30秒
video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 30) {
        video.currentTime = 0;
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
    if (e.code === 'ArrowRight') {
        video.currentTime = Math.min(video.currentTime + 5, 30);
    }
    if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(video.currentTime - 5, 0);
    }
    // 数字键 1-5 切换BGM
    const num = parseInt(e.key);
    if (num >= 1 && num <= 5) {
        playBgm(num - 1);
        if (video.paused) togglePlay();
    }
});

// 启动进度更新
requestAnimationFrame(updateProgress);
