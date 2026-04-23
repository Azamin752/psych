//WM錯視
var jsPsych = initJsPsych({});


//ゲームパッド実装
let target = null;
let prevButtons = [], prevAxes = []; // 前フレーム状態（変化検出用）

//キー対応表
const keyMap = {
  12: "ArrowUp",   // 十字キー上
  13: "ArrowDown", // 十字キー下
  1: " "       // Aボタン
};

// 長押しリピート設定（好みに調整可）
const REPEAT = { delay: 300, interval: 50 }; // ms: 最初の待ち/その後の間隔
// 各ボタンのリピート管理用
const repeatState = {}; // repeatState[i] = { active: true, nextAt: <ms> }


//function sendKeyEvent(key, type) {
  //const event = new KeyboardEvent(type, { key });
  //document.dispatchEvent(event);
//}

function sendKeyEvent(key, type) {
  const ev = new KeyboardEvent(type, { key, bubbles:true, composed:true, cancelable:true });
  window.dispatchEvent(ev);
  document.dispatchEvent(ev);
  if (document.body) document.body.dispatchEvent(ev);
}

addEventListener("gamepadconnected", e => { if (target===null) target = e.gamepad.index; });
addEventListener("gamepaddisconnected", e => {
  if (e.gamepad.index === target) {
    target = null;
    for (const k in repeatState) repeatState[k].active = false;
    prevButtons = [];
  }
});


//function loop(){

    //const pads = navigator.getGamepads();
    //const gp = target != null ? pads[target] : Array.from(pads).find(p => p && p.connected);


    //if (gp && gp.connected) {
         //if (prevButtons.length !== gp.buttons.length) {
  //prevButtons = new Array(gp.buttons.length).fill(false);
//}
    // --- ボタンの変化（押された/離された）だけログ ---
    //for (let i = 0; i < gp.buttons.length; i++) {
      //const nowPressed = !!gp.buttons[i].pressed;
      //const wasPressed = !!prevButtons[i];


      //if (nowPressed !== wasPressed) {
        //console.log(`Button ${i} ${nowPressed ? "DOWN" : "UP"}`);
      //}

      //if (nowPressed && !wasPressed) {
  // 押された瞬間
     //if (keyMap[i]) sendKeyEvent(keyMap[i], "keydown");
    //}
     //if (!nowPressed && wasPressed) {
  // 離された瞬間
     //if (keyMap[i]) sendKeyEvent(keyMap[i], "keyup");
    //}
      //prevButtons[i] = nowPressed;
    //}
//}
  //requestAnimationFrame(loop);
//}

function loop(){
  const pads = navigator.getGamepads();
  const gp = target != null ? pads[target] : Array.from(pads).find(p => p && p.connected);

  if (gp && gp.connected) {
    if (prevButtons.length !== gp.buttons.length) {
      prevButtons = new Array(gp.buttons.length).fill(false);
    }

    const now = performance.now();

    for (let i = 0; i < gp.buttons.length; i++) {
      const nowPressed = !!gp.buttons[i].pressed;
      const wasPressed = !!prevButtons[i];

      if (nowPressed !== wasPressed) {
        console.log(`Button ${i} ${nowPressed ? "DOWN" : "UP"}`);
      }

      // 押した瞬間: keydown 1回＋リピート開始
      if (nowPressed && !wasPressed) {
        if (keyMap[i]) sendKeyEvent(keyMap[i], "keydown");
        repeatState[i] = { active: true, nextAt: now + REPEAT.delay };
      }

      // 離した瞬間: keyup 1回＋リピート停止
      if (!nowPressed && wasPressed) {
        if (keyMap[i]) sendKeyEvent(keyMap[i], "keyup");
        if (repeatState[i]) repeatState[i].active = false;
      }

      // 押しっぱなし中: 予定時刻を過ぎた分だけ keydown を繰り返し送る
      if (nowPressed && repeatState[i]?.active && keyMap[i]) {
        while (now >= repeatState[i].nextAt) {
          sendKeyEvent(keyMap[i], "keydown");
          repeatState[i].nextAt += REPEAT.interval;
        }
      }

      prevButtons[i] = nowPressed;
    }
  }
  requestAnimationFrame(loop);
}
loop();


var debug_mode = (jsPsych.data.getURLVariable("debug")??false);
//var debug_mode = false;
//デバッグモード切り替え デバッグモード時，データファイルの生成・実験IDのランダム振り当てと事前の表示
//ローカルモードに改めました。条件選択性にします。
//仕様が変わりました。デバッグモードの場合，データのダウンロードが行われず，IDはランダムです。
//そのうち，最後の画面への提示だけ付けたいな。

//実験ID（条件）
//0:縦比較 1:横比較
var ex_ID = (jsPsych.data.getURLVariable("exid")??Math.floor(Math.random()*2)??4);

// 表示領域サイズ
var canvas_width = 600;
var canvas_height = 600;

//実験パラメータ
var std_width_default= 150; // 標準刺激の長辺のデフォ値
var std_height_default = 75; // 標準刺激の短辺のデフォ値
var std_arrow_len = 50; // 矢羽の長さ

var std_angle; // 標準刺激の角度
var std_width; //標準刺激の長辺
var std_height; //標準刺激の短辺
//↑これ何？
//多分，予約
var std_posX = 200; // 標準刺激（ML）のX座標
var std_posY = 200; // 標準刺激（ML）のY座標
var comp_posX = 400; // 比較刺激のX座標
var comp_posY = 400; // 比較刺激のY座標


//ややこしいから，比較刺激関連をここにまとめる。
var comp_width = 150; // 比較刺激の長辺のデフォ値
var comp_height = 75;// 比較刺激の短辺のデフォ値

var comp_len;
var trial_comp_len;//練習課題用比較刺激の長さ
var trial_comp_len_default;//練習課題用比較刺激の長さ
var comp_len_diff;// 刻み幅
//var comp_len_diff=1;// 刻み幅
var comp_len_max; // 比較刺激の最大値
var comp_len_min; // 比較刺激の最小値
var comp_len0_min; // 上昇系列の初期値
var comp_len0_max; // 下降系列の初期値
//初期値は最大値とデフォ値の平均にしときました。
//定義しておいたところに，条件分岐で値を代入する。
//その後，描画段階で代入先を切り替えるだけで，そこまでの処理は共通にする。


//まとめおわり


var red_arrow_0 = "../../image/red_arrow_0.png"
var red_arrow_90 = "../../image/red_arrow_90.png"


var fac = {
    angle:[60,300,0],
    s_wid:[],
    s_hei:[],
    //c_wid:[],
    //c_hei:[],
    up_down: ["up", "down"],
};

//どうやらIDごとに各パラメータをリストとしてまとめるのがよさそう？配列内配列的なやつで

if(ex_ID == 0){
    //横条件
    fac.s_wid = [-50,0,50];
    fac.s_hei = [0];

    trial_comp_len_default = std_height_default;
    //練習課題で比較刺激の長さをキープするために（中略）必須。
    // スライドごとに再定義せずに，縦横それぞれの初期値から変化させるには，グルーバルで一度だけ初期値を条件ごとに与えるのが一番早い。
    // そのうえで，本施行に影響しないためにはこうするのが一番手っ取り早い。

    comp_len_diff = std_height_default*(1/50); 
    comp_len_max = 150; 
    comp_len_min = 0; 
    comp_len0_min = (comp_len_max+comp_height)/2; 
    comp_len0_max = (comp_len_min+comp_height)/2;    
}else if(ex_ID == 1){
    //縦条件
    fac.s_wid = [0];
    fac.s_hei = [-25,0,25];

    
    trial_comp_len_default = std_width_default;

    comp_len_diff = std_width_default*(1/50); 
    comp_len_max = 300; 
    comp_len_min = 0; 
    comp_len0_min = (comp_len_max+comp_width)/2; 
    comp_len0_max = (comp_len_min+comp_width)/2;
  
}else{
    //エラー時
    fac.s_wid = [0];
    fac.s_hei = [0];
        
    comp_len_diff = 0;
    comp_len_max = 0; 
    comp_len_min = 0; 
    comp_len0_min = 0; 
    comp_len0_max = 0; 
};
//0,1:標準刺激が縦に変化;2,3:標準刺激が横に変化
//変動値を参照で計算しないのは，比率を細かく変える可能性があるため。

//if(ex_ID == 0||ex_ID == 2){
    //fac.c_wid = [0];
    //fac.c_hei = [-25,-20,-15,-10,-5,0,5,10,15,20,25];
//}else if(ex_ID == 1||ex_ID == 3){
    //fac.c_wid = [-50,-40,-30,-20,-10,0,10,20,30,40,50];
    //fac.c_hei = [0];
//}else{
    //fac.c_wid = [0];
    //fac.c_hei = [0];
//};
//恒常法時代の遺物
//0,2:比較刺激が縦に変化;1,3:比較刺激が横に変化

var factors = jsPsych.randomization.factorial(fac, 3);
console.log(factors)
var test_factors = [
    {page:1,choice:" ",arrow:0,text:"実験の説明を行います。\n[赤いボタンで次へ]"},
    {page:2,choice:" ",arrow:0,text:"画面に，このような図が表示されます。\n[赤いボタンで次へ]"},
    {page:3,choice:" ",arrow:1,text:"今，矢印で示さていれる部分の長さが\n等しく見えるように調整してください。\n[赤いボタンで次へ]"},
    {page:4,choice:" ",arrow:0,text:"実際に操作してみましょう。\n[十字キーで調整し，赤いボタンで決定してください。]"},
    {page:5,choice:" ",arrow:0,text:"実際に操作してみましょう。\n[十字キーで調整し，赤いボタンで決定してください。]"},
    {page:6,choice:" ",arrow:0,text:"これを何回か繰り返します。\n[赤いボタンで次へ]"},
    {page:7,choice:" ",arrow:0,text:"左上の図は試行によって大きさや矢羽の形が変わります。\n[赤いボタンで次へ]"},
    {page:8,choice:" ",arrow:0,text:"現在の進行度は下部に表示されます。\n[赤いボタンで次へ]"},
    {page:9,choice:" ",arrow:0,text:"【注意】\n・自分が感じたように回答し，\n物理的な長さを測らないでください。\n・本番では矢印は表示されません。\nあなたが等しく見える位置に調整してください。\n[赤いボタンで次へ]"},
    {page:10,choice:" ",arrow:0,text:"赤いボタンを押すと本実験に移ります。\n質問や疑問点がお声がけください。\n[赤いボタンで次へ]"},
];
var n_trial = 1;
var n_trial_all = factors.length;

var std_rect = {
    obj_type:"rect",
    startX:std_posX,
    startY:std_posY,
    width:std_width_default,
    height:std_height_default,
    line_width: 3,
    line_color: "#000000",
};
var std_arrow ={
    obj_type: 'line',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    line_width: 3,
    line_color: "#000000"
};
var comp_rect = {
    obj_type:"rect",
    startX:comp_posX,
    startY:comp_posY,
    width:comp_width,
    height:comp_height,
    line_width: 3,
    line_color: "#000000",
};


//試行回数表示
var text_object = {
    obj_type: "text",
    startX: "center",
    startY: 5 * canvas_height / 6,
    content: "sample text",
    font: "22px 'Arial'",
    text_color: "black",
    text_space: 25,
};

var arrow_obj = {
    obj_type:"image",
    startX:0,
    startY:0,
    file:(ex_ID==0?red_arrow_0:red_arrow_90),
};
//これの設定はホントはいろいろ問題あります。
//大きさのデフォ値に0を入れておかないのも，回転させずに2ファイル用意してるのも，pixiにしておかなかった私の罪と言えます。
//矢印を画像にしたのは，ぶっちゃけこれが一番早いからです。

//試行変数
var trial = {
    type:jsPsychPsychophysics,
    stimuli:[comp_rect,std_rect,std_arrow,std_arrow,std_arrow,std_arrow,text_object],
    response_type:'key',
    choices:" ",
    canvas_width: canvas_width,
    canvas_height:canvas_height,
    background_color: '#DDDDDD',
    std_angle:jsPsych.timelineVariable("angle"),
    std_width:jsPsych.timelineVariable("s_wid"),
    std_height:jsPsych.timelineVariable("s_hei"),
    up_down:jsPsych.timelineVariable("up_down"),
    data:{
        std_angle:jsPsych.timelineVariable("angle"),
        std_width:jsPsych.timelineVariable("s_wid"),
        std_height:jsPsych.timelineVariable("s_hei"),
        up_down:jsPsych.timelineVariable("up_down"),
        record:1,
        exID:ex_ID,
        comp_len:"",
        //onstartの中身弄る
    },
    on_start:(trial)=>{
        var std_angle = trial.std_angle * Math.PI/180/2; // 標準刺激の角度
        var std_width = trial.std_width; //標準刺激の長辺
        var std_height = trial.std_height; //標準刺激の短辺

        comp_len = (trial.up_down=="down" ? comp_len0_max : comp_len0_min);

        trial.stimuli[1].width += std_width;
        trial.stimuli[1].height += std_height;

        trial.stimuli[2].x1 = std_posX - trial.stimuli[1].width/2;
        trial.stimuli[2].y1 = std_posY - trial.stimuli[1].height/2;
        trial.stimuli[2].x2 = std_posX - trial.stimuli[1].width/2 + std_arrow_len*Math.cos(std_angle);
        trial.stimuli[2].y2 = std_posY - trial.stimuli[1].height/2 - std_arrow_len*Math.sin(std_angle);

        trial.stimuli[3].x1 = std_posX - trial.stimuli[1].width/2;
        trial.stimuli[3].y1 = std_posY + trial.stimuli[1].height/2;
        trial.stimuli[3].x2 = std_posX - trial.stimuli[1].width/2 + std_arrow_len*Math.cos(std_angle);
        trial.stimuli[3].y2 = std_posY + trial.stimuli[1].height/2 + std_arrow_len*Math.sin(std_angle);

        trial.stimuli[4].x1 = std_posX + trial.stimuli[1].width/2;
        trial.stimuli[4].y1 = std_posY - trial.stimuli[1].height/2;
        trial.stimuli[4].x2 = std_posX + trial.stimuli[1].width/2 - std_arrow_len*Math.cos(std_angle);
        trial.stimuli[4].y2 = std_posY - trial.stimuli[1].height/2 - std_arrow_len*Math.sin(std_angle);

        trial.stimuli[5].x1 = std_posX + trial.stimuli[1].width/2;
        trial.stimuli[5].y1 = std_posY + trial.stimuli[1].height/2;
        trial.stimuli[5].x2 = std_posX + trial.stimuli[1].width/2 - std_arrow_len*Math.cos(std_angle);
        trial.stimuli[5].y2 = std_posY + trial.stimuli[1].height/2 + std_arrow_len*Math.sin(std_angle);
        
        trial.stimuli[6].content = String(n_trial)+" / "+String(n_trial_all);
        ++ n_trial
    },
  key_down_func: function(event){  
    if (event.key === 'ArrowUp') {
      //n_trial += 1;
      //if (n_trial > n_trial_all) n_trial = n_trial_all;

      comp_len += comp_len_diff
      if (comp_len > comp_len_max) comp_len = comp_len_max;


    }
    else if (event.key === 'ArrowDown') {
      //n_trial-= 1;
      //if (n_trial < 0) n_trial = 0;

      comp_len -= comp_len_diff;
      if (comp_len < comp_len_min) comp_len = comp_len_min;
    }
     console.log(n_trial)
     if(ex_ID==0){
        jsPsych.getCurrentTrial().stim_array[0].height = comp_len;
     }else{
        jsPsych.getCurrentTrial().stim_array[0].width = comp_len;
     }
     //jsPsych.getCurrentTrial().stim_array[6].content = String(n_trial)+" / "+String(n_trial_all);
      //これv7なのでstim_arrayのままです。
  },
  on_finish: (data) => {
   data.comp_len = comp_len
}    
    
};

var test_trial = {
    type:jsPsychPsychophysics,
    stimuli:[comp_rect,std_rect,std_arrow,std_arrow,std_arrow,std_arrow,text_object,arrow_obj,arrow_obj],
    response_type:'key',
    choices:["NO_KEYS"],
    canvas_width: canvas_width,
    canvas_height:canvas_height,
    background_color: '#DDDDDD',
    page:jsPsych.timelineVariable("page"),
    choice:jsPsych.timelineVariable("choice"),
    arrow:jsPsych.timelineVariable("arrow"),
    text:jsPsych.timelineVariable("text"),
    on_start:(trial)=>{
        var angle = 300 * Math.PI/180/2;
        var page = trial.page;
        var choice = trial.choice;
        var arrow = trial.arrow;
        var text = trial.text;
        trial_comp_len = trial_comp_len_default

        if(page==4){
            trial_comp_len=trial_comp_len + trial_comp_len*(1/2)
        }else if(page==5){
            trial_comp_len=trial_comp_len - trial_comp_len*(1/2)
        }
        console.log(trial_comp_len)
        trial.choices = choice;

        trial.stimuli[2].x1 = std_posX - trial.stimuli[1].width/2;
        trial.stimuli[2].y1 = std_posY - trial.stimuli[1].height/2;
        trial.stimuli[2].x2 = std_posX - trial.stimuli[1].width/2 + std_arrow_len*Math.cos(angle);
        trial.stimuli[2].y2 = std_posY - trial.stimuli[1].height/2 - std_arrow_len*Math.sin(angle);

        trial.stimuli[3].x1 = std_posX - trial.stimuli[1].width/2;
        trial.stimuli[3].y1 = std_posY + trial.stimuli[1].height/2;
        trial.stimuli[3].x2 = std_posX - trial.stimuli[1].width/2 + std_arrow_len*Math.cos(angle);
        trial.stimuli[3].y2 = std_posY + trial.stimuli[1].height/2 + std_arrow_len*Math.sin(angle);

        trial.stimuli[4].x1 = std_posX + trial.stimuli[1].width/2;
        trial.stimuli[4].y1 = std_posY - trial.stimuli[1].height/2;
        trial.stimuli[4].x2 = std_posX + trial.stimuli[1].width/2 - std_arrow_len*Math.cos(angle);
        trial.stimuli[4].y2 = std_posY - trial.stimuli[1].height/2 - std_arrow_len*Math.sin(angle);

        trial.stimuli[5].x1 = std_posX + trial.stimuli[1].width/2;
        trial.stimuli[5].y1 = std_posY + trial.stimuli[1].height/2;
        trial.stimuli[5].x2 = std_posX + trial.stimuli[1].width/2 - std_arrow_len*Math.cos(angle);
        trial.stimuli[5].y2 = std_posY + trial.stimuli[1].height/2 + std_arrow_len*Math.sin(angle);

        trial.stimuli[6].content = text;
        page ++

        if(arrow==1){
            trial.stimuli[7].startX = std_posX;
            trial.stimuli[7].startY = std_posY;
            trial.stimuli[8].startX = comp_posX;
            trial.stimuli[8].startY = comp_posY;
            if(ex_ID==0){
            trial.stimuli[7].image_height = std_height_default;
            trial.stimuli[8].image_height = comp_height;
            }else{
            trial.stimuli[7].image_width = std_width_default;
            trial.stimuli[8].image_width = comp_width;
            };
        }else{
            trial.stimuli[7].image_height = 0;
            trial.stimuli[8].image_height = 0;
        };
    },
    key_down_func: function(event){  
    if (event.key === 'ArrowUp') {
      trial_comp_len += comp_len_diff
      if (trial_comp_len > comp_len_max) trial_comp_len = comp_len_max;
    }
    else if (event.key === 'ArrowDown') {
      trial_comp_len -= comp_len_diff;
      if (trial_comp_len < comp_len_min) trial_comp_len = comp_len_min;
    }
     console.log(n_trial)
     if(ex_ID==0){
        jsPsych.getCurrentTrial().stim_array[0].height = trial_comp_len;
     }else{
        jsPsych.getCurrentTrial().stim_array[0].width = trial_comp_len;
     }
  },  
};






var start_experiment_test = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p><b>実験の説明</b></p>",
    choices: " ",
    prompt: "<p>画面に，二つの図形（長方形）が表示されます。<br/><br/>"+
    "<b><u>矢羽がついた左上の図</u></b>と<b><u>矢羽のない右下の図の</u></b><br/><br/>"+
    "長方形の"+(ex_ID==0?`<font color="red"><b><u>縦方向の</u></b></font>`:`<font color="red"><b><u>横方向の</u></b></font>`)+"長さを調整し，同じ長さに見えるようにしてください。<br/><br/>"+
    "<b><u>十字キーの上ボタン</u></b>を押すと<b><u>長くなり</u></b>，<b><u>下ボタン</u></b>を押すと<b><u>短くなり</u></b>ます。<br/><br/>"+
    "あなたが同じ長さであると感じたところで<b><u>赤いボタン</u></b>を押して決定してください。<br/><br/><br/>"+
    "次に，<b></u>赤いボタン</u></b>を押すと詳しい説明に移ります。"+
    "</p>",
    on_start:(trial)=>{
        if(ex_ID != 0&&ex_ID != 1){
            trial.stimulus ="<p><b>エラーが発生しています。</b></p>" 
            trial.prompt = "<p>実験プログラムにエラーが生じています。</p>"+
            "<p>URLクエリが正しいか確認してください。</p>"+
            "<p>あなたが実験責任者でない場合，その場に実験責任者が居ればその旨を伝えてください。</p>"+
            "<p>その後，このページを閉じ，終了してください</p>"+
            "<p>何度もこのエラーが生じる場合，以下の連絡先にご一報くださると幸いです。"+
            "<p>立命館大学</p>"+
            "<p>総合心理学部　4回生</p>"+
            "<p>福井　岳</p>"+
            "<p>cp0197rv@ed.ritsumei.ac.jp</p>"
            trial.choices = "NO_KEYS"
            //これ現状だと先に進んでしまいます。そこもいじれる様にしましょう。
            //しました。
            //ex_IDによる教示文の条件分岐の方法は要考察
            //変数ごと変えるのか，各パラメータにIF文をおくか。
            //それも解決済み
        }
    },
};
var start_experiment = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p><b>図形の大きさを合わせる実験</b></p>",
    choices: " ",
    prompt: "<p>画面に，二つの図形（長方形）が表示されます。<br/><br/>"+
    "<b><u>矢羽がついた左上の図</u></b>と<b><u>矢羽のない右下の図の</u></b><br/><br/>"+
    "長方形の"+(ex_ID==0?`<font color="red"><b><u>縦方向の</u></b></font>`:`<font color="red"><b><u>横方向の</u></b></font>`)+"長さを調整し，同じ長さに見えるようにしてください。<br/><br/>"+
    "<b><u>十字キーの上ボタン</u></b>を押すと<b><u>長くなり</u></b>，<b><u>下ボタン</u></b>を押すと<b><u>短くなり</u></b>ます。<br/><br/>"+
    "あなたが同じ長さであると感じたところで<b><u>赤いボタン</u></b>を押して決定してください。<br/><br/>"+
    "<b>【注意】</b>本番では赤い矢印は表示されません。あなたが等しいと感じたところで決定してください。</br></br>"+
    "正確性によって成績を付けるものではないので，じっくり考え込む必要はありません。直感に従い，回答してください。</br></br>"+
    "赤いボタンを押すと実験が始まります。"+
    "</p>",
    on_start:(trial)=>{
        if(ex_ID == 4){
            trial.stimulus ="<p><b>エラーが発生しています。</b></p>" 
            trial.prompt = "<p>実験プログラムにエラーが生じています。</p>"+
            "<p>URLクエリが正しいか確認してください。</p>"+
            "<p>あなたが実験責任者でない場合，その場に実験責任者が居ればその旨を伝えてください。</p>"+
            "<p>その後，このページを閉じ，終了してください</p>"+
            "<p>何度もこのエラーが生じる場合，以下の連絡先にご一報くださると幸いです。"+
            "<p>立命館大学</p>"+
            "<p>総合心理学部　4回生</p>"+
            "<p>福井　岳</p>"+
            "<p>cp0197rv@ed.ritsumei.ac.jp</p>"
            trial.choices = "NO_KEYS"
            //これ現状だと先に進んでしまいます。そこもいじれる様にしましょう。
            //しました。
            //ex_IDによる教示文の条件分岐の方法は要考察
            //変数ごと変えるのか，各パラメータにIF文をおくか。
        }
    },
};
// 実験終了時の画面
var finish_experiment = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    on_start: (trial) => {
      var dt = jsPsych.data.get().filter([{record: 1}]);    
      dt = dt.ignore(["response","response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "stimulus", "center_x", "center_y", "record"]);
      var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"");
      if(!debug_mode){
      trial.stimulus = 
      "<p>実験はこれで終了です。ご協力ありがとうございました。</p>"+"<p>質問，疑問等があれば以下の連絡先にご一報くださると幸いです。</p>"+
      "<p>立命館大学</p>"+
      "<p>総合心理学部　4回生</p>"+
      "<p>福井　岳</p>"+
      "<p>cp0197rv@ed.ritsumei.ac.jp</p>";
        ex_type = (ex_ID==0?"vertical":"horizontal")
      dt.localSave('csv', `WMIllusion_${ex_type}_result.csv`);
      }else{
    trial.stimulus = '<p>実験デモ終了</p>'+
    '<textarea style="width:600px; height: 300px">'+txt+'</textarea>';
      }  
    },
};

//フルスクはじまり
var start_fullscreen = {
    type: jsPsychFullscreen,
    message: "<p>ウィンドウサイズを最大化します。赤いボタンを押してください。</p>",
    button_label: "",
    fullscreen_mode: true, // 全画面表示にする
    on_start:(trial)=>{
        if(debug_mode){
            trial.message = "<p><b>デバッグモードで実行しています。</b></p>"+
            "<p>今回の実験IDは<b>"+ex_ID+"</b>です。</p>"+
            (ex_ID == 0?"<p><b><u>【0:縦比較】</u></b>【1:横比較】</p>":
                "<p>【0:縦比較】<b><u>【1:横比較】</u></b></p>")+
                "<p>【注意！】デバッグモードのため，ファイルのDLが行われません。</p>"
                
        }else{
            trial.message = "<p><b>実験を実施します。</b></p>"+"<p>今回の実験IDは<b>"+ex_ID+"</b>です。</p>"+
            (ex_ID == 0?"<p><b><u>【0:縦比較】</u></b>【1:横比較】</p>":
                "<p>【0:縦比較】<b><u>【1:横比較】</u></b></p>")+
                "<p>正しければ赤いボタンを押して次に進んでください。</p>"
        };
    },

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
    timeline : [start_fullscreen,start_experiment_test],
};
var finish_procedure = {
    timeline:[finish_fullscreen,finish_experiment],
};
var trial_procedure = {
    timeline: [trial],
    timeline_variables: factors,
    randomize_order: true,
};
var test_procedure = {
    timeline:[test_trial],
    timeline_variables: test_factors,
    randomize_order: false,
};

jsPsych.run([start_procedure,test_procedure,start_experiment,trial_procedure,finish_procedure]); // 提示順序の指定



//コードに間違いがないかの再確認
//教示文
//記録に誤りがないか
//練習試行の再調整