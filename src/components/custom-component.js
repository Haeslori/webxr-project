const AFRAME = require('aframe');

AFRAME.registerComponent('adjustable-platform', {
  schema: {
    height: { type: 'number', default: 1 }
  },

  init: function () {
    this.updatePlatformHeight();
  },

  update: function () {
    this.updatePlatformHeight();
  },

  updatePlatformHeight: function () {
    const height = this.data.height;
    this.el.setAttribute('position', `0 ${height} 0`);
  }
});

AFRAME.registerComponent('falling-ball', {
  schema: {
    isFalling: { type: 'boolean', default: false },
    timer: { type: 'number', default: 0 }
  },

  init: function () {
    this.startTime = null;
    this.el.addEventListener('click', () => {
      this.data.isFalling = true;
      this.startTime = Date.now();
      this.startTimer();
    });
  },

  tick: function () {
    if (this.data.isFalling) {
      const position = this.el.getAttribute('position');
      position.y -= 0.01; // Simulate gravity
      this.el.setAttribute('position', position);

      if (position.y <= 0) { // Assuming the platform is at y=0
        this.data.isFalling = false;
        this.stopTimer();
      }
    }
  },

  startTimer: function () {
    this.timerInterval = setInterval(() => {
      this.data.timer = Math.floor((Date.now() - this.startTime) / 1000);
      console.log(`Time: ${this.data.timer}s`);
    }, 1000);
  },

  stopTimer: function () {
    clearInterval(this.timerInterval);
    console.log(`Final Time: ${this.data.timer}s`);
  }
});