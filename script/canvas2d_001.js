
 //Canvas2D API をラップしたユーティリティクラス
 class Canvas2DUtility {
    constructor(canvas){
        this.canvasElement = canvas;
        this.context2d = canvas.getContext('2d');
    }

    get canvas(){return this.canvasElement;}
    get context(){return this.context2d;}

    //矩形を描画する
    drawRect(x, y, width, height, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillRect(x, y, width, height);
    }

    //線分を描画する
    drawLine(x1, y1, x2, y2, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 直線のパスを終点座標に向けて設定する
        this.context2d.lineTo(x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    //多角形を描画する
    drawPolygon(points, color){
        // points が配列であるかどうか確認し、多角形を描くために
        // 十分な個数のデータが存在するか調べる
        if(Array.isArray(points) !== true || points.length < 6){
            return;
        }
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(points[0], points[1]);
        // 各頂点を結ぶパスを設定する
        for(let i = 2; i < points.length; i += 2){
            this.context2d.lineTo(points[i], points[i + 1]);
        }
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで多角形の描画を行う
        this.context2d.fill();
    }

    //円を描画する
    drawCircle(x, y, radius, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // 円のパスを設定する
        this.context2d.arc(x, y, radius, 0.0, Math.PI * 2.0);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで円の描画を行う
        this.context2d.fill();
    }

    //扇形を描画する
    drawFan(x, y, radius, startRadian, endRadian, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスを扇形を形成する円の中心に移動する
        this.context2d.moveTo(x, y);
        // 円のパスを設定する
        this.context2d.arc(x, y, radius, startRadian, endRadian);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで扇形の描画を行う
        this.context2d.fill();
    }

    //線分を二次ベジェ曲線で描画する
    drawQuadraticBezier(x1, y1, x2, y2, cx, cy, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 二次ベジェ曲線の制御点と終点を設定する
        this.context2d.quadraticCurveTo(cx, cy, x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    //線分を三次ベジェ曲線で描画する
    drawCubicBezier(x1, y1, x2, y2, cx1, cy1, cx2, cy2, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 三次ベジェ曲線の制御点と終点を設定する
        this.context2d.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    //テキストを描画する
    drawText(text, x, y, color, width){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillText(text, x, y, width);
    }

    //画像をロードしてコールバック関数にロードした画像を与え呼び出す
    imageLoader(path, callback){
        // 画像のインスタンスを生成する
        let target = new Image();
        // 画像がロード完了したときの処理を先に記述する
        target.addEventListener('load', () => {
            // もしコールバックがあれば呼び出す
            if(callback != null){
                // コールバック関数の引数に画像を渡す
                callback(target);
            }
        }, false);
        // 画像のロードを開始するためにパスを指定する
        target.src = path;
    }
}
