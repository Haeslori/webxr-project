// —— 1) 按钮监听组件 ——
// 为所有带 .clickable 的实体添加统一点击动作
AFRAME.registerComponent('button-listener', {
  schema: { action: { type: 'string' } },
  init: function () {
    this.el.addEventListener('click', () => {
      const ctrl = document.querySelector('a-scene').components['freefall-controls'];
      if (ctrl && typeof ctrl[this.data.action] === 'function') {
        ctrl[this.data.action]();
      }
    });
  }
});

// —— 2) 核心控制组件 ——
// 挂在 <a-scene freefall-controls>
AFRAME.registerComponent('freefall-controls', {
  init: function () {
    // 缓存 DOM
    this.heightInput   = document.getElementById('heightInput');
    this.setHeightBtn  = document.getElementById('setHeightBtn');
    this.startBtn      = document.getElementById('startBtn');
    this.resetBtn      = document.getElementById('resetBtn');
    this.timerDisplay  = document.getElementById('timerDisplay');
    this.vrTimer       = document.getElementById('vrTimer');
    this.platform      = document.getElementById('platform');
    this.ball          = document.getElementById('ball');
    this.heightDisplay = document.getElementById('heightDisplay');

    // 常量与状态
    this.GRAVITY = -9.8;
    this.currentHeightValue = 4.0;
    this.isSimulationRunning = false;
    this.startTime = null; this.lastTime = null; this.velocity = 0;
    this.animId = null; this.timerId = null;

    // 桌面 “设定高度” 按钮
    this.setHeightBtn.addEventListener('click', () => {
      const h = parseFloat(this.heightInput.value);
      if (h >= 1 && h <= 8) {
        this.currentHeightValue = h;
        this.updateHeight();
        this.resetSimulation();
      }
    });

    // 场景加载完成后初始化高度
    this.el.addEventListener('loaded', () => {
      setTimeout(() => this.updateHeight(), 100);
    });
  },

  // button-listener 可调用的动作
  start()        { this.startSimulation(); },
  reset()        { this.resetSimulation(); },
  'height-up'()  { this.adjustHeight( 0.5); },
  'height-down'(){ this.adjustHeight(-0.5); },

  // 更新小球在 Y 轴的位置
  updateBallY(y) {
    this.ball.object3D.position.y = y;
    this.ball.setAttribute('position', { x:0, y:y, z:-2 });
  },

  // 更新平台高度 & 小球初始位置
  updateHeight() {
    const y = this.currentHeightValue;
    this.platform.setAttribute('position', `0 ${y} -2`);
    this.updateBallY(y - 0.1);
    this.heightDisplay.setAttribute('value', `Höhe: ${y.toFixed(1)} m`);
    this.heightInput.value = y;
  },

  // 停止模拟
  stopSimulation() {
    if (!this.isSimulationRunning) return;
    this.isSimulationRunning = false;
    cancelAnimationFrame(this.animId);
    clearInterval(this.timerId);
    const t = ((performance.now() - this.startTime)/1000).toFixed(2);
    this.timerDisplay.textContent = `Dauer: ${t} s`;
    this.vrTimer.setAttribute('value', `Dauer: ${t} s`);
  },

  // 动画循环
  animate(now) {
    if (!this.isSimulationRunning) return;
    if (!this.startTime) {
      this.startTime = now;
      this.lastTime  = now;
      this.velocity  = 0;
    }
    const dt = (now - this.lastTime)/1000;
    this.lastTime = now;
    this.velocity += this.GRAVITY * dt;
    let y = this.ball.object3D.position.y + this.velocity * dt;
    if (y <= 0.3) {
      y = 0.3;
      this.updateBallY(y);
      this.stopSimulation();
      return;
    }
    this.updateBallY(y);
    this.animId = requestAnimationFrame(this.animate.bind(this));
  },

  // 更新计时
  updateTimer() {
    if (!this.isSimulationRunning) return;
    const t = ((performance.now() - this.startTime)/1000).toFixed(2);
    this.timerDisplay.textContent = `Dauer: ${t} s`;
    this.vrTimer.setAttribute('value', `Dauer: ${t} s`);
  },

  // 开始模拟
  startSimulation() {
    if (this.isSimulationRunning) return;
    this.isSimulationRunning = true;
    this.startTime = null;
    this.velocity  = 0;
    this.updateBallY(this.currentHeightValue - 0.1);
    this.animId  = requestAnimationFrame(this.animate.bind(this));
    this.timerId = setInterval(this.updateTimer.bind(this), 50);
  },

  // 重置模拟
  resetSimulation() {
    this.isSimulationRunning = false;
    cancelAnimationFrame(this.animId);
    clearInterval(this.timerId);
    this.timerDisplay.textContent = 'Dauer: 0.00 s';
    this.vrTimer.setAttribute('value', 'Dauer: 0.00 s');
    this.startTime = null;
    this.velocity  = 0;
    this.updateHeight();
  },

  // 调整高度
  adjustHeight(delta) {
    const nh = this.currentHeightValue + delta;
    if (nh >=1 && nh <=8) {
      this.currentHeightValue = nh;
      this.updateHeight();
      this.resetSimulation();
    }
  }
});
