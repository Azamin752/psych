var jsPsych = initJsPsych();




var fac = {
  shape_type:[0,1],
  position_type:[0,1],
  line_type:[0,1],
  upper:[0,1]
};
var factors = jsPsych.randomization.factorial(fac, 2);

// スケッチ関数。中身はp5.jsのエディタの中身でOK。
// p5.jsのオブジェクトにはprefixでp.を付ける必要があります。

// 1個目
let biwako = function (p) {
  // これはおまじないとして入れておく。
  let trial = jsPsych.getCurrentTrial();

  
  let Max_r, Min_r, r;
  let shape_type = jsPsych.timelineVariable("shape_type", true);
  let position_type = jsPsych.timelineVariable("position_type", true);;
  let line_type = jsPsych.timelineVariable("line_type", true);;
  let polygon = 3;
  let upper = jsPsych.timelineVariable("upper", true);;
  let speed = 2;

  let shape; // "circle" or "polygon"
  let centerX_b, centerY_b, centerX_s, centerY_s;
  let jag;


  p.setup = function () {
    p.createCanvas(1000, 600);

    Max_r = (p.height * 4/5) / 2;
    Min_r = 0;
    
    r = (upper === 0) ? Max_r-50 : Min_r+50;

    shape = (shape_type === 0) ? "circle" : "polygon";

    if(position_type === 0){
      centerX_b = p.width/2;   centerY_b = p.height/2;
      centerX_s = p.width/2;   centerY_s = p.height/2;
    }else{
      centerX_b = p.width/4;   centerY_b = p.height/2;
      centerX_s = p.width*3/4; centerY_s = p.height/2;
    }

    jag = (line_type === 0) ? 0 : 45;

  };
  
  p.draw = function(){
    p.background(220);
    p.noFill();
    p.strokeWeight(1);

    // 矢印キー（p.keyCode が安定）
    if (p.keyIsPressed) {
      if (p.keyCode === p.DOWN_ARROW) {
        r = (r <= Min_r) ? Min_r : (r - speed);
      } else if (p.keyCode === p.UP_ARROW) {
        r = (r >= Max_r) ? Max_r : (r + speed);
      }
    }
    if (p.keyIsPressed && p.keyCode === 32 && !p._prevSpaceDown) { // 32 = SPACE
    const Max_area = p.PI * Max_r * Max_r;
    const area = (shape_type === 0)
    ? (p.PI * r * r)
    : ((3 * p.sqrt(3) / 4) * (r * r));
    const rate = area/Max_area
  trial.data.Max_area = Max_area;
  trial.data.area = area;
  trial.data.rate = rate

      trial.end_trial();
    }
    p._prevSpaceDown = (p.keyIsPressed && p.keyCode === 32);

    // 外円（直径）
    p.circle(centerX_b, centerY_b, Max_r * 2);

    // 内図形（同面積ギザ）
    drawTriJaggedEqualArea(
      centerX_s, centerY_s, shape, r,
      { k: jag, n: polygon } // ← opt=... の代入はしない
    );
  }

// -1..1 の三角波（周期 TWO_PI）
  function triWave(rad) { // -1..1
    let u = (rad / p.TWO_PI) % 1;
    if (u < 0) u += 1;
    return 1 - 4 * p.abs(u - 0.5);
  }

  function triBump01(t) { // 0..1 -> 0→1→0（端が必ず0）
    t = t % 1;
    if (t < 0) t += 1;
    return 1 - p.abs(2 * t - 1);
  }

  function polyArea(pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      s += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return p.abs(s) * 0.5;
  }

  function regularPolygonVerts(cx, cy, n, R0, rot) {
    let v = [];
    for (let i = 0; i < n; i++) {
      const a = rot + p.TWO_PI * i / n;
      v.push({ x: cx + R0 * p.cos(a), y: cy + R0 * p.sin(a) });
    }
    return v;
  }

function drawTriJaggedEqualArea(cx, cy, type, R0, opt = {}) {
  const amp = opt.amp ?? 0.05;
  const n = opt.n ?? 6;

  // ★統一：k は「全周のギザ総数」
  const kTotal = opt.k ?? 60;

  const stepsPerTooth = opt.stepsPerTooth ?? 12;
  const isCircle = (type === "circle");

  // ===== k=0（ギザ無し）なら、素の図形を描いて終了 =====
  if (kTotal <= 0 || amp === 0) {
    if (isCircle) {
      p.circle(cx, cy, R0 * 2);
      return;
    } else {
      // 底辺水平（下側の辺が水平）にしたいならこれ
     const rot = opt.rot ?? (p.HALF_PI - p.PI / n);

      const base = regularPolygonVerts(cx, cy, n, R0, rot);
      p.beginShape();
      for (const v of base) p.vertex(v.x, v.y);
      p.endShape(p.CLOSE);
      return;
    }
  }

  let pts = [];
  let A_target = 0;

  if (isCircle) {
    // ===== 円：全周 kTotal 個 =====
    const detail = opt.detail ?? p.max(60, kTotal * stepsPerTooth);

    for (let i = 0; i < detail; i++) {
      const th = p.TWO_PI * i / detail;
      const rr = R0 * (1 + amp * triWave(kTotal * th));
      pts.push({ x: cx + rr * p.cos(th), y: cy + rr * p.sin(th) });
    }
    A_target = p.PI * R0 * R0;

  } else {
    // ===== 多角形：全周 kTotal 個 を「各辺同数」に丸める =====
    const teethPerEdge = p.max(1, p.round(kTotal / n));

    // 底辺水平（下側の辺が水平）
   const rot = opt.rot ?? (p.HALF_PI - p.PI / n);

    const base = regularPolygonVerts(cx, cy, n, R0, rot);

    for (let i = 0; i < n; i++) {
      const a = base[i];
      const b = base[(i + 1) % n];

      const ex = b.x - a.x, ey = b.y - a.y;
      const L = p.sqrt(ex * ex + ey * ey);
      const tx = ex / L, ty = ey / L;

      // 辺の法線（外向きに保証）
      let nx = ty, ny = -tx;
      const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5;
      const vx = mx - cx, vy = my - cy;
      if (nx * vx + ny * vy < 0) { nx = -nx; ny = -ny; }

      const steps = teethPerEdge * stepsPerTooth;
      const start = (i === 0) ? 0 : 1;

      for (let j = start; j <= steps; j++) {
        const u = j / steps;
        const px = p.lerp(a.x, b.x, u);
        const py = p.lerp(a.y, b.y, u);

        const f = (teethPerEdge * u) % 1;
        const off = (amp * R0) * triBump01(f);

        pts.push({ x: px + nx * off, y: py + ny * off });
      }
    }

    A_target = 0.5 * n * R0 * R0 * p.sin(p.TWO_PI / n);
  }

  // 面積補正（元と同面積へ）
  const A_now = polyArea(pts);
  const s = p.sqrt(A_target / A_now);

  p.beginShape();
  for (const pt of pts) {
    p.vertex(cx + (pt.x - cx) * s, cy + (pt.y - cy) * s);
  }
  p.endShape(p.CLOSE);
}
} // end sketch

// p5のトライアル定義
let p5_trial_biwako = {
  type: jsPsychP5,
  //  trial_duration: 1000, // 時間で終わらせるなら、時間指定。
  sketch: biwako, // このトライアル用のスケッチ（関数）を指定
  data: {
    record:1,
    upper:jsPsych.timelineVariable("upper"),
    shape_type:jsPsych.timelineVariable("shape_type"),
    position_type:jsPsych.timelineVariable("position_type"),
    line_type:jsPsych.timelineVariable("line_type"),
  }
}

// タイムライン
let trial_block = {
  timeline: [p5_trial_biwako],
  timeline_variables:factors,
  randomize_order: true,
};


var start_experiment = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p><b>面積推定の実験</b></p>",
    choices: " ",
    prompt: "<p>画面上に2つの図形が示されます。</br>"+
"内側または右側に配置される図形（正円・正三角形）は上矢印キーによって拡大、下矢印キーによって縮小できます。</br>"+
"外側・左側にある正円に対し、内側・右側にある図形が<b>1/6の大きさ</b>になるように調整してください。</br>"+
"調整を終えたらスペースキーを押し、決定してください。</br>"+
"決定したら次の試行へと進みます。以降も同様の方法で回答してください。</br>"+
"全部で16試行あります。</br>"+
"厳密さを求めるものではないため、測量、計算はせず、直感的に<b>1/6</b>程度であると感じた点を回答してください。</br></br>"+
"スペースキーで実験開始</p>"
};
// 実験終了時の画面
var finish_experiment = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    on_start: (trial) => {
      var dt = jsPsych.data.get().filter([{record: 1}]);        
      dt = dt.ignore(["response","response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "stimulus", "center_x", "center_y", "record"]);
      trial.stimulus = 
      "<p>実験はこれで終了です。ご協力ありがとうございました。</p>"+"<p>質問，疑問等があれば以下の連絡先にご一報くださると幸いです。</p>"+
      "<p>立命館大学</p>"+
      "<p>総合心理学部　4回生</p>"+
      "<p>福井　岳</p>"+
      "<p>cp0197rv@ed.ritsumei.ac.jp</p>";
      dt.localSave('csv', `biwako.csv`); 
    },
};

//フルスクはじまり
var start_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true, // 全画面表示にする
    message: "<p>ウィンドウサイズを最大化します。</p>",
    button_label: "スペースキーで次へ",
    on_load: () => {
    // Space(= " ") で「次へ」ボタンをクリック
    fsKeyHandler = (e) => {
      if (e.key === " ") {
        const btn = document.querySelector(".jspsych-btn");
        if (btn) btn.click();
      }
    };
    window.addEventListener("keydown", fsKeyHandler);
  },
  on_finish: () => {
    // 後片付け（重複登録を防ぐ）
    if (fsKeyHandler) window.removeEventListener("keydown", fsKeyHandler);
  }
};

//フルスク終わり
var finish_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false, // 全画面表示を解除
};

//手続き
var start_procedure = {
    timeline : [start_fullscreen,start_experiment],
};
var finish_procedure = {
    timeline:[finish_fullscreen,finish_experiment],
};





jsPsych.run([start_procedure,trial_block,finish_procedure]);
