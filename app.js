// ========== 音乐列表配置 ==========
// 编辑此数组来添加/修改/删除背景音乐曲目
// name: 显示名称, src: 音乐文件路径
const musicList = [
  { name: '宁静钢琴',   src: 'music/calm-piano.mp3' },
  { name: '电子节拍',   src: 'music/electronic-beat.mp3' },
  { name: '木吉他',     src: 'music/acoustic-guitar.mp3' },
  { name: '氛围音浪',   src: 'music/ambient-waves.mp3' },
  { name: '爵士酒廊',   src: 'music/jazz-lounge.mp3' },
];

// ========== DOM 元素 ==========
const video = document.getElementById('video');
const musicListEl = document.getElementById('music-list');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');

// ========== 音频引擎 ==========
const audio = new Audio();
audio.loop = true;
audio.volume = 0.5;

let currentIndex = -1;
let isMuted = false;

// ========== 渲染音乐列表 ==========
function renderMusicList() {
  musicListEl.innerHTML = '';
  musicList.forEach((track, index) => {
    const li = document.createElement('li');
    li.dataset.index = index;

    const icon = document.createElement('span');
    icon.className = 'track-icon';
    icon.textContent = '🎵';

    const name = document.createElement('span');
    name.className = 'track-name';
    name.textContent = track.name;

    li.appendChild(icon);
    li.appendChild(name);
    li.addEventListener('click', () => switchTrack(index));
    musicListEl.appendChild(li);
  });
}

// ========== 平滑音量渐变 ==========
function fadeAudio(targetVol, durationMs) {
  return new Promise((resolve) => {
    const startVol = audio.volume;
    const diff = targetVol - startVol;

    if (Math.abs(diff) < 0.01 || durationMs <= 0) {
      audio.volume = targetVol;
      resolve();
      return;
    }

    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      audio.volume = Math.max(0, Math.min(1, startVol + diff * progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

// ========== 切换曲目（核心） ==========
function switchTrack(index) {
  // 点击正在播放的曲目 → 暂停/恢复
  if (index === currentIndex) {
    if (audio.paused) {
      audio.play();
      updateActiveIndicator();
    } else {
      fadeAudio(0, 200).then(() => {
        audio.pause();
        updateActiveIndicator();
      });
    }
    return;
  }

  const targetVolume = isMuted ? 0 : parseFloat(volumeSlider.value);

  // 如果当前有曲目在播放，先淡出
  const fadeOutPromise = currentIndex >= 0 && !audio.paused
    ? fadeAudio(0, 300)
    : Promise.resolve();

  fadeOutPromise.then(() => {
    audio.src = musicList[index].src;
    audio.volume = 0;
    currentIndex = index;
    updateActiveIndicator();

    audio.play().then(() => {
      fadeAudio(targetVolume, 500);
    }).catch((err) => {
      console.warn('播放失败:', err.message);
    });
  });
}

// ========== 更新当前曲目高亮 ==========
function updateActiveIndicator() {
  const items = musicListEl.querySelectorAll('li');
  items.forEach((li, i) => {
    const isActive = i === currentIndex && !audio.paused;
    li.classList.toggle('active', isActive);

    const icon = li.querySelector('.track-icon');
    if (i === currentIndex && !audio.paused) {
      icon.textContent = '▶';
    } else if (i === currentIndex && audio.paused) {
      icon.textContent = '⏸';
    } else {
      icon.textContent = '🎵';
    }
  });
}

// ========== 音量控制 ==========
volumeSlider.addEventListener('input', () => {
  const val = parseFloat(volumeSlider.value);
  volumeValue.textContent = Math.round(val * 100) + '%';

  if (!isMuted) {
    audio.volume = val;
  }
});

// ========== 静音切换 ==========
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;

  if (isMuted) {
    audio.volume = 0;
    muteBtn.textContent = '🔇';
  } else {
    audio.volume = parseFloat(volumeSlider.value);
    muteBtn.textContent = '🔊';
  }
});

// ========== 视频联动 ==========
video.addEventListener('pause', () => {
  if (currentIndex >= 0 && !audio.paused) {
    audio.pause();
    updateActiveIndicator();
  }
});

video.addEventListener('play', () => {
  if (currentIndex >= 0 && audio.paused) {
    audio.play().catch(() => {});
    updateActiveIndicator();
  }
});

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  renderMusicList();
});
