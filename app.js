document.addEventListener('DOMContentLoaded', function() {
  const heightInput = document.getElementById('heightInput');
  const setHeightBtn = document.getElementById('setHeightBtn');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const platform = document.getElementById('platform');
  const ball = document.getElementById('ball');

  let startTime;
  let timerInterval;
  let animationFrameId;
  let isSimulationRunning = false;
  const GRAVITY = -9.8; // 重力加速度
  let currentVelocity = 0;
  let currentHeight;

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
  startBtn.addEventListener('click', function() {
      if (!isSimulationRunning) {
          isSimulationRunning = true;
          startTime = Date.now();
          currentVelocity = 0;
          currentHeight = parseFloat(ball.getAttribute('position').y);
          timerInterval = setInterval(updateTimer, 10);
          animate();
      }
  });

  // 重置按钮
  resetBtn.addEventListener('click', function() {
      isSimulationRunning = false;
      clearInterval(timerInterval);
      cancelAnimationFrame(animationFrameId);
      timerDisplay.textContent = '时间: 0.00 秒';
      
      const height = parseFloat(heightInput.value);
      platform.setAttribute('position', `0 ${height} 0`);
      ball.setAttribute('position', `0 ${height - 0.1} 0`);
      currentHeight = height - 0.1;
      currentVelocity = 0;
  });

  // 动画函数
  function animate() {
      if (!isSimulationRunning) return;

      const deltaTime = 1/60; // 假设60fps
      currentVelocity += GRAVITY * deltaTime;
      currentHeight += currentVelocity * deltaTime;

      // 检查是否接触地面
      if (currentHeight <= 0.3) { // 考虑小球半径和基座高度
          currentHeight = 0.3;
          isSimulationRunning = false;
          clearInterval(timerInterval);
          const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
          timerDisplay.textContent = `最终时间: ${finalTime} 秒`;
          return;
      }

      ball.setAttribute('position', `0 ${currentHeight} 0`);
      animationFrameId = requestAnimationFrame(animate);
  }

  // 更新计时器
  function updateTimer() {
      if (!isSimulationRunning) return;
      const currentTime = (Date.now() - startTime) / 1000;
      timerDisplay.textContent = `时间: ${currentTime.toFixed(2)} 秒`;
  }
});