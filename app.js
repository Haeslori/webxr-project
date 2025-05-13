// 获取 DOM 元素和 A-Frame 实体的引用
const sceneEl     = document.querySelector('#scene');
const startBtn    = document.querySelector('#start-button');
const resetBtn    = document.querySelector('#reset-button');
const heightInput = document.querySelector('#height-input');
const timerEl     = document.querySelector('#timer');
const vrTimerEl   = document.querySelector('#vr-timer');
const vrHeightDispEl = document.querySelector('#vr-height-display');
// VR 模式下的按钮实体
const vrStartEl   = document.querySelector('#vr-start');
const vrResetEl   = document.querySelector('#vr-reset');
const vrUpEl      = document.querySelector('#vr-height-up');
const vrDownEl    = document.querySelector('#vr-height-down');
// 小球与立柱实体
const ballEl   = document.querySelector('#ball');
const pillarEl = document.querySelector('#pillar');

// 全局状态变量
let currentHeight = 4;            // 当前设定高度（米）
const ballRadius  = 0.2;          // 小球半径（米）
const gravity     = 9.8;          // 模拟重力加速度（m/s^2）
let dropping      = false;        // 是否正在下落模拟中
let dropStartTime = 0;            // 本次下落开始的时间戳 (ms)
let dropHeight    = 0;            // 本次下落的初始高度值 (米)
let dropDuration  = 0;            // 本次下落的理论总时间 (秒) （用于结束判定）
let rafId;                       // requestAnimationFrame ID，用于需要时取消动画帧

// 更新小球和立柱位置到指定高度
function setHeight(height) {
  // 限制高度在1~8范围内
  height = Math.max(1, Math.min(8, height));
  currentHeight = height;
  // 更新小球的位置（centerY = 指定高度）
  ballEl.object3D.position.y = currentHeight;
  // 更新立柱高度和位置：柱顶达到球底
  const baseHeight = 0.2;
  const pillarHeight = currentHeight - ballRadius - baseHeight;
  pillarEl.setAttribute('height', Math.max(pillarHeight, 0.1));  // 最小高度0.1防止高度过低
  // 立柱中心位置 = 基座顶端 + 半个立柱高度
  const pillarCenterY = baseHeight + pillarHeight / 2;
  pillarEl.object3D.position.y = pillarCenterY;
  // 更新 VR 界面显示的高度文本
  vrHeightDispEl.setAttribute('text', 'value', currentHeight + ' m');
  // 同步桌面输入框的值
  heightInput.value = currentHeight;
}

// 下落模拟每帧更新函数
function animateDrop(timestamp) {
  if (!dropping) return; // 若下落状态被中止，则停止更新
  const elapsed = (timestamp - dropStartTime) / 1000;  // 已经过的时间(秒)
  if (elapsed >= dropDuration) {
    // 已到达理论落地时间或超过，认为落地
    ballEl.object3D.position.y = ballRadius;        // 小球放置在地面
    const finalTime = dropDuration;
    // 更新计时显示为最终时间并固定两位小数
    timerEl.textContent = finalTime.toFixed(2) + ' s';
    vrTimerEl.setAttribute('text', 'value', 'Time: ' + finalTime.toFixed(2) + ' s');
    // 标记模拟结束
    dropping = false;
    // （不再请求下一帧）
    return;
  }
  // 尚未落地，计算当前下落位置：y = 初始高度 - 0.5 * g * t^2
  const currentY = dropHeight - 0.5 * gravity * elapsed * elapsed;
  ballEl.object3D.position.y = currentY;
  // 更新计时显示（保留两位小数）
  timerEl.textContent = elapsed.toFixed(2) + ' s';
  vrTimerEl.setAttribute('text', 'value', 'Time: ' + elapsed.toFixed(2) + ' s');
  // 请求下一帧继续更新
  rafId = requestAnimationFrame(animateDrop);
}

// 开始下落模拟
function startDrop() {
  if (dropping) return; // 如果已经在下落，则不响应
  // 固定当前下落高度和开始时间
  dropHeight = currentHeight;
  dropStartTime = performance.now();
  dropDuration = Math.sqrt(2 * (dropHeight - ballRadius) / gravity); // 计算理论下落总时间
  dropping = true;
  // 禁用高度输入和Start按钮，避免过程中用户重复触发或调整高度
  heightInput.disabled = true;
  startBtn.disabled = true;
  // 复位计时显示为0并更新 VR/UI 文本
  timerEl.textContent = '0.00 s';
  vrTimerEl.setAttribute('text', 'value', 'Time: 0.00 s');
  // 如果小球已在地面（高度过低情况），直接结束模拟
  if (dropHeight <= ballRadius) {
    // 直接不做动画，dropping会在下一步被标记为false
    ballEl.object3D.position.y = ballRadius;
    timerEl.textContent = '0.00 s';
    vrTimerEl.setAttribute('text', 'value', 'Time: 0.00 s');
    dropping = false;
    return;
  }
  // 开始动画循环
  rafId = requestAnimationFrame(animateDrop);
}

// 重置模拟
function resetDrop() {
  // 取消任何未执行的动画帧
  if (rafId) cancelAnimationFrame(rafId);
  dropping = false;
  // 将小球恢复到当前设定高度位置
  setHeight(currentHeight);
  // 重置计时显示
  timerEl.textContent = '0.00 s';
  vrTimerEl.setAttribute('text', 'value', 'Time: 0.00 s');
  // 重新启用输入和Start按钮
  heightInput.disabled = false;
  startBtn.disabled = false;
}

// 绑定桌面模式按钮事件
startBtn.addEventListener('click', startDrop);
resetBtn.addEventListener('click', resetDrop);
// 绑定高度输入改变事件
heightInput.addEventListener('change', () => {
  setHeight(parseFloat(heightInput.value) || currentHeight);
});

// 绑定 VR 模式 UI 交互事件
// VR按钮通过触发桌面按钮的 click 事件来重用逻辑:contentReference[oaicite:5]{index=5}
vrStartEl.addEventListener('click', () => {
  startBtn.click();
});
vrResetEl.addEventListener('click', () => {
  resetBtn.click();
});
// VR 高度调整
vrUpEl.addEventListener('click', () => {
  if (dropping) return; // 下落过程中不允许调整高度
  setHeight(currentHeight + 1);
});
vrDownEl.addEventListener('click', () => {
  if (dropping) return;
  setHeight(currentHeight - 1);
});

// 处理 VR 模式的界面显隐：进入VR时显示 VR UI、隐藏网页控件；退出时反之
sceneEl.addEventListener('enter-vr', () => {
  document.querySelector('#vr-ui').setAttribute('visible', 'true');
  document.querySelector('#controls').style.display = 'none';
});
sceneEl.addEventListener('exit-vr', () => {
  document.querySelector('#vr-ui').setAttribute('visible', 'false');
  document.querySelector('#controls').style.display = 'block';
});

// 页面初始化：根据默认高度设置小球和立柱初始位置
setHeight(currentHeight);
