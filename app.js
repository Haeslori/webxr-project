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
            debugLog('小球元素未找到');
            return;
        }

        try {
            // 同时更新 object3D 和 attribute 位置
            ball.object3D.position.y = y;
            ball.setAttribute('position', {x: 0, y: y, z: 0});
            debugLog('小球位置更新:', y);
        } catch (error) {
            console.error('更新小球位置时出错:', error);
        }
    }

    // 高度调节函数
    function updateHeight() {
        heightDisplay.setAttribute('value', `高度: ${currentHeightValue.toFixed(1)} 米`);
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
            debugLog('动画终止条件：', { isSimulationRunning, hasBall: !!ball });
            return;
        }

        if (!startTime) {
            startTime = performance.now();
            lastFrameTime = startTime;
            currentVelocity = 0;
            debugLog('动画初始化', { startTime });
        }

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = currentTime;

        currentVelocity += GRAVITY * deltaTime;
        
        try {
            const currentY = ball.object3D.position.y;
            let newY = currentY + currentVelocity * deltaTime;

            debugLog('动画更新', { currentY, newY, velocity: currentVelocity });

            if (newY <= 0.3) {
                debugLog('小球到达地面');
                newY = 0.3;
                updateBallPosition(newY);
                stopSimulation();
                return;
            }

            updateBallPosition(newY);
            animationFrameId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('动画更新出错:', error);
            stopSimulation();
        }
    }

    // 停止模拟函数
    function stopSimulation() {
        if (!isSimulationRunning) return;
        
        debugLog('停止模拟');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        const finalText = `最终时间: ${finalTime} 秒`;
        timerDisplay.textContent = finalText;
        vrTimer.setAttribute('value', finalText);
        
        startTime = null;
        lastFrameTime = null;
    }

    // 开始模拟函数
    function startSimulation() {
        if (!isSimulationRunning && ball) {
            debugLog('开始模拟');
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
        debugLog('重置模拟');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        // 重置计时器显示
        timerDisplay.textContent = '时间: 0.00 秒';
        vrTimer.setAttribute('value', '时间: 0.00 秒');
        
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
            const timeText = `时间: ${currentTime.toFixed(2)} 秒`;
            timerDisplay.textContent = timeText;
            vrTimer.setAttribute('value', timeText);
        } catch (error) {
            console.error('更新计时器时出错:', error);
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
            debugLog('控制器已连接:', evt.detail.name);
            controller.object3D.visible = true;
        });

        // 添加射线相交监听
        controller.addEventListener('raycaster-intersection', function(evt) {
            debugLog('射线相交:', evt.detail.els.map(el => el.className));
        });

        controller.addEventListener('triggerdown', function() {
            debugLog('触发器按下');
            const intersection = controller.components.raycaster.getIntersection();
            if (intersection) {
                const el = intersection.object.el;
                debugLog('触发按钮:', el.className);
                
                if (el.classList.contains('start-button')) {
                    debugLog('开始按钮被点击');
                    startSimulation();
                } else if (el.classList.contains('reset-button')) {
                    debugLog('重置按钮被点击');
                    resetSimulation();
                } else if (el.classList.contains('height-up')) {
                    debugLog('增加高度');
                    adjustHeight(0.5);
                } else if (el.classList.contains('height-down')) {
                    debugLog('减少高度');
                    adjustHeight(-0.5);
                }
            }
        });
    });

    // VR 模式事件
    document.querySelector('a-scene').addEventListener('enter-vr', function() {
        debugLog('进入VR模式');
        controls.style.display = 'none';
    });

    document.querySelector('a-scene').addEventListener('exit-vr', function() {
        debugLog('退出VR模式');
        controls.style.display = 'block';
    });

    // VR 按钮点击事件
    document.querySelectorAll('.clickable').forEach(el => {
        el.addEventListener('click', function(evt) {
            debugLog('点击:', this.className);
            if (this.classList.contains('start-button')) startSimulation();
            if (this.classList.contains('reset-button')) resetSimulation();
            if (this.classList.contains('height-up')) adjustHeight(0.5);
            if (this.classList.contains('height-down')) adjustHeight(-0.5);
        });
    });

    // 场景加载完成后初始化
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        debugLog('场景加载完成');
        setTimeout(() => {
            updateHeight();
        }, 100);
    });
});
