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
    let startTime;
    let timerInterval;
    let animationFrameId;
    let isSimulationRunning = false;
    let currentHeightValue = 4.0;
    let currentVelocity = 0;
    const GRAVITY = -9.8;

    // 高度调节函数
    function updateHeight() {
        heightDisplay.setAttribute('value', `Höhe: ${currentHeightValue.toFixed(1)} m`);
        platform.setAttribute('position', `0 ${currentHeightValue} 0`);
        ball.setAttribute('position', `0 ${currentHeightValue - 0.1} 0`);
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
    function animate() {
        if (!isSimulationRunning) return;

        const deltaTime = 1/60;
        currentVelocity += GRAVITY * deltaTime;
        
        // 获取当前小球位置
        const ballPos = ball.getAttribute('position');
        let newY = ballPos.y + currentVelocity * deltaTime;

        // 检查是否接触地面
        if (newY <= 0.3) {
            newY = 0.3;
            isSimulationRunning = false;
            clearInterval(timerInterval);
            const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const finalText = `Zeit: ${finalTime} s`;
            timerDisplay.textContent = finalText;
            vrTimer.setAttribute('value', finalText);
            return;
        }

        // 更新小球位置
        ball.setAttribute('position', `${ballPos.x} ${newY} ${ballPos.z}`);
        animationFrameId = requestAnimationFrame(animate);
    }

    // 实验控制函数
    function startSimulation() {
        if (!isSimulationRunning) {
            console.log('Starting simulation');
            isSimulationRunning = true;
            startTime = Date.now();
            currentVelocity = 0;

            // 重置小球位置
            ball.setAttribute('position', `0 ${currentHeightValue - 0.1} 0`);
            
            // 开始动画和计时
            animate();
            timerInterval = setInterval(updateTimer, 10);
        }
    }

    function resetSimulation() {
        console.log('Resetting simulation');
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        // 重置计时器显示
        timerDisplay.textContent = 'Dauer: 0.00 s';
        vrTimer.setAttribute('value', 'Dauer: 0.00 s');
        
        // 重置小球位置和速度
        currentVelocity = 0;
        updateHeight();
    }

    function updateTimer() {
        if (!isSimulationRunning) return;
        const currentTime = (Date.now() - startTime) / 1000;
        const timeText = `Dauer: ${currentTime.toFixed(2)} s`;
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
        console.log('VR-Mode');
        controls.style.display = 'none';
    });

    document.querySelector('a-scene').addEventListener('exit-vr', function() {
        console.log('Leave VR-Mode');
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

    // 初始化
    updateHeight();
});
