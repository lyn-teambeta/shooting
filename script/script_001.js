(() => {
  // キーの押下状態を調べるためのオブジェクト
  window.isKeyDown = {};
  window.keyDownCounts = new Map();
  // スコアを格納する
  // windowオブジェクトのカスタムプロパティとして設定する
  window.gameScore = 0;
  // canvasの幅
  const CANVAS_WIDTH = 640;
  // canvasの高さ
  const CANVAS_HEIGHT = 480;
  // 敵キャラクター（小）のインスタンス数
  const ENEMY_SMALL_MAX_COUNT = 20;
  // 敵キャラクター（大）のインスタンス数
  const ENEMY_LARGE_MAX_COUNT = 5;
  // ショットの最大個数
  const SHOT_MAX_COUNT = 10;
  // 敵キャラクターのショットの最大個数
  const ENEMY_SHOT_MAX_COUNT = 50;
  // ボスキャラクターのホーミングショットの最大個数
  const HOMING_MAX_COUNT = 50;
  // 爆発エフェクトの最大個数
  const EXPLOSION_MAX_COUNT = 10;
  // 流れる星の個数
  const BACKGROUND_STAR_MAX_COUNT = 100;
  // 背景を流れる星の最大サイズ
  const BACKGROUND_STAR_MAX_SIZE = 3;
  // 背景を流れる星の最大速度
  const BACKGROUND_STAR_MAX_SPEED = 4;
  // Canvas2D API をラップしたユーティリティクラス
  let util = null;
  // 描画対象となる Canvas Element
  let canvas = null;
  // Canvas2D API のコンテキスト
  let ctx = null;
  // シーンマネージャー
  let scene = null;
  // 実行開始時のタイムスタンプ
  let startTime = null;
  // 自機キャラクターのインスタンス
  let viper = null;
  //　ボスキャラクターのインスタンスを格納する配列
  let boss = null;
  // 敵キャラクターのインスタンスを格納する配列
  let enemyArray = [];
  // ショットのインスタンスを格納する配列
  let shotArray = [];
  // シングルショットのインスタンスを格納する配列
  let singleShotArray = [];
  // 敵キャラクターのショットのインスタンスを格納する配列
  let enemyShotArray = [];
  // ボスキャラクターのホーミングショットのインスタンスを格納する配列
  let homingArray = [];
  // 爆発エフェクトのインスタンスを格納する配列
  let explosionArray = [];
  let enemyExplosionArray = [];
  let viperExplosionArray = [];
  // 流れる星のインスタンスを格納する配列
  let backgroundStarArray = [];
  // 再スタートするためにフラグ
  let restart =false;
  // タイトル呼び出し
  let isTitle = false;
  let isRenderLoop = true;
  let restartTime = null;
  let startEvent = function(e){
    if (e.key == 'Enter' || e.key == ' ') {
      if(Date.now() - restartTime < 1000) return;
      console.log('start')
      this.removeEventListener('keyup',startEvent);
      isRenderLoop = true;
      gameInitialize();
      loadCheck();
    }
  }

  //ページのロードが完了したら発火するLoadイベント
  window.addEventListener('load', ()  => {
    // ユーティリティクラスを初期化
    util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
    // ユーティリティクラスから canvas を取得
    canvas = util.canvas;
    // ユーティリティクラスから 2d コンテキストを取得
    ctx = util.context;

    // キャンバスの初期化処理を行う
    canvasInitialize();
    // インスタンスの状態を確認する
    //loadCheck();
    titleloop(ctx);
    window.addEventListener('keyup',startEvent);
  }, false);

  // キャンバスの初期化処理を行う
  function canvasInitialize() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    //枠線の描画
    let can = document.getElementById("main_canvas");
    //canvasに枠線をつける。
    can.style.border = "4px solid #e3d7a3";
  }

  //ゲームの初期化処理
  function gameInitialize() {
    let i;

    //シーンを初期化する
    scene = new SceneManager();

    //爆発エフェクトを初期化する
    for(i = 0; i < EXPLOSION_MAX_COUNT; ++i){
      explosionArray[i] = new Explosion(ctx, 100.0, 30, 40.0, 50,'#000000');
      viperExplosionArray[i] = new Explosion(ctx, 100.0, 30, 40.0, 2,'#FF0000');
      enemyExplosionArray[i] = new Explosion(ctx, 100.0, 30, 40.0, 10,'#0000FF');
    }
    //console.log(viperExplosionArray)

      //自機のショットを初期化する
      for(i = 0; i < SHOT_MAX_COUNT; ++i){
        shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
        singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
        singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
      }

    //自機キャラクターを初期化する
    viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
    //登場シーンからスタートするための設定を行う
    viper.setComing(
      CANVAS_WIDTH / 2,   // 登場演出時の開始 X 座標
      CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
      CANVAS_WIDTH / 2,   // 登場演出を終了とする X 座標
      CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
    );
    //ショットを自機キャラクターに設定する
    viper.setShotArray(shotArray, singleShotArray);
    //console.log(explosionArray)
    //console.log(enemyExplosionArray)

    // 敵キャラクターのショットを初期化する
    for(i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i){
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
      enemyShotArray[i].setTargets([viper]); // 引数は配列なので注意
      enemyShotArray[i].setExplosions(enemyExplosionArray);
    }

    // ボスキャラクターのホーミングショットを初期化する
    for(i = 0; i < HOMING_MAX_COUNT; ++i){
        homingArray[i] = new Homing(ctx, 0, 0, 32, 32, './image/homing_shot.png')
        homingArray[i].setTargets([viper]);
        homingArray[i].setExplosions(enemyExplosionArray);
    }

    // ボスキャラクターを初期化する
    boss = new Boss(ctx, 0, 0, 128, 128, './image/boss.png');
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    boss.setShotArray(enemyShotArray);
    // ボスキャラクターはホーミングショットを持っているので設定する
    boss.setHomingArray(homingArray);
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    boss.setAttackTarget(viper);

    // 敵キャラクター（小）を初期化する
    for(i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
      // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
      enemyArray[i].setShotArray(enemyShotArray);
      // 敵キャラクターは常に自機キャラクターを攻撃対象とする
      enemyArray[i].setAttackTarget(viper);
    }

    // 敵キャラクター（大）を初期化する
    for(i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i){
      enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_large.png');
      // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
      // 敵キャラクターは常に自機キャラクターを攻撃対象とする
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
    }

  // ボスキャラクターも衝突判定の対象とするために配列に加えておく
  let concatEnemyArray = enemyArray.concat([boss]);

  //衝突判定を行うために対象を設定する
  //爆発エフェクトを行うためにショットに設定する
  for(i = 0; i < SHOT_MAX_COUNT; ++i){
    shotArray[i].setTargets(concatEnemyArray);
    singleShotArray[i * 2].setTargets(concatEnemyArray);
    singleShotArray[i * 2 + 1].setTargets(concatEnemyArray);
    shotArray[i].setExplosions(viperExplosionArray);
    singleShotArray[i * 2].setExplosions(viperExplosionArray);
    singleShotArray[i * 2 + 1].setExplosions(viperExplosionArray);
  }

  // 流れる星を初期化する
  for(i=0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
    // 星の速度と大きさはランダムと最大値によって決まるようにする
    let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
    let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
    // 星のインスタンスを生成する
    backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
    // 星の初期位置もランダムに決まるようにする
    let x = Math.random() * CANVAS_WIDTH;
    let y = Math.random() * CANVAS_HEIGHT;
    backgroundStarArray[i].set(x, y);
  }
}

  //インスタンスの準備が完了しているか確認する
  function loadCheck(){
    // 準備完了を意味する真偽値
    let ready = true;
    //AND演算で準備完了しているかチェックする
    ready = ready && viper.ready;
    // 同様に敵キャラクターの準備状況も確認する
    enemyArray.map((v) => {
      ready = ready && v.ready;
    });
    //同様にショットの準備状況も確認する
    shotArray.map((v) => {
      ready = ready && v.ready;
    });
    homingArray.map((v) => {
      ready = ready && v.ready;
    });
    //同様にシングルショットの準備状況も確認する
    singleShotArray.map((v) => {
      ready = ready && v.ready;
    });
    //同様に敵キャラクターのショットの準備状況も確認する
    enemyShotArray.map((v) => {
      ready = ready && v.ready;
    });

    //全ての準備が完了したら次の処理に進む
    if(ready === true){
      //イベントを設定する
      eventSetting();
      //シーンを定義する
      sceneSetting();
      //実行開始時のタイムスタンプを取得する
      startTime = Date.now();
      // 描画処理を開始する
      render();
    }else{
      //準備が完了していない場合は0.1秒ごとに再帰呼出しする
      setTimeout(loadCheck, 100);
    }
 }
       // タイトル画面
       var titleloop = function(ctx) {
           var startTime = new Date();
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           ctx.save();
           util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
           ctx.strokeStyle = '#fff';
           ctx.moveTo(20, 100);
           ctx.lineTo(canvas.width-20, 100);
           ctx.stroke();
           ctx.moveTo(20, 145);
           ctx.lineTo(canvas.width-20, 145);
           ctx.stroke();
           ctx.strokeStyle = '#fff';
           ctx.moveTo(30, 90);
           ctx.lineTo(canvas.width-30, 90);
           ctx.stroke();
           ctx.moveTo(30, 155);
           ctx.lineTo(canvas.width-30, 155);
           ctx.stroke();
           var text, width;

           // JavaScript Shooting Gameと表示
           ctx.font = '20px serif';
           ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
           ctx.fillStyle = '#fff';
           text = "JavaScript Shooting Game";
           width = ctx.measureText(text).width;
           ctx.fillText(text, (canvas.width - width) / 2, 120);

           // SPACE or ENTER to START と表示
           ctx.font = '12px serif';
           ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
           ctx.fillStyle = '#fff';
           text = "SPACE or ENTER to START";
           width = ctx.measureText(text).width;
           ctx.fillText(text, (canvas.width - width) / 2, 240);
       }

  // イベントを設定する
  function eventSetting(){
    // キーの押下時に呼び出されるイベントリスナーを設定する
    window.addEventListener('keydown', (event) => {
      //キーの押下状態を管理するオブジェクトに押下されたことを設定する
      isKeyDown[`key_${event.key}`] = true;
      // let count = keyDownCounts.get(event.key);
      // if (!count) {
      //   count = 0;
      // }
      // count++;
      // keyDownCounts.set(event.key,count);
      // console.(`key:${event.key},count:${count}`);
      //ゲームオーバーから再スタートするために設定
      if(event.key === 'Enter'){
        //自機キャラクターのライフが0以下の状態
        if(viper.life <= 0){
          //再スタートフラグを立てる
          restart = true;
        }
      }
    },false);
    //キーが離されたときに呼び出されるイベントリスナーを設定する
    window.addEventListener('keyup', (event) => {
      //キーが離れたことを設定する
      isKeyDown[`key_${event.key}`] = false;
    }, false);
  }

  // シーンを設定する
  function sceneSetting(){
    // イントロシーン
    scene.add('intro', (time) => {
      // 3 秒経過したらシーンをivadeに変更する
      if(time > 3.0){
        scene.use('invade_default_type');
      }
    });
    // invadeシーン（default type の敵キャラクターを生成）
    scene.add('invade_default_type', (time) => {
      //シーンのフレーム数が0のとき以外に敵キャラクターを配置する
      if(scene.frame % 30 === 0){
        //ライフが0の状態の敵キャラクター（小）が見つかったら配置する
        for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
          if(enemyArray[i].life <= 0){
            let e = enemyArray[i];
            // ここからさらに２パターンに分ける
            // frame を 60 で割り切れるかどうかで分岐する
            if(scene.frame % 60 === 0){
            // 左側面から出てくる
            e.set(-e.width,30, 2, 'default');
            //　進行方向は 30 度の方向
            e.setVectorFromAngle(degreesToRadians(30));
          }else{
            // 右側面から出てくる
            e.set(CANVAS_WIDTH + e.width,30, 2, 'default');
            //　進行方向は 150 度の方向
            e.setVectorFromAngle(degreesToRadians(150));
          }
          break;
        }
      }
    }
    //シーンのフレーム数が 270 になったときに次のシーンへ
    if(scene.frame === 270){
      scene.use('blank');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // 間隔調整のための空白のシーン
  scene.add('blank', (time) => {
    // シーンのフレーム数が 150 になったとき次のシーンへ
    if(scene.frame === 150){
      scene.use('invade_wave_move_type');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  //invadeシーン（wave move type の敵キャラクターを生成）
  scene.add('invade_wave_move_type', (time) => {
    // シーンのフレーム数 50 で割り切れるときは敵キャラクターを配置する
    if(scene.frame % 50 === 0){
      //ライフが0の状態の敵キャラクター（小）が見つかったら配置する
      for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
        if(enemyArray[i].life <= 0){
          let e = enemyArray[i];
          // ここからさらに２パターンに分ける
          // frame を 200 以下かどうかで分ける
          if(scene.frame <= 200){
          // 左側を進む
          e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave');
        }else{
          // 右側を進む
          e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave');
        }
        break;
      }
    }
  }
  // シーンのフレーム数が 450 になったとき次のシーンへ
  if(scene.frame === 450){
      scene.use('invade_large_type');
    }
  // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // // invadeシーン（large type の敵キャラクターを生成）
  scene.add('invade_large_type', (time) => {
    // シーンのフレーム数 100 になった際に敵キャラクター（大）を配置する
    if(scene.frame  === 100){
      //ライフが0の状態の敵キャラクター（大）が見つかったら配置する
      let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
      for(let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j){
        if(enemyArray[j].life <= 0){
          let e = enemyArray[j];
          e.set(CANVAS_WIDTH * 0.5, -e.height, 20, 'large');
          break;
        }
      }
    }
    // シーンのフレーム数が 500 になったとき次のシーンへ
    if(scene.frame === 500){
        scene.use('inavde_boss');
      }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
      if(viper.life <= 0){
        scene.use('gameover');
      }
});
// invade シーン（ボスキャラクターを生成）
scene.add('inavde_boss', (time) => {
  // シーンのフレーム数が 0 となる最初のフレームでボスを登場させる
  if(scene.frame === 0){
    // 画面中央上から登場するように位置を指定し、ライフは 250 に設定
    boss.set(CANVAS_WIDTH / 2, -boss.height, 250);
    // ボスキャラクター自身のモードは invade から始まるようにする
    boss.setMode('invade');
  }
  if(viper.life <= 0){
    scene.use('gameover');
    boss.setMode('escape');
  }
  // ボスが破壊されたらシーンを intro に設定する
  if(boss.life <= 0){
    scene.use('intro');
  }
});
    //ゲームオーバーシーン
    //ここでは画面にゲームオーバーの文字が流れ続けるようにする
    scene.add('gameover', (time) => {
      //流れる文字の幅は画面の幅の半分を最大の幅とする
      let textWidth = CANVAS_WIDTH / 2;
      // 文字の幅を全体の幅に足し、ループする幅を決める
      let loopWidth = CANVAS_WIDTH + textWidth;
      // フレーム数に対する除算の剰余を計算し、文字列の位置とする
      let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
      // 文字列の描画
      ctx.font = 'bold 72px sans-serif';
      util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
      // 再スタートのための処理
      if(restart === true){
        // 再スタートフラグはここでまず最初に下げておく
        restart = false;
        //スコアをリセットしておく
        gameScore = 0;
        // 再度スタートするための座標等の設定
        viper.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT -100
        );
        // isRenderLoop = false;
        // restartTime = Date.now();
        // titleloop(ctx);
        // window.addEventListener('keyup',startEvent);
    //シーンにはintroを設定
    scene.use('intro');
   }
 });
 //最初のシーンにはintroを設定する
 scene.use('intro');
}



  //描画処理を行う
  function render(){
    //透明度を必ず1.0で描画処理を開始する
    ctx.globalAlpha = 1.0;
    //描画前に画面全体を暗いネイビーで塗りつぶす
    util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
    //現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
    let nowTime = (Date.now() - startTime) / 1000;

    //スコアの表示
    ctx.font = 'bold 24px serif';
    util. drawText(zeroPadding(gameScore, 6), 30, 50, '#ffffff')

    //シーンを更新する
    scene.update();

    // 流れる星の状態を更新する
    backgroundStarArray.map((v) => {
        v.update();
    });

    // 自機キャラクターの状態を更新する
    viper.update();

    // ボスキャラクターの状態を更新する
    boss.update();

    // 敵キャラクターの状態を更新する
    enemyArray.map((v) => {
      v.update();
    });

    //ショットの状態を更新する
    shotArray.map((v) => {
      v.update();
    });

    //シングルショットの状態を更新する
    singleShotArray.map((v) => {
      v.update();
    });

    //敵キャラクターのショットの状態を更新する
    enemyShotArray.map((v) => {
      v.update();
    });

    //　ボスキャラクターのホーミングショットの状態を更新する
    homingArray.map((v) => {
      v.update();
    });

    //爆発エフェクトの状態を更新する
    explosionArray.map((v) => {
      v.update();
    });
    enemyExplosionArray.map((v) => {
      v.update();
    });
    viperExplosionArray.map((v) => {
      v.update();
    });

    //恒常ループのために描画処理を再帰呼出しする
    if (isRenderLoop) {
      requestAnimationFrame(render);
    }
  }

  //特定の範囲におけるランダムな整数の値を生成する
  function generateRandomInt(range){
    let random = Math.random();
    return Math.floor(random * range);
  }

  //度数法の角度からラジアンを生成する
  function degreesToRadians(degrees){
    return degrees * Math.PI / 180;
  }

  //数値の不足した桁数をゼロで埋めた文字列を返す
  function zeroPadding(number, count){
    //配列を指定の桁数分の長さで初期化する
    let zeroArray = new Array(count);
    //配列の要素を'0'を挟んで連結する
    let zeroString = zeroArray.join('0') + number;
    //文字列の後ろから桁数分だけ文字を抜き取る
    return zeroString.slice(-count);
  }
})();
