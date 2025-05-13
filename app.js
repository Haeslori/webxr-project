document.addEventListener('DOMContentLoaded', function() {
    // 常量定义
    const GRAVITY = -9.81;  // 重力加速度 (m/s²)
    
    // DOM 元素
    const heightInput = document.getElementById('heightInput');
    const setHeightBtn = document.getElementById('setHeightBtn');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const vrTimer = document.querySelector('#vrTimer');
    const heightDisplay = document.querySelector('#heightDisplay');
    const platform = document.querySelector('#platform');
    const pole = document.querySelector('#pole');
    const ball = document.querySelector('#ball');

    // 变量
    let currentHeightValue = 4;  // 当前高度（米）
    let isSimulationRunning = false;
    let startTime = null;
    let lastTime = null;
    let velocity = 0;
    let animId = null;
    let timerId = null;

    // 更新高度显示
    function updateHeight() {
        platform.setAttribute('position', `0 ${currentHeightValue} 0`);
        pole.setAttribute('position', `0 ${currentHeightValue/2} 0`);
        pole.setAttribute('height', currentHeightValue);
        ball.setAttribute('position', `0 ${currentHeightValue-0.1} 0`);
        heightDisplay.setAttribute('value', `Höhe: ${currentHeightValue.toFixed(1)} m`);
        heightInput.value = currentHeightValue;
    }

    // 更新小球位置
    function updateBallY(y) {
        ball.setAttribute('position', `0 ${y} 0`);
    }

    // 停止模拟
    function stopSimulation() {
        isSimulationRunning = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    // 动画循环
    function animate() {
        if (!isSimulationRunning) {
            console.log('Animation stopped');
            return;
        }

        const now = performance.now();
        if (!startTime) {
            console.log('Animation initialized');
            startTime = now;
            lastTime = now;
            return requestAnimationFrame(animate);
        }

        const dt = (now - lastTime) / 1000;
        lastTime = now;

        velocity += GRAVITY * dt;
        let y = ball.object3D.position.y + velocity * dt;

        // 碰到地面停止
        if (y <= 0.3) {
            y = 0.3;
            stopSimulation();
        }

        updateBallY(y);
        animId = requestAnimationFrame(animate);
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
        console.log('Start simulation called');
        if (isSimulationRunning) {
            console.log('Simulation already running');
            return;
        }
        isSimulationRunning = true;
        startTime = null;
        velocity = 0;
        updateBallY(currentHeightValue - 0.1);
        console.log('Animation starting...');
        animId = requestAnimationFrame(animate);
        timerId = setInterval(updateTimer, 50);
    }

    // 重置模拟
    function resetSimulation() {
        stopSimulation();
        timerDisplay.textContent = 'Dauer: 0.00 s';
        vrTimer.setAttribute('value', 'Dauer: 0.00 s');
        startTime = null;
        velocity = 0;
        updateHeight();
    }

    // 调整高度
    function adjustHeight(delta) {
        const newHeight = currentHeightValue + delta;
        if (newHeight >= 1 && newHeight <= 8) {
            currentHeightValue = newHeight;
            updateHeight();
            if (isSimulationRunning) resetSimulation();
        }
    }

    // 桌面按钮事件监听
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

    // VR 按钮事件监听
    document.querySelector('a-scene').addEventListener('loaded', function() {
        document.querySelectorAll('.clickable').forEach(function(el) {
            // 点击事件
            el.addEventListener('click', function(evt) {
                console.log('Button clicked:', el.className);
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

            // 射线交互事件
            el.addEventListener('raycaster-intersected', function() {
                el.setAttribute('material', 'opacity', 0.7);
            });

            el.addEventListener('raycaster-intersected-cleared', function() {
                el.setAttribute('material', 'opacity', 1);
            });
        });
    });

    // 初始化高度显示
    updateHeight();
});
