var slider,slider2,slider3
function setup() {
  createCanvas(800, 200);
  strokeWeight(5)
  mode = 0

  center_XL = width/4
  center_XR = width*3/4
  center_Y = height/2
  

  
  

  
  textAlign(CENTER, CENTER);
  textSize(15);
  
  
  
  slider = createSlider(75, 225, random(75,225))
  slider2 = createSlider(0, 150, random(50,100))
  slider3= createSlider(0, 100, random(0,100))
  
}

function draw() {
  inner_length = slider.value()
  outer_length = 150
  inner_L = center_XL - (inner_length/2)
  inner_R = center_XL + (inner_length/2)

  outer_L = center_XR - (outer_length/2)
  outer_R = center_XR + (outer_length/2)
  
  arrow_length = slider2.value()
    inner_angle = slider3.value()/100*PI
  outer_angle = PI-slider3.value()/100*PI
  
  
  
  background(220);
 stroke(0)
  
  
  //内向
  line(inner_L,center_Y,inner_R,center_Y)
  line(inner_L,
      center_Y,
      inner_L + cos(inner_angle)*arrow_length,
      center_Y + sin(inner_angle)*arrow_length)
  
  line(inner_L,
      center_Y,
      inner_L + cos(inner_angle)*arrow_length,
      center_Y - sin(inner_angle)*arrow_length)
  
  line(inner_R,
      center_Y,
      inner_R - cos(inner_angle)*arrow_length,
      center_Y + sin(inner_angle)*arrow_length)
  
  line(inner_R,
      center_Y,
      inner_R - cos(inner_angle)*arrow_length,
      center_Y - sin(inner_angle)*arrow_length)
  
  
  //外向
  line(outer_L,center_Y,outer_R,center_Y)
  line(outer_L,
      center_Y,
      outer_L + cos(outer_angle)*arrow_length,
      center_Y + sin(outer_angle)*arrow_length)
  
  line(outer_L,
      center_Y,
      outer_L + cos(outer_angle)*arrow_length,
      center_Y - sin(outer_angle)*arrow_length)
  
  line(outer_R,
      center_Y,
      outer_R - cos(outer_angle)*arrow_length,
      center_Y + sin(outer_angle)*arrow_length)
  
  line(outer_R,
      center_Y,
      outer_R - cos(outer_angle)*arrow_length,
      center_Y - sin(outer_angle)*arrow_length)
  
 //見本刺激
  if(mode==1){
  stroke(255,0,0)
  line(mouseX-outer_length/2,mouseY,mouseX+outer_length/2,mouseY)
    noStroke()
text("マウスカーソル上に見本が表示されています。Aキーで終了。",width/2,190)
  }else{
    noStroke()
    text("Aキーを押すと見本（外向図形と同じ長さの線分）が表示されます",width/2,190)
}
  
       //保存
    if(keyIsPressed&&pre==0){
      if(key == "a"){
      if(mode==0){
        mode=1
      }else if(mode==1){
        mode=0
      }
      } 
    }
  
     
     //前フレームキー押し判定
  if(keyIsPressed){
    pre = 1
  }else{
    pre = 0
  }
  
  
}
