//WM錯視
var jsPsych = initJsPsych({});

var debug_mode = true;
//デバッグモード切り替え デバッグモード時，データファイルの生成・実験IDのランダム振り当てと事前の表示

//実験ID（条件）
//0:標準縦・比較縦;1:標準縦・比較横;2:標準横・比較縦;3:標準横・比較横;
var ex_ID = (debug_mode?Math.floor(Math.random()*4):jsPsych.data.getURLVariable("exid")??4);

// 表示領域サイズ
var canvas_width = 600;
var canvas_height = 600;

//実験パラメータ
var std_width_default= 150; // 標準刺激の長辺のデフォ値
var std_height_default = 75; // 標準刺激の短辺のデフォ値
var std_arrow_len = 50; // 矢羽の長さ
var comp_width_default = 150; // 比較刺激の長辺のデフォ値
var comp_height_default = 75;// 比較刺激の短辺のデフォ値

var std_angle; // 標準刺激の角度
var std_width; //標準刺激の長辺
var std_height; //標準刺激の短辺
var comp_width; //比較刺激の長辺
var comp_height; //比較刺激の短辺
//↑これ何？
var std_posX = 200; // 標準刺激（ML）のX座標
var std_posY = 200; // 標準刺激（ML）のY座標
var comp_posX = 400; // 比較刺激のX座標
var comp_posY = 400; // 比較刺激のY座標

var red_arrow_0 = "../../image/red_arrow_0.png"
var red_arrow_90 = "../../image/red_arrow_90.png"


var fac = {
    angle:[60,300,0],
    s_wid:[],
    s_hei:[],
    c_wid:[],
    c_hei:[],
};

//どうやらIDごとに各パラメータをリストとしてまとめるのがよさそう？配列内配列的なやつで

if(ex_ID == 0||ex_ID == 1){
    fac.s_wid = [0];
    fac.s_hei = [-25,0,25];
}else if(ex_ID == 2||ex_ID == 3){
    fac.s_wid = [-50,0,50];
    fac.s_hei = [0];
}else{
    fac.s_wid = [0];
    fac.s_hei = [0];
};
//0,1:標準刺激が縦に変化;2,3:標準刺激が横に変化
//変動値を参照で計算しないのは，比率を細かく変える可能性があるため。

if(ex_ID == 0||ex_ID == 2){
    fac.c_wid = [0];
    fac.c_hei = [-25,-20,-15,-10,-5,0,5,10,15,20,25];
}else if(ex_ID == 1||ex_ID == 3){
    fac.c_wid = [-50,-40,-30,-20,-10,0,10,20,30,40,50];
    fac.c_hei = [0];
}else{
    fac.c_wid = [0];
    fac.c_hei = [0];
};
//0,2:比較刺激が縦に変化;1,3:比較刺激が横に変化

var factors = jsPsych.randomization.factorial(fac, 1);
console.log(factors)
var test_factors = [
    {page:1,choice:" ",arrow:0,text:"実験の説明を行います。\n[spaceキーで次へ]"},
    {page:2,choice:" ",arrow:0,text:"画面に，上のような図が表示されます。\n[spaceキーで次へ]"},
    {page:3,choice:" ",arrow:1,text:"この時，この2箇所の長さを比較してください。\n[spaceキーで次へ]"},
    {page:4,choice:"j",arrow:1,text:"右の方が長いと感じたら[J]キーを押してください。\n[Jキーを押してください。]"},
    {page:5,choice:"f",arrow:1,text:"左の方が長いと感じたら[F]キーを押してください。\n[Fキーを押してください。]"},
    {page:6,choice:" ",arrow:1,text:"これをn回繰り返します。\n[spaceキーで次へ]"},
    {page:7,choice:" ",arrow:1,text:"現在の進行度は下部に表示されます。\n[spaceキーで次へ]"},
    {page:8,choice:" ",arrow:1,text:"【注意】\n・自分が感じたように回答し，\n物理的な長さを測らないでください。\n・長さが同じように感じても，\n直感でどちらかを回答してください。"},
    {page:9,choice:" ",arrow:1,text:"spaceキーを押すと本実験に移ります。\n[spaceキーで次へ]"},
];
var n_trial = 0;
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
    width:comp_width_default,
    height:comp_height_default,
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
    file:(ex_ID==0||ex_ID==2?red_arrow_0:red_arrow_90),
};
//これの設定はホントはいろいろ問題あります。
//大きさのデフォ値に0を入れておかないのも，回転させずに2ファイル用意してるのも，pixiにしておかなかった私の罪と言えます。
//矢印を画像にしたのは，ぶっちゃけこれが一番早いからです。

var survey_personalID = {
  type: jsPsychSurveyHtmlForm,
  preamble: '<p>実験IDを確認します。</p>',
  html: '<p>同意書に記載されていた実験IDを入力してください。</p>'+
   '<input type="text" id="test-resp-box" name="response" size="10" />',
  autofocus: 'test-resp-box',
  data:{
    record:1
  }
};
//同意書に参加者IDを手で記載しておきます。
//これ，撮ったIDを記録しておかなきゃ

//試行変数
var trial = {
    type:jsPsychPsychophysics,
    stimuli:[comp_rect,std_rect,std_arrow,std_arrow,std_arrow,std_arrow,text_object],
    response_type:'key',
    choices:['f','j'],
    canvas_width: canvas_width,
    canvas_height:canvas_height,
    background_color: '#DDDDDD',
    std_angle:jsPsych.timelineVariable("angle"),
    std_width:jsPsych.timelineVariable("s_wid"),
    std_height:jsPsych.timelineVariable("s_hei"),
    comp_width:jsPsych.timelineVariable("c_wid"),
    comp_height:jsPsych.timelineVariable("c_hei"),
    data:{
        std_angle:jsPsych.timelineVariable("angle"),
        std_width:jsPsych.timelineVariable("s_wid"),
        std_height:jsPsych.timelineVariable("s_hei"),
        comp_width:jsPsych.timelineVariable("c_wid"),
        comp_height:jsPsych.timelineVariable("c_hei"),
        record:1,
        exID:ex_ID,
        //ここにexIDと参加者IDは載せておきたいな。
    },
    on_start:(trial)=>{
        var std_angle = trial.std_angle * Math.PI/180/2; // 標準刺激の角度
        var std_width = trial.std_width; //標準刺激の長辺
        var std_height = trial.std_height; //標準刺激の短辺
        var comp_width = trial.comp_width; //比較刺激の長辺
        var comp_height = trial.comp_height; //比較刺激の短辺
        trial.stimuli[0].width += comp_width;
        trial.stimuli[0].height += comp_height;
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
        //ここの定義はもうちょっといじったほうが良さそう。完成形を見据えておくこと。
        //trial.stimuli[1].height = trial.stimuli[1].height +うんたら　みたいな指定方法二してみるのはどう？
        //現状報告
        //何故か動きません。エラーメッセ，ID振り当て，TLVの全てを消すと動きます。
        //この右のやり方なら何故か動きます。
        //動きました，"timelineVariable"です。
    },
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
            if(ex_ID==0||ex_ID==2){
            trial.stimuli[7].image_height = std_height_default;
            trial.stimuli[8].image_height = comp_height_default;
            }else{
            trial.stimuli[7].image_width = std_width_default;
            trial.stimuli[8].image_width = comp_width_default;
            };
        }else{
            trial.stimuli[7].image_height = 0;
            trial.stimuli[8].image_height = 0;
        };
    },
};






var start_experiment_test = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p><b>実験の説明</b></p>",
    choices: " ",
    prompt: "<p>画面に，二つの図形（長方形）が表示されます。<br/><br/>"+
    "<b><u>矢羽がついた左の図</u></b>と<b><u>矢羽のない右の図</u></b><br/><br/>"+
    "の長方形の"+(ex_ID==0||ex_ID==2?"<b><u>縦の</u></b>":"<b><u>横の</u></b>")+"長さを比較してください。<br/><br/>"+
    "左の方が長いと感じたら<b><u>[F]キー</u></b>を，右の方が長いと感じたら<b><u>[J]キー</u></b>を押してください。<br/><br/>"+
    "同じ長さに感じても必ずどちらかを選択してください。<br/><br/>"+
    "<b></u>[space]キー</u></b>を押すと詳しい説明に移ります。"+
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
            //それも解決済み
        }
    },
};
var start_experiment = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p><b>大きさを比べる実験</b></p>",
    choices: " ",
    prompt:　"<p>画面に，二つの図形（長方形）が表示されます。<br/><br/>"+
    "<b><u>矢羽がついた左の図</u></b>と<b><u>矢羽のない右の図</u></b><br/><br/>"+
    "の長方形の"+(ex_ID==0||ex_ID==2?"<b><u>縦の</u></b>":"<b><u>横の</u></b>")+"長さを比較してください。<br/><br/>"+
    "左の方が長いと感じたら<b><u>[F]キー</u></b>を，右の方が長いと感じたら<b><u>[J]キー</u></b>を押してください。<br/><br/>"+
    "同じ長さに感じても必ずどちらかを選択してください。<br/><br/>"+
    "[space]キーを押すと実験が始まります。"+
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
      dt = dt.ignore(["response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "stimulus", "center_x", "center_y", "record"]);
      trial.stimulus = 
      "<p>実験はこれで終了です。ご協力ありがとうございました。</p>"+"<p>質問，疑問等があれば以下の連絡先にご一報くださると幸いです。</p>"+
      "<p>立命館大学</p>"+
      "<p>総合心理学部　4回生</p>"+
      "<p>福井　岳</p>"+
      "<p>cp0197rv@ed.ritsumei.ac.jp</p>";
      if(debug_mode){
      dt.localSave('csv', 'WMIllusion_result.csv');
      }  
    },
};
//フルスクはじまり
var start_fullscreen = {
    type: jsPsychFullscreen,
    message: "<p>ウィンドウサイズを最大化します。下のボタンを押してください。</p>",
    button_label: "次へ",
    fullscreen_mode: true, // 全画面表示にする
    on_start:(trial)=>{
        if(debug_mode){
            trial.message = "<p><b>デバッグモードで実行しています。</b></p>"+"<p>今回の実験IDは<b>"+ex_ID+"</b>です。</p>"+
            (ex_ID == 0?"<p><b><u>【0:標準縦・比較縦】</u></b>【1:標準縦・比較横】</p>"+"<p>【2:標準横・比較縦】【3:標準横・比較横】</p>":
                (ex_ID == 1?"<p>【0:標準縦・比較縦】<b><u>【1:標準縦・比較横】</u></b></p>"+"<p>【2:標準横・比較縦】【3:標準横・比較横】</p>":
                    (ex_ID == 2?"<p>【0:標準縦・比較縦】【1:標準縦・比較横】</p>"+"<p><b><u>【2:標準横・比較縦】</u></b>【3:標準横・比較横】</p>":
                        "<p>【0:標準縦・比較縦】【1:標準縦・比較横】</p>"+"<p>【2:標準横・比較縦】<b><u>【3:標準横・比較横】</u></b></p>")
                ))
        };
    },
};


//フルスク終わり
var finish_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false, // 全画面表示を解除
};

//手続き
var start_procedure = {
    timeline : [start_fullscreen,survey_personalID,start_experiment_test],
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



//残りの課題
//練習課題の実装【完】
//刺激パラメータ（提示位置とサイズ，変動値）
//もろもろの教示などの設定
//デバッグでは最初の画面でexIDを指定できるようにする【リセマラすりゃいいから完】
//こじんIDの設定によるデータの紐づけ!!