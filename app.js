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
    let lastTime = null;
    let timerInterval;
    let animationFrameId;
    let isSimulationRunning = false;
    let currentHeightValue = 4.0;
    let currentVelocity = 0;
    const GRAVITY = -9.8;

    // 位置更新函数
    function updateBallPosition(y) {
        if (ball.object3D) {
            ball.object3D.position.y = y;
        }
        console.log('小球位置更新:', y);
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
        if (!isSimulationRunning) return;

        if (!startTime) {
            startTime = timestamp;
            lastTime = timestamp;
        }

        const deltaTime = (timestamp - lastTime) / 1000; // 转换为秒
        lastTime = timestamp;

        currentVelocity += GRAVITY * deltaTime;
        
        // 获取当前小球位置
        const currentY = ball.object3D.position.y;
        let newY = currentY + currentVelocity * deltaTime;

        // 检查是否接触地面
        if (newY <= 0.3) {
            console.log('小球到达地面');
            newY = 0.3;
            updateBallPosition(newY);
            stopSimulation();
            return;
        }

        // 更新小球位置
        updateBallPosition(newY);
        animationFrameId = requestAnimationFrame(animate);
    }

    // 停止模拟函数
    function stopSimulation() {
        if (!isSimulationRunning) return;
        
        console.log('停止模拟');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const finalText = `最终时间: ${finalTime} 秒`;
        timerDisplay.textContent = finalText;
        vrTimer.setAttribute('value', finalText);

        // 重置时间变量
        startTime = null;
        lastTime = null;
    }

    // 实验控制函数
    function startSimulation() {
        if (!isSimulationRunning) {
            console.log('开始模拟');
            isSimulationRunning = true;
            startTime = null; // 将在动画函数中初始化
            lastTime = null;
            currentVelocity = 0;

            // 重置小球位置
            const startY = currentHeightValue - 0.1;
            updateBallPosition(startY);
            
            // 开始动画和计时
            animationFrameId = requestAnimationFrame(animate);
            timerInterval = setInterval(updateTimer, 10);
        }
    }

    function resetSimulation() {
        console.log('重置模拟');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        // 重置计时器显示
        timerDisplay.textContent = '时间: 0.00 秒';
        vrTimer.setAttribute('value', '时间: 0.00 秒');
        
        // 重置时间和速度变量
        startTime = null;
        lastTime = null;
        currentVelocity = 0;
        
        // 重置小球位置
        updateHeight();
    }

    function updateTimer() {
        if (!isSimulationRunning || !startTime) return;
        
        // 检查小球位置
        const currentY = ball.object3D.position.y;
        if (currentY <= 0.3) {
            stopSimulation();
            return;
        }

        const currentTime = (Date.now() - startTime) / 1000;
        const timeText = `时间: ${currentTime.toFixed(2)} 秒`;
        timerDisplay.textContent = timeText;
        vrTimer.setAttribute('value', timeText);
    }

    // 事件监听设置
    setHeightBtn.addEventListener('click', function() {
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
            console.log('控制器已连接:', evt.detail.name);
            controller.object3D.visible = true;
        });

        controller.addEventListener('triggerdown', function() {
            const intersection = controller.components.raycaster.getIntersection();
            if (intersection) {
                const el = intersection.object.el;
                console.log('触发按钮:', el.className);
                if (el.classList.contains('start-button')) startSimulation();
                if (el.classList.contains('reset-button')) resetSimulation();
                if (el.classList.contains('height-up')) adjustHeight(0.5);
                if (el.classList.contains('height-down')) adjustHeight(-0.5);
            }
        });
    });

    // VR 模式事件
    document.querySelector('a-scene').addEventListener('enter-vr', function() {
        console.log('进入VR模式');
        controls.style.display = 'none';
    });

    document.querySelector('a-scene').addEventListener('exit-vr', function() {
        console.log('退出VR模式');
        controls.style.display = 'block';
    });

    // VR 按钮点击事件
    document.querySelectorAll('.clickable').forEach(el => {
        el.addEventListener('click', function(evt) {
            console.log('点击:', this.className);
            if (this.classList.contains('start-button')) startSimulation();
            if (this.classList.contains('reset-button')) resetSimulation();
            if (this.classList.contains('height-up')) adjustHeight(0.5);
            if (this.classList.contains('height-down')) adjustHeight(-0.5);
        });
    });

    // 场景加载完成后初始化
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        console.log('场景加载完成');
        updateHeight();
    });
});
