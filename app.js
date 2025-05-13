app.js
document.addEventListener('DOMContentLoaded', function() {
// 获取 DOM
const heightInput   = document.getElementById('heightInput');
const setHeightBtn  = document.getElementById('setHeightBtn');
const startBtn      = document.getElementById('startBtn');
const resetBtn      = document.getElementById('resetBtn');
const timerDisplay  = document.getElementById('timerDisplay');
const vrTimer       = document.getElementById('vrTimer');
const platform      = document.getElementById('platform');
const ball          = document.getElementById('ball');
const heightDisplay = document.getElementById('heightDisplay');


// 常量与状态
const GRAVITY = -9.8;
let currentHeightValue = 4.0;
let isSimulationRunning = false;
let startTime = null;
let lastTime  = null;
let velocity  = 0;
let animId, timerId;

// 更新小球位置（同步 object3D 与 attribute）
function updateBallY(y) {
    ball.object3D.position.y = y;
    ball.setAttribute('position', { x:0, y:y, z:0 });
}

// 更新平台 & 小球 初始高度
function updateHeight() {
    platform.setAttribute('position', `0 ${currentHeightValue} 0`);
    updateBallY(currentHeightValue - 0.1);
    heightDisplay.setAttribute('value', `Höhe: ${currentHeightValue.toFixed(1)} m`);
    heightInput.value = currentHeightValue;
}

// 停止模拟
function stopSimulation() {
    if (!isSimulationRunning) return;
    isSimulationRunning = false;
    cancelAnimationFrame(animId);
    clearInterval(timerId);

    const t = ((performance.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Dauer: ${t} s`;
    vrTimer.setAttribute('value', `Dauer: ${t} s`);
}

// 动画循环
function animate(now) {
    if (!isSimulationRunning) return;

    if (!startTime) {
        startTime = now;
        lastTime  = now;
        velocity  = 0;
    }

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    velocity += GRAVITY * dt;
    let y = ball.object3D.position.y + velocity * dt;

    if (y <= 0.3) {
        y = 0.3;
        updateBallY(y);
        stopSimulation();
        return;
    }

    updateBallY(y);
    animId = requestAnimationFrame(animate);
}

// 更新计时显示
function updateTimer() {
    if (!isSimulationRunning) return;
    const t = ((performance.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Dauer: ${t} s`;
    vrTimer.setAttribute('value', `Dauer: ${t} s`);
}

// 开始模拟
function startSimulation() {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    startTime = null;
    velocity  = 0;
    updateBallY(currentHeightValue - 0.1);

    animId   = requestAnimationFrame(animate);
    timerId  = setInterval(updateTimer, 50);
}

// 重置模拟
function resetSimulation() {
    isSimulationRunning = false;
    cancelAnimationFrame(animId);
    clearInterval(timerId);
    timerDisplay.textContent = 'Dauer: 0.00 s';
    vrTimer.setAttribute('value', 'Dauer: 0.00 s');
    startTime = null;
    velocity  = 0;
    updateHeight();
}

// 调整高度
function adjustHeight(delta) {
    const nh = currentHeightValue + delta;
    if (nh >= 1 && nh <= 8) {
        currentHeightValue = nh;
        updateHeight();
        if (isSimulationRunning) resetSimulation();
    }
}

// 绑定 HTML 按钮（桌面模式）
setHeightBtn.addEventListener('click', () => {
    const h = parseFloat(heightInput.value);
    if (h >= 1 && h <= 8) {
        currentHeightValue = h;
        updateHeight();
        if (isSimulationRunning) resetSimulation();
    }
});
startBtn .addEventListener('click', startSimulation);
resetBtn .addEventListener('click', resetSimulation);

// 绑定 VR 场景内可点击实体（.clickable）在 A-Frame 中自然触发 click 事件
const vrButtons = document.querySelectorAll('.clickable');
vrButtons.forEach(el => {
    el.addEventListener('click', evt => {
        // 根据 class 决定行为
        if (el.classList.contains('start-button'))   startSimulation();
        if (el.classList.contains('reset-button'))   resetSimulation();
        if (el.classList.contains('height-up'))      adjustHeight( 0.5);
        if (el.classList.contains('height-down'))    adjustHeight(-0.5);
    });
});

// 场景加载完毕后，设置初始高度
document.querySelector('a-scene').addEventListener('loaded', () => {
    setTimeout(updateHeight, 100);
});


});
