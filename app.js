document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const heightInput = document.getElementById('heightInput');
    const setHeightBtn = document.getElementById('setHeightBtn');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const vrTimer = document.getElementById('vrTimer');
    const platform = document.getElementById('platform');
    const ball = document.getElementById('ball');
    const controls = document.getElementById('controls');
    const heightDisplay = document.getElementById('heightDisplay');

    // 变量初始化
    let startTime = null;
    let lastFrameTime = null;
    let timerInterval;
    let animationFrameId;
    let isSimulationRunning = false;
    let currentHeightValue = 4.0;
    let currentVelocity = 0;
    const GRAVITY = -9.8;

    // 添加调试标志
    const DEBUG = true;
    function debugLog(...args) {
        if (DEBUG) {
            console.log(...args);
        }
    }

    // 位置更新函数
    function updateBallPosition(y) {
        if (!ball) {
            debugLog('ball nicht gefunden');
            return;
        }

        try {
            // 同时更新 object3D 和 attribute 位置
            ball.object3D.position.y = y;
            ball.setAttribute('position', {x: 0, y: y, z: 0});
            debugLog('position-ball updates:', y);
        } catch (error) {
            console.error('error bei positionupdates:', error);
        }
    }

    // 高度调节函数
    function updateHeight() {
        heightDisplay.setAttribute('value', `höhe: ${currentHeightValue.toFixed(1)} m`);
        platform.setAttribute('position', `0 ${currentHeightValue} 0`);
        updateBallPosition(currentHeightValue - 0.1);
        heightInput.value = currentHeightValue;
    }

    function adjustHeight(change) {
        const newHeight = currentHeightValue + change;
        if (newHeight >= 1 && newHeight <= 8) {
            currentHeightValue = newHeight;
            updateHeight();
            if (isSimulationRunning) {
                resetSimulation();
            }
        }
    }

    // 动画函数
    function animate(timestamp) {
        if (!isSimulationRunning || !ball) {
            debugLog('bei dieser fall animation stoppen：', { isSimulationRunning, hasBall: !!ball });
            return;
        }

        if (!startTime) {
            startTime = performance.now();
            lastFrameTime = startTime;
            currentVelocity = 0;
            debugLog('animation init', { startTime });
        }

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = currentTime;

        currentVelocity += GRAVITY * deltaTime;
        
        try {
            const currentY = ball.object3D.position.y;
            let newY = currentY + currentVelocity * deltaTime;

            debugLog('refresh animation', { currentY, newY, velocity: currentVelocity });

            if (newY <= 0.3) {
                debugLog('an den boden');
                newY = 0.3;
                updateBallPosition(newY);
                stopSimulation();
                return;
            }

            updateBallPosition(newY);
            animationFrameId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('updates error:', error);
            stopSimulation();
        }
    }

    // 停止模拟函数
    function stopSimulation() {
        if (!isSimulationRunning) return;
        
        debugLog('Stop simulation');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        const finalText = `finalzeit: ${finalTime} 秒`;
        timerDisplay.textContent = finalText;
        vrTimer.setAttribute('value', finalText);
        
        startTime = null;
        lastFrameTime = null;
    }

    // 开始模拟函数
    function startSimulation() {
        if (!isSimulationRunning && ball) {
            debugLog('start simulation');
            isSimulationRunning = true;
            startTime = null;
            lastFrameTime = null;
            currentVelocity = 0;

            // 重置小球位置
            const startY = currentHeightValue - 0.1;
            updateBallPosition(startY);
            
            // 开始动画和计时
            animationFrameId = requestAnimationFrame(animate);
            timerInterval = setInterval(updateTimer, 10);
        }
    }

    // 重置模拟函数
    function resetSimulation() {
        debugLog('reset simulation');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        // 重置计时器显示
        timerDisplay.textContent = 'Dauer: 0.00 s';
        vrTimer.setAttribute('value', 'Dauer: 0.00 s');
        
        // 重置所有状态
        startTime = null;
        lastFrameTime = null;
        currentVelocity = 0;
        
        // 重置小球位置
        updateHeight();
    }

    // 更新计时器函数
    function updateTimer() {
        if (!isSimulationRunning || !ball || !startTime) return;
        
        try {
            const currentY = ball.object3D.position.y;
            if (currentY <= 0.3) {
                stopSimulation();
                return;
            }

            const currentTime = (performance.now() - startTime) / 1000;
            const timeText = `Dauer: ${currentTime.toFixed(2)} s`;
            timerDisplay.textContent = timeText;
            vrTimer.setAttribute('value', timeText);
        } catch (error) {
            console.error('error bei clockupdates:', error);
            stopSimulation();
        }
    }

    // 事件监听设置
    setHeightBtn.addEventListener('click', () => {
        const height = parseFloat(heightInput.value);
        if (height >= 1 && height <= 8) {
            currentHeightValue = height;
            updateHeight();
            if (isSimulationRunning) {
                resetSimulation();
            }
        }
    });

    startBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);

    // VR 控制器事件
    const leftHand = document.getElementById('leftHand');
    const rightHand = document.getElementById('rightHand');

    [leftHand, rightHand].forEach(controller => {
        controller.addEventListener('controllerconnected', function(evt) {
            debugLog('controller verbindet:', evt.detail.name);
            controller.object3D.visible = true;
        });

        // 添加射线相交监听
        controller.addEventListener('raycaster-intersection', function(evt) {
            debugLog('raycasterinteraction:', evt.detail.els.map(el => el.className));
        });

        controller.addEventListener('triggerdown', function() {
            debugLog('triggerdown');
            const intersection = controller.components.raycaster.getIntersection();
            if (intersection) {
                const el = intersection.object.el;
                debugLog('triggerbutton:', el.className);
                
                if (el.classList.contains('start-button')) {
                    debugLog('startaktiviert');
                    startSimulation();
                } else if (el.classList.contains('reset-button')) {
                    debugLog('resetaktiviert');
                    resetSimulation();
                } else if (el.classList.contains('height-up')) {
                    debugLog('Höher');
                    adjustHeight(0.5);
                } else if (el.classList.contains('height-down')) {
                    debugLog('niedriger');
                    adjustHeight(-0.5);
                }
            }
        });
    });

    // VR 模式事件
    document.querySelector('a-scene').addEventListener('enter-vr', function() {
        debugLog('VR-Mode');
        controls.style.display = 'none';
    });

    document.querySelector('a-scene').addEventListener('exit-vr', function() {
        debugLog('logout-VR');
        controls.style.display = 'block';
    });

    // VR 按钮点击事件
    document.querySelectorAll('.clickable').forEach(el => {
        el.addEventListener('click', function(evt) {
            debugLog('klicke:', this.className);
            if (this.classList.contains('start-button')) startSimulation();
            if (this.classList.contains('reset-button')) resetSimulation();
            if (this.classList.contains('height-up')) adjustHeight(0.5);
            if (this.classList.contains('height-down')) adjustHeight(-0.5);
        });
    });

    // 场景加载完成后初始化
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        debugLog('scene fertig');
        setTimeout(() => {
            updateHeight();
        }, 100);
    });
});
