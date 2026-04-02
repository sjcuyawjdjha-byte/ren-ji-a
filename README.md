# 视频背景音乐自由切换

一个基于 Web Audio API 的视频背景音乐自由切换应用，支持 5 种不同风格的 BGM 实时合成与无缝切换。

## 功能特性

- 视频播放器：HTML5 Video 播放 30 秒视频片段
- 5 种 BGM 风格：轻快旋律、动感节拍、优雅弦乐、自然氛围、电子合成
- Web Audio API 实时合成音频，无需外部音频文件
- 一键切换 BGM，自动淡入淡出过渡
- 播放/暂停同步控制
- 可拖拽进度条 + 音量调节
- 现代深色主题界面，毛玻璃效果 + 音波动画
- 键盘快捷键：空格播放/暂停，数字键 1-5 切换 BGM

## 快速开始

### 方式一：Python 服务器（推荐）

```bash
python3 server.py
```

浏览器自动打开 `http://localhost:8000`

### 方式二：直接打开

直接在浏览器中打开 `index.html`（部分浏览器可能限制本地文件的音频功能）

## 技术栈

- HTML5 Video / Audio
- CSS3（渐变、毛玻璃、关键帧动画）
- JavaScript ES6+
- Web Audio API（OscillatorNode、GainNode、BiquadFilterNode、FM 合成）
- Python 3（http.server）

## 项目结构

```
├── index.html     # 主页面
├── style.css      # 样式文件
├── app.js         # 核心逻辑
├── server.py      # Python 服务器
├── report.html    # 实验报告模板
└── README.md      # 本文件
```
