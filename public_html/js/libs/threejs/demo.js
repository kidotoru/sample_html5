var threeDModel;
var isLoaded = false;
var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,
	ms_FilesDND: null,
	ms_Projector: null,
	ms_Clickable: [],
	enable: (function enable() {
		try {
			var aCanvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
		}
		catch (e) {
			return false;
		}
	})(),
	initialize: function initialize(inIdCanvas, inParameters) {
		this.ms_Canvas = $('#' + inIdCanvas);

		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();


		//this.ms_Scene.fog = new THREE.FogExp2(0x000050, 0.00003);


		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));



		this.ms_Projector = new THREE.Projector();


		// Initialize Orbit control	
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		this.ms_Controls.userPan = false;
		this.ms_Controls.userPanSpeed = 0.0;
		this.ms_Controls.maxDistance = 5000.0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.495;



		// Add light
		/*
		 var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		 directionalLight.position.set(-600, 300, 600);
		 
		 this.ms_Scene.add(directionalLight);
		 */


		this.light = new THREE.DirectionalLight(0xffff55, 1);
		//light.position.set(20, 40, -15);
		//light.position.set(-600, 300 * 3 , 600);
		this.light.position.set(1, 2, 1);

		this.light.target.position.copy(this.ms_Scene.position);
		this.light.castShadow = true;
		this.light.shadowCameraLeft = -60;
		this.light.shadowCameraTop = -60;
		this.light.shadowCameraRight = 60;
		this.light.shadowCameraBottom = 60;
		this.light.shadowCameraNear = 20;
		this.light.shadowCameraFar = 200;
		this.light.shadowBias = -.0001;
		this.light.shadowMapWidth = this.light.shadowMapHeight = 2048;
		this.light.shadowDarkness = .7;
		this.ms_Scene.add(this.light);
		var directionalLight = this.light;


		var light2 = new THREE.AmbientLight(0xffffff);  // 真っ白を1として
		light2.color.multiplyScalar(0.2);                 // 0.5に弱めた色
		this.ms_Scene.add(light2);


		// Create terrain
		this.loadTerrain(inParameters);


		var geometry = new THREE.SphereGeometry(100, 32, 16);  // ①形状 (Geometry) 
		var texture = THREE.ImageUtils.loadTexture('./img/earth.jpg');
		var material = new THREE.MeshPhongMaterial({
			color: 0xffffff, specular: 0xcccccc, shininess: 50, ambient: 0xffffff,
			map: texture, bumpMap: texture, bumpScale: 1.5});

		//var material = new THREE.MeshPhongMaterial({color: 0xffffff});//②質感 (Material) 

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		this.sphere = new THREE.Mesh(geometry, material);//③実際に表示する物体 (Object3D) 

		this.ms_Scene.add(this.sphere);

		// 芯円半径50、断面円半径10、断面円分割3、芯円分割16

		geometry = new THREE.TorusGeometry(250, 10, 8, 16);
		material = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0xcccccc, shininess: 50, ambient: 0xffffff, metal: true});


		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		this.torus = new THREE.Mesh(geometry, material);
		/*
		 this.torus = new THREE.Mesh(
		 new THREE.TorusGeometry(250, 5, 8, 16),
		 new THREE.MeshLambertMaterial({color: 0x00ff00})
		 );
		 */


		this.ms_Scene.add(this.torus);

// (4) Model
		/*
		 var loader = new THREE.OBJMTLLoader();
		 loader.addEventListener( 'load', function ( event ) {
		 
		 var object = event.content;
		 
		 // Blender の距離 1 と three.js の距離 1 の換算。実際に動かしてみて THREE.GridHelper と比較して、object.scale で調整する
		 //
		 object.scale.x = 100;
		 object.scale.y = 100;
		 object.scale.z = 100;
		 object.position.y = 500;
		 this.ms_Scene.add( object );
		 
		 });
		 loader.load( './obj/su/Su-27_Flanker.obj', './obj/su/Su-27_Flanker.mtl' );
		 */

		// model
		// 3Dモデル用テクスチャ画像の読込
		/*
		 var imageLoader = new THREE.ImageLoader( manager );
		 //imageLoader.load( 'http://jsrun.it/assets/m/9/b/H/m9bHl.png', function ( image ) {
		 imageLoader.load( '/assets/m/9/b/H/m9bHl.png', function ( image ) {
		 
		 texture.image = image;
		 texture.needsUpdate = true;
		 
		 } );
		 */
		// 3Dモデル読込

		// http://jsdo.it/siouxcitizen/15OP
		var texture = new THREE.Texture();
		var manager = new THREE.LoadingManager();
		manager.onProgress = function (item, loaded, total) {
		};
		var onProgress = function (xhr) {
		};
		var onError = function (xhr) {
		};
		var scene = this.ms_Scene;
		var objLoader = new THREE.OBJMTLLoader(manager);
// 
//    http://tf3dm.com/
//    
//		objLoader.load('./obj/CFA-44/CFA44.obj', './obj/CFA-44/CFA44.mtl', function (object) {
		objLoader.load('./obj/su/Su-27_Flanker.obj', './obj/su/Su-27_Flanker.mtl', function (object) {
 //   objLoader.load( './obj/A-10_Thunderbolt_II/A-10_Thunderbolt_II.obj','./obj/A-10_Thunderbolt_II/A-10_Thunderbolt_II.mtl', function ( object ) {
//			   objLoader.load( './obj/CoffeeShop/CoffeeShop.obj','./obj/CoffeeShop/CoffeeShop.mtl', function ( object ) {

			object.traverse(function (child) {

				if (child instanceof THREE.Mesh) {

					//child.material.map = texture;
					child.material.wireframe = false;
				}

			});

			object.scale.set(40, 40, 40);
			object.rotation.x = Math.PI / -2;
			object.position.y = 2500;
			threeDModel = object;
			scene.add(threeDModel);
			isLoaded = true;
		}, onProgress, onError);


		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('./img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;


		// Load filesdnd texture
		/*
		 new Konami(function() {
		 if(DEMO.ms_FilesDND == null)
		 {
		 var aTextureFDND = THREE.ImageUtils.loadTexture("assets/img/filesdnd_ad.png");
		 DEMO.ms_FilesDND = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ map : aTextureFDND, transparent: true, side : THREE.DoubleSide }));
		 
		 // Mesh callback
		 DEMO.ms_FilesDND.callback = function() { window.open("http://www.filesdnd.com"); }
		 DEMO.ms_Clickable.push(DEMO.ms_FilesDND);
		 
		 DEMO.ms_FilesDND.position.y = 1200;
		 DEMO.ms_Scene.add(DEMO.ms_FilesDND);
		 }
		 });
		 */
		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 0.8,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			//waterColor: 0x001e0f,
			waterColor: 0x00008B,
			distortionScale: 50.0,
			fog: true
		});
		var aMeshMirror = new THREE.Mesh(
				new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
				this.ms_Water.material
				);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = -Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);

		this.loadSkyBox();
	},
	loadSkyBox: function loadSkyBox() {
		/*		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		 'assets/img/px.jpg',
		 'assets/img/nx.jpg',
		 'assets/img/py.jpg',
		 'assets/img/ny.jpg',
		 'assets/img/pz.jpg',
		 'assets/img/nz.jpg'
		 ]);
		 */

// bluecloud_bk.jpg,
// bluecloud_dn.jpg,
// bluecloud_ft.jpg,
// bluecloud_lf.jpg,
// bluecloud_rt.jpg
// bluecloud_up.jpg

		var aCubeMap = THREE.ImageUtils.loadTextureCube([
			'./img/cloudy_0/bluecloud_ft.jpg',
			'./img/cloudy_0/bluecloud_bk.jpg',
			'./img/cloudy_0/bluecloud_dn.jpg',
			'./img/cloudy_0/bluecloud_up.jpg',
			'./img/cloudy_0/bluecloud_rt.jpg',
			'./img/cloudy_0/bluecloud_lf.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
			fragmentShader: aShader.fragmentShader,
			vertexShader: aShader.vertexShader,
			uniforms: aShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
				new THREE.BoxGeometry(1000000, 1000000, 1000000),
				aSkyBoxMaterial
				);

		this.ms_Scene.add(aSkybox);
	},
	loadTerrain: function loadTerrain(inParameters) {
		/*
		 var terrainGeo = TERRAINGEN.Get(inParameters);
		 var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide });
		 
		 var terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
		 terrain.position.y = - inParameters.depth * 0.4;
		 this.ms_Scene.add(terrain);
		 */

		var world = new Terrein(128 * 2, 128);
		Math.seed = +new Date();

		// tl = 左上の値, tr = 右上の値, bl = 左下の値, br = 右下の値 , x ,y , size
		world.init(0, 0, 0, 0, 0, 0, 128);

		world.init(0, 0, 0, 0, 128, 0, 128);


		var geometry = new THREE.PlaneGeometry(1024 * 2 * 16, 1024 * 16, 128 * 2, 128);

		for (var i = 0; i < geometry.vertices.length; i++) {
			var vertex = geometry.vertices[i];


			vertex.z = -20 * 16;



		}

		for (var x = 0; x < 128 * 2; x++) {
			for (var y = 0; y < 128; y++) {

				var index = y * (128 * 2 + 1) + x % (128 * 2 + 1);
				var vertex = geometry.vertices[index];
				vertex.z = (world.array[x][y] - 20) * 16;
			}
		}
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		var map1 = THREE.ImageUtils.loadTexture('./img/grass512.jpg');
		map1.wrapS = map1.wrapT = THREE.RepeatWrapping;
		map1.repeat.set(8 * 8, 4 * 8);

		var ground = new THREE.Mesh(
				geometry,
				new THREE.MeshLambertMaterial({map: map1})
				//new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true})
				);

		ground.rotation.x = Math.PI / -2;
		ground.castShadow = true;
		ground.receiveShadow = true;
		this.ms_Scene.add(ground);

		//// umi
		var geometry2 = new THREE.PlaneGeometry(20480 * 16, 20480 * 16, 1, 1);
		for (var i = 0; i < geometry2.vertices.length; i++) {
			var vertex = geometry2.vertices[i];


			vertex.z = -20 * 16;



		}

		geometry2.computeFaceNormals();
		geometry2.computeVertexNormals();

		var map2 = THREE.ImageUtils.loadTexture('./img/grass512.jpg');
		map2.wrapS = map2.wrapT = THREE.RepeatWrapping;
		map2.repeat.set(32 * 10, 32 * 10);

		var ground2 = new THREE.Mesh(
				geometry2,
				new THREE.MeshLambertMaterial({map: map2})
				//new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: true } )
				);

		ground2.rotation.x = Math.PI / -2;
		ground2.castShadow = true;
		ground2.receiveShadow = true;
		this.ms_Scene.add(ground2);




	},
	display: function display() {

		var timer = Date.now();

		this.light.position.set(
				Math.sin(timer / 155 * Math.PI / 360),
				Math.sin(timer / 155 * Math.PI / 360) + 1,
				Math.cos(timer / 155 * Math.PI / 360));
		//requestAnimationFrame(animate);
		var x = 20000 * Math.sin(timer / 2000 / 1 * Math.PI / 360);
		var z = 10000 * Math.cos(timer / 2000 / 1 * Math.PI / 360);

		var y = 1700 + Math.sin(timer / 500 / 1 * Math.PI / 360) * 1500;

		this.ms_Camera.position.set(x, 20, z);


		this.ms_Camera.lookAt(this.ms_Scene.position);


		if (isLoaded) {

			var pos_x = 18000 * Math.sin((timer - 500) / 100 / 2 * Math.PI / 360);
			var pos_z = 9000 * Math.cos((timer - 500) / 100 / 2 * Math.PI / 360);

			var f_x = 18000 * Math.sin((timer + 1000) / 100 / 2 * Math.PI / 360);
			var f_z = 9000 * Math.cos((timer + 1000) / 100 / 2 * Math.PI / 360);

			threeDModel.position.set(pos_x, 1700 + Math.sin(timer / 500 * Math.PI / 360) * 1000, pos_z);
			var s = Math.atan2(f_x - pos_x, f_z - pos_z) + Math.PI;
			threeDModel.rotation.z = s;
			//threeDModel.rotation.x = Math.PI / 2;

		}

		this.sphere.position.set(f_x, 2000, f_z);
		//this.sphere.position.set(Math.floor(x * 0.85), y, Math.floor(z * 0.85));
		this.sphere.rotation.y = Math.PI * (+new Date) / 10000;//Math.PI / Math.cos(timer / 100 / 2 );//Math.PI / -2;


		this.torus.position.set(f_x, 2000, f_z);

		//this.torus.position.set(Math.floor(x * 0.85), y, Math.floor(z * 0.85));

		this.torus.rotation.x = Math.PI / Math.sin(timer / 100 / 2 * Math.PI / 360);//Math.PI / -2;

		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},
	update: function update() {
		if (this.ms_FilesDND != null) {
			this.ms_FilesDND.rotation.y += 0.01;
		}
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Controls.update();
		this.display();
	},
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect = inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}

};