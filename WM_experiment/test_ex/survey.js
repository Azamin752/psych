//WM錯視
var jsPsych = initJsPsych({});

var survey_personalID = {
  type: jsPsychSurveyHtmlForm,
  preamble: '<p>実験IDを確認します。</p>',
  html: '<p>同意書に記載されていた実験IDを入力してください。</p>'+
   '<input type="text" id="test-resp-box" name="response" size="10" />',
  autofocus: 'test-resp-box'
};
//同意書に参加者IDを手で記載しておきます。
jsPsych.run([survey_personalID]); // 提示順序の指定