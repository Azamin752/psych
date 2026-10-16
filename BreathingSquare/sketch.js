// p5.js版の図形・変数名・初期値を引き継いだ、外部ライブラリ不要の版です。
// index.htmlと同じフォルダに置いてください。
(() => {
  "use strict";

  const width = 400;
  const height = 400;
  const PI = Math.PI;
  const TWO_PI = 2 * PI;
  const { cos, sin, sqrt } = Math;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    canvas.insertAdjacentText("afterend", "このブラウザでは図形を描画できません。");
    return;
  }

  let center_x, center_y, R, r, a, l, speed;
  let a_square, speed_square;
  let showCircles = true;
  let previousTime = null;
  let pixelRatio = 1;
  const editing = { circle: false, square: false };
  const controls = {};

  function setup() {
    center_x = width / 2;
    center_y = height / 2;

    R = 100;             // 円の公転半径
    r = 125;             // 各円の直径（元のcircle()の第3引数）
    a = 0;
    l = R / sqrt(2);
    speed = 0.025;       // 円：元コードの1フレームあたりの回転角（rad）

    a_square = 0;
    speed_square = 0.01; // 四角形：同じ単位

    resizeCanvas();
    connectControls("circle", speed,
      value => { speed = value; },
      value => { a = value; },
      () => a);
    connectControls("square", speed_square,
      value => { speed_square = value; },
      value => { a_square = value; },
      () => a_square);

    document.getElementById("circle-visibility").addEventListener("click", event => {
      showCircles = !showCircles;
      event.currentTarget.textContent = showCircles ? "円を隠す" : "円を表示";
      canvas.setAttribute("aria-label", showCircles
        ? "灰色の背景に、赤い四角形と、その周囲を公転する4つの赤い円。図形の輪郭は白。"
        : "灰色の背景に、回転する赤い四角形。図形の輪郭は白。");
    });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointerup", finishAngleEditing);
    window.addEventListener("pointercancel", finishAngleEditing);
    window.addEventListener("blur", () => {
      finishAngleEditing();
      previousTime = null;
    });
    document.addEventListener("visibilitychange", () => {
      // 別のタブから戻ったときに、角度が大きく飛ぶことを防ぐ。
      previousTime = null;
      finishAngleEditing();
    });

    requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    pixelRatio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * pixelRatio);
    const pixelHeight = Math.round(height * pixelRatio);
    // 同じ寸法の再代入でCanvasが消去されるのを避ける。
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  }

  function draw(timestamp) {
    // 元の速度0.025/0.01を60 fps相当として扱い、
    // モニターのリフレッシュレートが違っても回転速度を保つ。
    const elapsed = previousTime === null ? 0 : Math.min(timestamp - previousTime, 100);
    const frameScale = elapsed / (1000 / 60);
    previousTime = timestamp;

    if (!isAngleEditing("circle")) a = wrapAngle(a + speed * frameScale);
    if (!isAngleEditing("square")) a_square = wrapAngle(a_square + speed_square * frameScale);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.fillStyle = "rgb(220, 220, 220)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = 5;

    // 四角形：元のpush / translate / rotate / square / popに相当。
    ctx.save();
    ctx.translate(center_x, center_y);
    ctx.rotate(a_square);
    ctx.fillRect(-l, -l, l * 2, l * 2);
    ctx.strokeRect(-l, -l, l * 2, l * 2);
    ctx.restore();

    // 周囲の円：配置の計算式と描画順は元のコードのまま。
    if (showCircles) {
      for (let i = 0; i < TWO_PI; i += PI / 2) {
        ctx.beginPath();
        ctx.arc(
          center_x + cos(i + a) * R,
          center_y + sin(i + a) * R,
          r / 2,  // Canvasのarc()では半径を指定する。
          0,
          TWO_PI
        );
        ctx.fill();
        ctx.stroke();
      }
    }

    updateAngleDisplay("circle", a);
    updateAngleDisplay("square", a_square);
    requestAnimationFrame(draw);
  }

  function connectControls(name, initialSpeed, setSpeed, setAngle, getAngle) {
    const speedSlider = document.getElementById(`${name}-speed`);
    const speedValue = document.getElementById(`${name}-speed-value`);
    const angleSlider = document.getElementById(`${name}-angle`);
    const angleValue = document.getElementById(`${name}-angle-value`);
    controls[name] = { angleSlider, angleValue };

    let currentSpeed = initialSpeed;
    bindNumberInput(speedSlider, speedValue, 3,
      value => { currentSpeed = value; setSpeed(value); },
      () => currentSpeed);
    bindNumberInput(angleSlider, angleValue, 1,
      value => { setAngle(value * PI / 180); },
      () => getAngle() * 180 / PI);

    // ドラッグ中は対象だけを止め、もう一方は動かし続ける。
    angleSlider.addEventListener("pointerdown", () => { editing[name] = true; });
    const angleKeys = new Set([
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End", "PageUp", "PageDown"
    ]);
    angleSlider.addEventListener("keydown", event => {
      if (angleKeys.has(event.key)) editing[name] = true;
    });
    angleSlider.addEventListener("keyup", event => {
      if (angleKeys.has(event.key)) editing[name] = false;
    });
    angleSlider.addEventListener("blur", () => { editing[name] = false; });
  }

  // 数値入力とスライダーを同期する。入力途中の空欄や「-」は無視する。
  function bindNumberInput(slider, numberInput, digits, setValue, getValue) {
    const factor = 10 ** digits;
    const normalize = value => Math.round(
      Math.max(Number(slider.min), Math.min(Number(slider.max), value)) * factor
    ) / factor;
    const apply = value => {
      const normalized = normalize(value);
      setValue(normalized);
      slider.value = String(normalized);
      return normalized;
    };

    slider.value = String(getValue());
    numberInput.value = getValue().toFixed(digits);
    slider.addEventListener("input", () => {
      numberInput.value = apply(slider.valueAsNumber).toFixed(digits);
    });
    numberInput.addEventListener("input", () => {
      const value = numberInput.valueAsNumber;
      if (Number.isFinite(value)) apply(value);
    });
    numberInput.addEventListener("blur", () => {
      const value = numberInput.valueAsNumber;
      numberInput.value = apply(Number.isFinite(value) ? value : getValue()).toFixed(digits);
    });
    numberInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        numberInput.blur();
      }
    });
  }

  function isAngleEditing(name) {
    // 数値欄にフォーカスがある間も対象だけ停止し、入力値を上書きしない。
    return editing[name] || document.activeElement === controls[name].angleValue;
  }

  function finishAngleEditing() {
    editing.circle = false;
    editing.square = false;
  }

  function updateAngleDisplay(name, angle) {
    if (isAngleEditing(name)) return; // 操作中のスライダーをアニメーションで上書きしない。
    const degrees = angle * 180 / PI;
    controls[name].angleSlider.value = degrees.toFixed(1);
    controls[name].angleValue.value = degrees.toFixed(1);
  }

  function wrapAngle(angle) {
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
  }

  setup();
})();
