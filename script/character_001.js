
// 座標を管理するためのクラス
class Position {
  static calcLength(x, y){
    return Math.sqrt(x * x + y * y);
  }

  // ベクトルを単位化した結果を返す静的メソッド
  static calcNormal(x, y){
    let len = Position.calcLength(x, y);
    return new Position(x / len, y / len);
  }

  constructor(x, y){
    this.x = x; // X座標
    this.y = y; // Y座標
  }
  // 値を設定する
  set(x, y){
    if(x != null){this.x = x;}
    if(y != null){this.y = y;}
  }
  // 対象の Position クラスのインスタンスとの距離を返す
  distance(target){
    let x = this.x - target.x;
    let y = this.y - target.y;
    return Math.sqrt( x * x + y * y);
  }

  // 対象の Position クラスのインスタンスとの外積を計算する
  cross(target){
    return this.x * target.y - this.y * target.x;
  }

// 自身を単位化したベクトルを計算して返す
normalize(){
    // ベクトルの大きさを計算する
  let l = Math.sqrt(this.x * this.x + this.y * this.y);
  // 大きさが 0 の場合は XY も 0 なのでそのまま返す
  if(l === 0){
    return new Position(0, 0);
  }
  // 自身の XY 要素を大きさで割る
  let x = this.x / l;
  let y = this.y / l;
  // 単位化されたベクトルを返す
  return new Position(x, y);
}

//指定されたラジアン分だけ自身を回転させる
rotate(radian){
  // 指定されたラジアンからサインとコサインを求める
  let s = Math.sin(radian);
  let c = Math.cos(radian);
  // 2x2 の回転行列と乗算し回転させる
  this.x = this.x * c + this.y * -s;
  this.y = this.x * s + this.y * c;
 }
}

//キャラクター管理のためのクラス
class Character {
  constructor(ctx, x, y, w, h, life, imagePath){
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.vector = new Position(0.0, -1.0);
    this.angle = 270 * Math.PI / 180;
    this.width = w;
    this.height = h;
    this.life = life;
    this.ready = false;
    this.image = new Image();
    this.image.addEventListener('load', () => {
      //画像のロードが完了したら準備完了フラグを立てる
      this.ready = true;
    }, false);
    this.image.src = imagePath;
  }

  //ショットの進行方向を設定する
  setVector(x, y){
    //自身のvectorプロパティに設定する
    this.vector.set(x, y);
  }

  setVectorFromAngle(angle){
    //自身の回転量を設定する
    this.angle = angle;
    //ラジアンからサインとコサインを求める
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    //自身の 自身のvectorプロパティに設定する
    this.vector.set(cos, sin);
  }

  //キャラクターを描画する
  draw(){
    // キャラクターの幅を考慮してオフセットする量
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    // キャラクターの幅やオフセットする量を加味して描画する
    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - offsetY,
      this.width,
      this.height
    );
  }
  //自身の回転量を元に座標系を回転させる
  rotationDraw(){
    //座標系を回転する前の状態を保存する
    this.ctx.save();
    //自身の位置を座標系の中心と重なるように平行移動する
    this.ctx.translate(this.position.x, this.position.y);
    //座標系を回転させる（270度の位置を基準にするため Math.PI * 1.5　を引いている）
    this.ctx.rotate(this.angle - Math.PI * 1.5);

    //キャラクターの幅を考慮してオフセットする量
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    // キャラクターの幅やオフセットする量を加味して描画する
    this.ctx.drawImage(
      this.image,
      -offsetX,　//先に translate で平行移動しているのでオフセットのみ行う
      -offsetY,　//先に translate で平行移動しているのでオフセットのみ行う
      this.width,
      this.height
    );

    //座標系を回転する前の状態に戻す
    this.ctx.restore();
  }
}

//viper クラス
class Viper extends Character {
  constructor(ctx, x, y, w, h, imagePath){
    super(ctx, x, y, w, h, 0, imagePath);
    //自身の移動スピード
    this.speed = 3;
    //ショットを撃ったあとのチェック用カウンタ
    this.shotCheckCounter = 0;
    //ショットを撃つことが出来る間隔（フレーム数）
    this.shotInterval = 10;
    //viper が登場中かどうかを表すフラグ
    this.isComing = false;
    //登場演出を開始した際のタイムスタンプ
    this.comingStart = null;
    //登場演出を開始する座標
    this.comingStartPosition = null;
    //登場演出を完了とする座標
    this.comingEndPosition = null;
    //自身が持つショットインスタスの配列
    this.shotArray = null;
    //自身が持つシングルショットインスタンスの配列
    this.singleShotArray = null;
  }
  setComing(startX, startY, endX, endY){
    //自機キャラクターのライフを設定する
    this.life = 1;
    //登場中のフラグを立てる
    this.isComing = true;
    //登場開始時のタイプスタンプを取得する
    this.comingStart = Date.now();
    // 登場開始位置に自機を移動させる
    this.position.set(startX, startY);
    // 登場開始位置を設定する
    this.comingStartPosition = new Position(startX, startY);
    //登場終了とする座標を設定する
    this.comingEndPosition = new Position(endX, endY);
  }

//ショットを設定する
setShotArray(shotArray, singleShotArray){
  //自身のプロパティに設定する
  this.shotArray = shotArray;
  this.singleShotArray = singleShotArray;
}

update(){
  //ライフが尽きていたら何も操作出来ないようにする
  if(this.life <= 0){return;}
  //登場シーンが始まってからの経過時間
  let justTime = Date.now();

  //登場シーンの処理
  if(this.isComing === true){
    // 登場シーンが始まってからの経過時間
    let comingTime = (justTime - this.comingStart) / 1000;
    //登場シーン中は時間が経つほど上に向かって進む
    let y = this.comingStartPosition.y - comingTime * 50;
    //一定の位置まで行ったら登場シーンを終了する
    if(y <= this.comingEndPosition.y){
      this.isComing = false;        //登場シーンを止める
      y = this.comingEndPosition.y; //行き過ぎ防止のためYの位置を再設定
    }
    //求めたY座標を自機に設定する
    this.position.set(this.position.x, y);

    //自機の登場演出時は点滅させる
    if(justTime % 100 < 50){
      this.ctx.globalAlpha = 0.5;
    }
  }else{
    if(window.isKeyDown['key_a'] === true){
      this.position.x -= this.speed;
    }
    if(window.isKeyDown['key_d'] === true){
      this.position.x += this.speed;
    }
    if(window.isKeyDown['key_w'] === true){
      this.position.y -= this.speed;
    }
    if(window.isKeyDown['key_s'] === true){
      this.position.y += this.speed;
    }
    let canvasWidth = this.ctx.canvas.width;
    let canvasHeight = this.ctx.canvas.height;
    let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
    let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
    this.position.set(tx, ty);

    //キーの押下状態を調べてショットを生成する
    if(window.isKeyDown['key_ '] === true){
      //ショットを撃てる状態なのかを確認する
      //ショットチェック用が０以上ならショットを生成できる
      if(this.shotCheckCounter >= 0){
        let i;
      //ショットの生存を確認し非生存のものがあれば生成する
      for(i = 0; i < this.shotArray.length; ++i){
        //非生存かどうか確認する
        if(this.shotArray[i].life <= 0){
          //自機キャラクターの座標にショット生成する
          this.shotArray[i].set(this.position.x, this.position.y);
          //中央のショットは攻撃力をを2にする
          this.shotArray[i].setPower(2)
          //ショットを生成したのでインターバル設定する
          this.shotCheckCounter = -this.shotInterval;
          //ひとつ生成したらループを抜ける
          break;
        }
      }
      //シングルショットの生成を確認し非生存のものがあれば生成する
      //このとき、２個をワンセットで生成し左右に進行方向を振り分ける
      for(i = 0; i < this.singleShotArray.length; i += 2){
        //非生存かどうか確認する
        if(this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0){
          //真上の方向（270度）から左右に10度傾いたラジアン
          let radCW = 280 * Math.PI / 180;  //時計回りに10度
          let radCCW = 260 * Math.PI / 180; //反時計回りに10度
          //自機キャラクターの座標にショット生成する
          this.singleShotArray[i].set(this.position.x, this.position.y);
          this.singleShotArray[i].setVectorFromAngle(radCW);
          this.singleShotArray[i + 1].set(this.position.x, this.position.y);
          this.singleShotArray[i + 1].setVectorFromAngle(radCCW);
          //ショットを生成したのでインターバル設定する
          this.shotCheckCounter = -this.shotInterval;
          //ひとつ生成したらループを抜ける
          break;
        }
      }
    }
  }
    //ショットチェック用のカウンタをインクリメントする
    ++this.shotCheckCounter;
  }

  // 自機キャラクターを描画する
  this.draw();

  //念のため透明度を元に戻す
  this.ctx.globalAlpha = 1.0;
 }
}

//敵キャラクタークラス
class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath){
    // 継承元の初期化
    super(ctx, x, y, w, h, 0, imagePath);
    // 自身のタイプ
    this.type = 'default';
    // 自身が出現してからのフレーム数
    this.frame = 0;
    // 移動スピード
    this.speed = 3;
    // 自身が持つショットインスタンスの配列
    this.shotArray = null;
    // 自身が攻撃の対象とする Character 由来のインスタンス
    this.attackTarget = null;
  }

   // 敵を配置する
    set(x, y, life = 1, type = 'default'){
      // 登場開始位置に敵キャラクターを移動させる
      this.position.set(x, y);
      // 敵キャラクターのライフを0より大きい値に設定する
      this.life = life;
      // 敵キャラクターのタイプを設定する
      this.type = type;
      // 敵キャラクターのフレームをリセットする
      this.frame = 0;
    }

    // ショットを設定する
        setShotArray(shotArray){
      // 自身のプロパティに設定する
      this.shotArray = shotArray;
  }

  // 攻撃対象を設定する
  setAttackTarget(target){
    // 自身のプロパティに設定する
    this.attackTarget = target;
  }


    // キャラクターの状態を更新し描画を行う
      update(){
        // もし敵キャラクターのライフが0以下の場合は何もしない
        if(this.life <= 0){return;}

        // タイプに応じて挙動を変える
        // タイプに応じてライフを 0 にする条件も変える
        switch(this.type){
          // waveタイプはサイン波で左右に揺れるように動く
          // ショットの向きは放射状にばらまく
          case 'wave':
          // 配置後のフレームが 60 で割り切れる時にショットを放つ
          if(this.frame % 60 === 0){
            // 攻撃対象となる自機キャラクターに向かうベクトル
             let tx = this.attackTarget.position.x - this.position.x;
             let ty = this.attackTarget.position.y - this.position.y;
            // ベクトルを単位化する
            let tv = Position.calcNormal(tx, ty);
            // 自機キャラクターにややゆっくりめのショットを放つ
            this.fire(tv.x, tv.y, 4.0);
          }
          //X座標はサイン波で、Y座標は一定量で変化する
          this.position.x += Math.sin(this.frame / 10);
          this.position.y += 2.0;
          //もし敵キャラクターが画面外へ移動したらライフを0に設定する
          if(this.position.y - this.height > this.ctx.canvas.height){
              this.life = 0;
          }
          break;
          // largeタイプはサイン波で左右に揺れるようにゆっくり動く
          // ショットの向きは放射状にばらまく
          case 'large':
          if(this.frame % 50 === 0){
            // 45 度ごとにオフセットした全方位弾を放つ
            for(let i = 0; i < 360; i += 45){
              let r = i * Math.PI / 180;
              // ラジアンからサインとコサインを求める
              let s = Math.sin(r);
              let c = Math.cos(r);
              // 求めたサイン・コサインでショットを放つ
              this.fire(c, s, 3.0);
            }
          }
          // X 座標はサイン波で、Y 座標は一定量で変化する
          this.position.x += Math.sin((this.frame + 90) / 50) *2.0;
          this.position.y += 1.0;
         // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
          if(this.position.y - this.height > this.ctx.canvas.height){
              this.life = 0;
          }
          break;
          // default タイプは設定されている進行方向にまっすぐ進むだけの挙動
          // ショットの向きは常に真下に向かって放つ
          case 'default':
          default:
                // 配置後のフレームが 100 のときにショットを放つ
                if(this.frame === 100){
                    this.fire();
                }
                // 敵キャラクターを進行方向に沿って移動させる
                this.position.x += this.vector.x * this.speed;
                this.position.y += this.vector.y * this.speed;
                //もし敵キャラクターが画面外へ移動したらライフを0に設定する
                if(this.position.y - this.height > this.ctx.canvas.height){
                    this.life = 0;
                }
                break;
      }
        //描画を行う
        this.draw();
        //自身のフレームをインクリメントする
        ++this.frame;
      }

      //自身から指定された方向にショットを放つ
      fire(x = 0.0, y = 1.0, speed = 5.0){
          // ショットの生存を確認し非生存のものがあれば生成する
          for(let i = 0; i < this.shotArray.length; ++i){
              // 非生存かどうかを確認する
              if(this.shotArray[i].life <= 0){
                  // 敵キャラクターの座標にショットを生成する
                  this.shotArray[i].set(this.position.x, this.position.y);
                  // ショットのスピードを設定する
                  this.shotArray[i].setSpeed(speed);
                  // ショットの進行方向を設定する（真下）
                  this.shotArray[i].setVector(x, y);
                  // ひとつ生成したらループを抜ける
                  break;
              }
          }
      }
  }


//ボスキャラクタークラス

class Boss extends Character {
  constructor(ctx, x, y, w, h, imagePath){
    super(ctx, x, y, w, h, 0, imagePath);

    // 自身のモード
    this.mode = '';
    // 自身が出現してからのフレーム数
    this.frame = 0;
    // 自身の移動スピード
    this.speed = 3;
    // 自身が持つショットインスタンスの配列
    this.shotArray = null;
    //　自身が持つホーミングショットインスタンスの配列
    this.homingArray = null;
    // 自身が攻撃対象とする Character 由来のインスタンス
    this.attackTarget = null;
  }

  // ボスを配置する
  set(x, y, life = 1){
    // 登場開始位置にボスキャラクターを移動させる
    this.position.set(x, y);
    // ボスキャラクターのライフを 0 より大きい値（生存の状態）に設定する
    this.life = life;
    // ボスキャラクターのフレームをリセットする
    this.frame = 0;
  }

  // ショットを設定する
      setShotArray(shotArray){
    // 自身のプロパティに設定する
    this.shotArray = shotArray;
}

  // ホーミングショットを設定する
  setHomingArray(homingArray){
    //　自身のプロパティに設定する
    this.homingArray = homingArray;
  }

  // 攻撃対象を設定する
  setAttackTarget(target){
    // 自身のプロパティに設定する
    this.attackTarget = target;
  }

  //　モードを設定する
  setMode(mode){
    //　自身のプロパティに設定する
    this.mode = mode;
  }

  //ボスキャラクターの状態を更新し描画を行う
  update(){
    // もしボスキャラクターのライフが 0 以下の場合はなにもしない
    if(this.life <=0){return;}

    // モードに応じて挙動を変える
    switch(this.mode){
      // 出現演出時
      case 'invade':
      this.position.y += this.speed;
      if(this.position.y > 100){
        this.position.y = 100;
        this.mode = 'floating';
        this.frame = 0;
      }
      break;
    // 退避する演出時
    case 'escape':
    this.position.y -= this.speed;
    if (this.position.y < -this.height){
      this.life = 0;
    }
    break;
    case 'floating':
    // 配置後のフレーム数を 1000 で割ったときに、余りが 500 未満となる
    //　場合と、そうでない場合で、ショットに関する挙動を変化させる
    if(this.frame % 1000 < 500){
      // 配置後のフレーム数を 200 で割った余りが 140 より大きく、かつ、
      // 10 で割り切れる場合に、自機キャラクター狙いショットを放つ
      if(this.frame % 200 > 140 && this.frame % 10 === 0){
        // 攻撃対象となる自機キャラクターに向かうベクトル
        let tx = this.attackTarget.position.x - this.position.x;
        let ty = this.attackTarget.position.y - this.position.y;
       // ベクトルを単位化する
       let tv = Position.calcNormal(tx, ty);
       // 自機キャラクターにややゆっくりめのショットを放つ
       this.fire(tv.x, tv.y, 3.0);
     }
   }else{
     // ホーミングショットを放つ
     if(this.frame % 50 === 0) {
       this.homingFire(0, 1, 3.5);
     }
    }
    // X 座標はサイン波で左右に揺れるように動かす
    this.position.x += Math.cos(this.frame / 100) * 2.0;
  　  break;
  default:
  　  break;
    }

      // 描画を行う（いまのところ特に回転は必要としていないのでそのまま描画）
      this.draw();
      // 自身のフレームをインクリメントする
      ++this.frame;
    }
    //自身から指定された方向にショットを放つ
    fire(x = 0.0, y = 1.0, speed = 5.0){
      // ショットの生存を確認し非生存のものがあれば生成する
      for(let i = 0; i < this.shotArray.length; ++i){
        // 非生存かどうかを確認する
        if(this.shotArray[i].life <= 0){
          // 敵キャラクターの座標にショットを生成する
          this.shotArray[i].set(this.position.x, this.position.y);
          // ショットのスピードを設定する
          this.shotArray[i].setSpeed(speed);
          // ショットの進行方向を設定する（真下）
          this.shotArray[i].setVector(x, y);
          // ひとつ生成したらループを抜ける
          break;
        }
      }
    }

    // 自身から指定された方向にホーミングショットを放つ
    homingFire(x = 0.0, y = 1.0, speed = 3.0){
      // ショットの生存を確認し非生存のものがあれば生成する
      for(let i = 0; i < this.homingArray.length; ++i){
        // 非生存かどうかを確認する
        if(this.homingArray[i].life <= 0){
          // 敵キャラクターの座標にショットを生成する
          this.homingArray[i].set(this.position.x, this.position.y);
          // ショットのスピードを設定する
          this.homingArray[i].setSpeed(speed);
          // ショットの進行方向を設定する（真下）
          this.homingArray[i].setVector(x, y);
          // ひとつ生成したらループを抜ける
          break;
        }
      }
    }
  }

//shot クラス
class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath){
    super(ctx, x, y, w, h, 0, imagePath);
    //自身の移動スピード
    this.speed = 7;
    //自身の攻撃力
    this.power = 1;
    //自身の衝突判定を取る対象を格納する
    this.targetArray = [];
    //爆発エフェクトのインスタンスを格納する
    this.explosionArray = [];
  }

//ショットを配置する
set(x, y, speed, power){
  // 登場開始位置にショットを移動させる
  this.position.set(x, y);
  // ショットのライフを0より大きい値に設定する
  this.life = 1;
  //スピードを設定する
  this.setSpeed(speed);
  //攻撃力を設定する
  this.setPower(power);
}


//ショットのスピードを設定する
setSpeed(speed){
    // もしスピード引数が有効なら設定する
    if(speed != null && speed > 0){
        this.speed = speed;
    }
}


//ショットの攻撃力を設定する
setPower(power){
    // もしスピード引数が有効なら設定する
    if(power != null && power > 0){
        this.power = power;
    }
}

//ショットが衝突判定を行う対象を設定する
setTargets(targets){
  //引数の状態を確認して有効な場合は設定する
  if(targets != null && Array.isArray(targets) === true && targets.length > 0){
    this.targetArray = targets;
  }
}

//ショットが爆発エフェクトを発生できるよう設定する
setExplosions(targets){
  //引数の状態を確認し有効な場合は設定する
  if(targets != null && Array.isArray(targets) === true && targets.length > 0){
    this.explosionArray = targets;
  }
}

//キャラクターの状態を更新し描画を行う
update(){
  //もしショットのライフが0以下の場合はなにもしない
  if(this.life <= 0){return;}
  //もしショットが画面外へ移動したらライフを0に設定する
  if(
    this.position.x + this.width < 0 ||
    this.position.x - this.width > this.ctx.canvas.width ||
    this.position.y + this.height < 0 ||
    this.position.y - this.height > this.ctx.canvas.height
  ){
    this.life = 0;
  }
  //ショットを進行方向に沿って移動させる
  this.position.x += this.vector.x * this.speed;
  this.position.y += this.vector.y * this.speed;

  //ショットと対象との衝突判定を行う
  this.targetArray.map((v) => {
    //自身か対象のライフが0以下の対象は無視する
    if(this.life <= 0 || v.life <= 0){return;}
    //自身の位置と対象との距離を測る
    let dist = this.position.distance(v.position);
    //自身と対象の幅の1/4の距離まで近づいている場合衝突とみなす
    if(dist <= (this.width + v.width) / 4){
      if(v instanceof Viper === true){
        if(v.isComing === true){return;}
      }
      //対象のライフを攻撃力分減算する
      v.life -= this.power;
      //もし対象のライフが0以下になっていたら爆発エフェクトを発生させる
      if(v.life <= 0){
        for(let i = 0; i < this.explosionArray.length; ++i){
          if(this.explosionArray[i].life !== true){
            this.explosionArray[i].set(v.position.x, v.position.y);
            break;
          }
        }
        //もし対象が敵キャラクターの場合はスコアを加算する
        if(v instanceof Enemy === true){
          // 敵キャラクターのタイプによってスコアが変化するようにする
          let score = 100;
          if(v.type === 'large'){
            score = 1000;
          }
          // スコアシステムにもよるが仮でここでは最大スコアを制限
          gameScore = Math.min(gameScore + 100, 99999)
        }
      }
      //自身のライフを0にする
      this.life = 0;
    }
  });

  // 座標系の回転を考慮した描画を行う
  this.rotationDraw();
 }
}

//homing shot クラス
class Homing extends Shot {
  constructor(ctx, x, y, w, h, imagePath){
    // 継承元（Shot）の初期化
    super(ctx, x, y, w, h, imagePath);

    // 永遠に曲がり続けないようにするためにフレーム数を持たせる
    this.frame = 0;
  }

  // ホーミングショットを配置する
  set(x, y, speed, power){
    // 登場開始位置にショットを移動させる
    this.position.set(x, y);
    // ショットのライフを 0 より大きい値（生存の状態）に設定する
    this.life = 1;
    // スピードを設定する
    this.setSpeed(speed);
    // 攻撃力を設定する
    this.setPower(power);
    // フレームをリセットする
    this.flrame = 0;
  }

  //キャラクターの状態を更新し描画を行う
  update(){
    //もしショットのライフが0以下の場合はなにもしない
    if(this.life <= 0){return;}
    //もしショットが画面外へ移動したらライフを0に設定する
    if(
      this.position.x + this.width < 0 ||
      this.position.x - this.width > this.ctx.canvas.width ||
      this.position.y + this.height < 0 ||
      this.position.y - this.height > this.ctx.canvas.height
    ){
      this.life = 0;
    }
    //ショットをホーミングさせながら移動させる
    // ※ホーミングで狙う対象は、this.targetArray[0] のみに限定する
    let target = this.targetArray[0];
    // 自身のフレーム数が 100 より小さい場合はホーミングする
    if(this.frame < 100){
      // ターゲットとホーミングショットの相対位置からベクトルを生成する
      let vector = new Position(
        target.position.x - this.position.x,
        target.position.y - this.position.y
      );
      // 生成したベクトルを単位化する
      let normalizedVector = vector.normalize();
      // 自分自身の進行方向ベクトルも、念のため単位化しておく
      this.vector = this.vector.normalize();
      // ふたつの単位化済みベクトルから外積を計算する
      let cross = this.vector.cross(normalizedVector);
      // 外積の結果は、スクリーン空間では以下のように説明できる
      // 結果が 0.0     → 真正面か真後ろの方角にいる
      // 結果がプラス   → 右半分の方向にいる
      // 結果がマイナス → 左半分の方向にいる
      // １フレームで回転できる量は度数法で約 1 度程度に設定する
      let rad = Math.PI / 180.0;
      if(cross > 0.0){
        // 右側にターゲットがいるので時計回りに回転させる
        this.vector.rotate(rad);
      }else if (cross < 0.0) {
        //  左側にターゲットがいるので時計回りに回転させる
        this.vector.rotate(-rad);
      }
      // ※真正面や真後ろにいる場合はなにもしない
    }
    // 進行方向ベクトルを元に移動させる
    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;
    // 自身の進行方向からアングルを計算し設定する
    this.angle = Math.atan2(this.vector.y, this.vector.x);

    //ショットと対象との衝突判定を行う
    // ※以下は Shot クラスの衝突判定とまったく同じロジック
    this.targetArray.map((v) => {
      //自身か対象のライフが0以下の対象は無視する
      if(this.life <= 0 || v.life <= 0){return;}
      //自身の位置と対象との距離を測る
      let dist = this.position.distance(v.position);
      //自身と対象の幅の1/4の距離まで近づいている場合衝突とみなす
      if(dist <= (this.width + v.width) / 4){
        if(v instanceof Viper === true){
          if(v.isComing === true){return;}
        }
        //対象のライフを攻撃力分減算する
        v.life -= this.power;
        //もし対象のライフが0以下になっていたら爆発エフェクトを発生させる
        if(v.life <= 0){
          for(let i = 0; i < this.explosionArray.length; ++i){
            if(this.explosionArray[i].life !== true){
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }
          //もし対象が敵キャラクターの場合はスコアを加算する
          if(v instanceof Enemy === true){
            // 敵キャラクターのタイプによってスコアが変化するようにする
            let score = 100;
            if(v.type === 'large'){
              score = 1000;
            }
            // スコアシステムにもよるが仮でここでは最大スコアを制限
            gameScore = Math.min(gameScore + 100, 99999)
          }
        }
        //自身のライフを0にする
        this.life = 0;
      }
    });
    // 座標系の回転を考慮した描画を行う
    this.rotationDraw();
    // 自身のフレームをインクリメントする
    ++this.frame;
  }
}

//爆発エフェクトクラス
class Explosion {
  constructor(ctx, radius, count, size, timeRange, color = '#ff1166'){
    this.ctx = ctx;
    //爆発の生存状態を表すフラグ
    this.life = false;
    //爆発の色
    this.color = color;
    //自身の座標
    this.position = null;
    //爆発の広がりの半径
    this.radius = radius;
    //爆発の火花の数
    this.count = count;
    //爆発が始まった瞬間の時間
    this.startTime = 0;
    //爆発が消えるまでの時間
    this.timeRange = timeRange;
    //火花の1つ当たりの大きさ
    this.fireBaseSize = size;
    //火花のひとつ当たりの大きさを格納する
    this.fireSize =[];
    //火花の位置を格納する
    this.firePosition = [];
    //火花の進行方向を格納する
    this.fireVector =[];
  }

  //爆発のエフェクトを設定する
  set(x, y){
    //火花の個数分ループして生成する
    for(let i = 0; i < this.count; ++i){
      //引数を元に位置を決める
      this.firePosition[i] = new Position(x, y);
      //ランダムに火花が進む方向を決める
      let vr = Math.random() * Math.PI * 2.0;
      //ラジアンを元にサインとコサインを生成し進行方向を決める
      let s = Math.sin(vr);
      let c = Math.cos(vr);
      //進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
      let mr = Math.random();
      this.fireVector[i] = new Position(c * mr, s * mr);
      //火花の大きさをランダム化する
      this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
    }
    //爆発の生存状態を設定
    this.life = true;
    //爆発が始まる瞬間のタイムスタンプを取得する
    this.startTime = Date.now();
  }

//爆発エフェクトを更新する
update(){
  //生存状態を確認する
  if(this.life !== true){return;}
  //爆発エフェクト用の色を設定する
  this.ctx.fillStyle = this.color;
  this.ctx.globalAlpha = 0.5;
  //爆発が発生してからの経過時間を求める
  let time = (Date.now() - this.startTime) / 1000;
  //爆発終了までの時間で正規化して進捗度合いを算出する
  let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
  let progress = 1.0 -ease;

  //進捗度合いに応じた位置に火花を描画する
  for(let i = 0; i < this.firePosition.length; ++i){
    //火花が広がる距離
    let d = this.radius * progress;
    //広がる距離分だけ移動した位置
    let x = this.firePosition[i].x + this.fireVector[i].x * d;
    let y = this.firePosition[i].y + this.fireVector[i].y * d;
    //進捗を描かれる大きさにも反映させる
    let s = 1.0 - progress;
    //矩形を描画する
    this.ctx.fillRect(
      x - (this.fireSize[i] * s) / 2,
      y - (this.fireSize[i] * s) / 2,
      this.fireSize[i] * s,
      this.fireSize[i] * s
    );
  }

  //進捗が100％相当まで進んだいたら非生存の状態にする
  if(progress >= 1.0){
    this.life = false;
  　}
　}
}
// 背景が流れる星クラス
class BackgroundStar {
  constructor(ctx, size, speed, color = '#ffffff') {
    this.ctx = ctx;
    // 星の大きさ
    this.size = size;
    // 星の移動速度
    this.speed = speed;
    // 星を fill する際の色
    this.color = color;
    // 自身の座標
    this.position = null;
  }

  // 星を設定する
  set(x, y){
    // 引数を元に位置を決める
    this.position = new Position(x, y);
  }

  // 星を更新する
  update(){
    // 星の色を設定する
    this.ctx.fillStyle = this.color;
    // 星の現在位置を速度に応じて動かす
    this.position.y += this.speed;
    // 星の矩形を描画する
    this.ctx.fillRect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    );
    // もし画面下端よりも外に出てしまっていたら上端側に戻す
    if(this.position.y + this.size > this.ctx.canvas.height){
      this.position.y = -this.size;
    }
  }
}


function simpleEaseIn(t) {
  return t * t * t* t;
}
