
//シーンを管理するためのクラス
class SceneManager {

  constructor(){
    //シーンを格納するためのオブジェクト
    this.scene = {};
    //現在アクティブなシーン
    this.activeScene = null;
    //現在のシーンがアクティブになった時刻のタイムスタンプ
    this.startTime = null;
    //現在のシーンがアクティブになってからのシーンの実行回数（カウンター）
    this.frame = null;
    }

//シーンを追加する
add(name, updateFunction){
  this.scene[name] = updateFunction;
  }


//アクティブなシーンを設定する
use(name){
  if(this.scene.hasOwnProperty(name) !== true){
    //存在しなかった場合何もせずに終了する
    return;
  }
  //名前をもとにアクティブなシーンを設定する
  this.activeScene = this.scene[name];
  //シーンをアクティブにした瞬間のタイムスタンプを設定する
  this.startTime = Date.now();
  //シーンをアクティブにしたのでカウンターをリセットする
  this.frame = -1;
}

//シーンを更新する
update(){
  //シーンがアクティブになってからの経過時間
  let activeTime = (Date.now() - this.startTime) / 1000;
  //経過時間を引数に与えてupdateFunctionを呼び出す
  this.activeScene(activeTime);
  //シーンを更新したのでカウンターをインクリメントする
  ++this.frame;
  }
}
