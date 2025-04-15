document.addEventListener('DOMContentLoaded', function() {
    const heightInput = document.getElementById('heightInput');
    const setHeightBtn = document.getElementById('setHeightBtn');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const platform = document.getElementById('platform');
    const ball = document.getElementById('ball');
    const controls = document.getElementById('controls');

    let startTime;
    let timerInterval;
    let animationFrameId;
    let isSimulationRunning = false;
    const GRAVITY = -9.8;
    let currentVelocity = 0;
    let currentHeight;

    // VR模式处理
    document.querySelector('a-scene').addEventListener('enter-vr', function() {
        controls.style.display = 'none';
    });

    document.querySelector('a-scene').addEventListener('exit-vr', function() {
        controls.style.display = 'block';
    });

    // 控制器事件处理
    const leftHand = document.getElementById('leftHand');
    const rightHand = document.getElementById('rightHand');
    [leftHand, rightHand].forEach(controller => {
        controller.addEventListener('controllerconnected', function(evt) {
            console.log('控制器已连接:', evt.detail.name);
        });
    });

    // 设置高度按钮
    setHeightBtn.addEventListener('click', function() {
        const height = parseFloat(heightInput.value);
        if (height >= 1 && height <= 8) {
            platform.setAttribute('position', `0 ${height} 0`);
            ball.setAttribute('position', `0 ${height - 0.1} 0`);
            currentHeight = height - 0.1;
        }
    });

    // 开始按钮
    function startSimulation() {
        if (!isSimulationRunning) {
            isSimulationRunning = true;
            startTime = Date.now();
            currentVelocity = 0;
            currentHeight = parseFloat(ball.getAttribute('position').y);
            timerInterval = setInterval(updateTimer, 10);
            animate();
        }
    }

    startBtn.addEventListener('click', startSimulation);
    document.querySelector('.start-button').addEventListener('click', startSimulation);

    // 重置按钮
    function resetSimulation() {
        isSimulationRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        timerDisplay.textContent = '时间: 0.00 秒';
        document.querySelector('#vrTimer').setAttribute('value', '时间: 0.00 秒');
        
        const height = parseFloat(heightInput.value);
        platform.setAttribute('position', `0 ${height} 0`);
        ball.setAttribute('position', `0 ${height - 0.1} 0`);
        currentHeight = height - 0.1;
        currentVelocity = 0;
    }

    resetBtn.addEventListener('click', resetSimulation);
    document.querySelector('.reset-button').addEventListener('click', resetSimulation);

    // 动画函数
    function animate() {
        if (!isSimulationRunning) return;

        const deltaTime = 1/60;
        currentVelocity += GRAVITY * deltaTime;
        currentHeight += currentVelocity * deltaTime;

        // 检查是否接触地面
        if (currentHeight <= 0.3) {
            currentHeight = 0.3;
            isSimulationRunning = false;
            clearInterval(timerInterval);
            const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            timerDisplay.textContent = `zeit: ${finalTime} s`;
            document.querySelector('#vrTimer').setAttribute('value', `zeit: ${finalTime} s`);
            return;
        }

        ball.setAttribute('position', `0 ${currentHeight} 0`);
        animationFrameId = requestAnimationFrame(animate);
    }

    // 更新计时器
    function updateTimer() {
        if (!isSimulationRunning) return;
        const currentTime = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = `时间: ${currentTime.toFixed(2)} s`;
        document.querySelector('#vrTimer').setAttribute('value', `zeit: ${currentTime.toFixed(2)} s`);
    }
});
