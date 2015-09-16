function Terrein(width, height) {
	
	this.width = width;
	this.height = height;
	this.array = new Array();
	for (var i = 0; i < width; i++) {
		// １次元配列の各番地に、配列を作成して格納する
		this.array[i] = new Array();
		for (var j = 0; j < height; j++) {
			// 0 で埋める
			this.array[i][j] = 0;
		}
	}
}
;
Terrein.prototype =
		{
			init: function (iv1, iv2, iv3, iv4, x, y, size) {
				x = x || 0;
				y = y || 0;
				size = size || this.array.length;
				//this.generateHeightmap(x, y, size, iv1, iv2, iv3, iv4);
				this.generateHeightmap(x, y, size, iv1, iv2, iv3, iv4);
			},
			// x, y = 左上座標
			// size = 現在のサイズ(幅, 高さ)
			// tl = 左上の値, tr = 右上の値, bl = 左下の値, br = 右下の値
			generateHeightmap: function (x, y, size, tl, tr, bl, br) {
				// minSize未満のサイズになったら分割を終了させる
				if (size < 2) {
					// 平均値を出す
					this.array[x][y] = (tl + tr + bl + br) / 4;
				} else {
					var midPoint = (tl + tr + bl + br) / 4 + (Math.seededRandom(256 * 2) - 256) * (size / this.height);


					if (midPoint < 0){
						midPoint = 0;
					}
					if (midPoint > 256) {
						midPoint = 256;						
					}


					// 中央から見て上下左右にあるピクセルにも平均値を入れる
					var top = (tl + tr) / 2; // 上 = 左上と右上の平均値
					var bottom = (bl + br) / 2; // 下 = 左下と右下の平均値
					var left = (tl + bl) / 2; // 左 = 左上と左下の平均値
					var right = (tr + br) / 2; // 右 = 右上と右下の平均値
					// 2*2に分割するのでサイズ(幅, 高さ)を半分にする
					size /= 2;
					// 左上
					this.generateHeightmap(x, y, size, tl, top, left, midPoint);
					// 右上
					this.generateHeightmap(x + size, y, size, top, tr, midPoint, right);
					// 左下
					this.generateHeightmap(x, y + size, size, left, midPoint, bl, bottom);
					// 右下
					this.generateHeightmap(x + size, y + size, size, midPoint, right, bottom, br);
				}
			}
		};
		
					Math.seededRandom = function (max, min) {
				max = max || 1;
				min = min || 0;

				Math.seed = (Math.seed * 9301 + 49297) % 233280;
				var rnd = Math.seed / 233280;

				return min + rnd * (max - min);
			}
