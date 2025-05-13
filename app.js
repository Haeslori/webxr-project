document.addEventListener('DOMContentLoaded', function() {
    // 正确获取DOM元素
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

    // 更新小球位置
    function updateBallY(y) {
        ball.object3D.position.y = y;
        ball.setAttribute('position', { x:0, y:y, z:0 });
    }

    // 更新初始高度
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
        animId = null;

        const t = ((performance.now() - startTime) / 1000).toFixed(2);
        timerDisplay.textContent = `Dauer: ${t} s`;
        vrTimer.setAttribute('value', `Dauer: ${t} s`);
    }

    // 动画循环
    function animate() {
        if (!isSimulationRunning) {
            animId = null;
            return;
        }

        const now = performance.now();
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
        animId = window.requestAnimationFrame(animate);
    }

    // 更新计时器
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

        animId = window.requestAnimationFrame(animate);
        timerId = setInterval(updateTimer, 50);
    }

    // 重置模拟
    function resetSimulation() {
        isSimulationRunning = false;
        cancelAnimationFrame(animId);
        clearInterval(timerId);
        animId = null;
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

    // 桌面按钮绑定
    setHeightBtn.addEventListener('click', () => {
        const h = parseFloat(heightInput.value);
        if (h >= 1 && h <= 8) {
            currentHeightValue = h;
            updateHeight();
            if (isSimulationRunning) resetSimulation();
        }
    });
    startBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);

    // VR按钮绑定（事件委托）
    document.querySelector('a-scene').addEventListener('click', function(evt) {
        const el = evt.target.closest('.clickable');
        if (!el) return;
        
        if (el.classList.contains('start-button')) {
            startSimulation();
        } else if (el.classList.contains('reset-button')) {
            resetSimulation();
        } else if (el.classList.contains('height-up')) {
            adjustHeight(0.5);
        } else if (el.classList.contains('height-down')) {
            adjustHeight(-0.5);
        }
    });

    // 初始化场景
    document.querySelector('a-scene').addEventListener('loaded', () => {
        setTimeout(updateHeight, 100);
    });
});
