/**************************************

TV:
Is a prop you can add a photo to.

**************************************/

Game.addToManifest({
	tv: "sprites/tv.png",
	chyron: "sprites/chyron.png",
	chyron2: "sprites/chyron2.png",
	chyron3: "sprites/chyron3.png"
});

function TV(scene){

	var self = this;
	self._CLASS_ = "TV";

	// Properties
	self.scene = scene;
	self.x = Game.width/2;
	self.y = Game.height/2 + 80;
	self.width = 150;
	self.height = 180;

	// Graphics
	var resources = PIXI.loader.resources;
    var g = new PIXI.Container();
    var bg = new PIXI.Sprite(resources.tv.texture);
    bg.anchor.x = 0.5;
    bg.anchor.y = 1.0;
    bg.scale.x = bg.scale.y = 0.5;
    g.addChild(bg);
    self.graphics = g;

    // Offset
    self.offset = {
    	x: 0,
    	y: -113.5,
    	scale: 8
    };

    // Photo container
    var photoContainer = new PIXI.Container();
    var conversion = 0.5; // from 1/4 to 1/8
    photoContainer.x = self.offset.x - Camera.WIDTH*0.5*conversion;
    photoContainer.y = self.offset.y - Camera.HEIGHT*0.5*conversion;
    photoContainer.scale.x = photoContainer.scale.y = conversion;
    g.addChild(photoContainer);

    // Update
	self.update = function(){
		self.updateGraphics();
	};
	self.updateGraphics = function(){
		g.x = self.x;
    	g.y = self.y;
	};

	// PHOTO
	var photo;
	self.placePhoto = function(options){

		// OPTIONS
		var photoTexture = options.photo;
		var text = options.text || "";

		// Clear screen
		photoContainer.removeChildren();

		// Add photo now
		photo = new PIXI.Sprite(photoTexture);
	    photoContainer.addChild(photo);

	    if(options.glitch){
	    	var blackout = new PIXI.Graphics();
	    	blackout.beginFill(0x000000, 1);
	    	blackout.drawRect(0, 0, Camera.WIDTH, Camera.HEIGHT);
	    	blackout.endFill();
	    	photoContainer.addChild(blackout);

	    	var ghost = new PIXI.Sprite(photoTexture);
	    	ghost.alpha = 0.18;
	    	ghost.tint = 0x44aaff;
	    	ghost.x = -5 + Math.random()*10;
	    	ghost.y = -3 + Math.random()*6;
	    	photoContainer.addChild(ghost);

	    	var body = MakeMovieClip("body");
	    	body.gotoAndStop((options.glitchType=="square") ? 1 : 0);
	    	body.scale.x = body.scale.y = 0.58;
	    	body.x = Camera.WIDTH*0.5;
	    	body.y = Camera.HEIGHT*0.82;
	    	body.tint = 0xf5f5f5;
	    	photoContainer.addChild(body);

	    	for(var i=0; i<7; i++){
	    		var glitchLine = new PIXI.Graphics();
	    		var y = 10 + i*18 + Math.random()*6;
	    		var alpha = 0.08 + Math.random()*0.15;
	    		glitchLine.beginFill((i%2===0) ? 0xffffff : 0xff3355, alpha);
	    		glitchLine.drawRect(-6 + Math.random()*12, y, Camera.WIDTH+12, 2 + Math.random()*3);
	    		glitchLine.endFill();
	    		photoContainer.addChild(glitchLine);
	    	}
	    }

		// Chryon container
		var chyron = new PIXI.Container();
		chyron.alpha = 0;
		chyron.x = -15;
		Tween_get(chyron).to({alpha:1}, _s(0.5), Ease.quadInOut);
		Tween_get(chyron).to({x:0}, _s(0.8), Ease.quadInOut);
		photoContainer.addChild(chyron);

		// Chyron BG
		var resourceName;
		if(options.nothing) resourceName="chyron3";
		else if(options.fail) resourceName="chyron2";
		else resourceName="chyron";
		var bg = new MakeSprite(resourceName);
		bg.scale.x = bg.scale.y = 1/8;
		chyron.addChild(bg);

		// Chyron Text
		if(!options.nothing){
			var fontsize=100, max=14;
			if(text.length>max){ // more than [max] chars...
				fontsize = Math.floor(max*fontsize/text.length);
			}
		    fontsize = Math.max(fontsize, options.glitch ? 38 : 24);
		    var text = new PIXI.Text(text, {
		    	font:"bold "+fontsize+"px Poppins",
		    	fill:"#FFF",
		    	wordWrap: true,
		    	wordWrapWidth: options.glitch ? 1500 : 1800,
		    	lineHeight: fontsize
		    });
		    text.scale.x = text.scale.y = 0.2;
		    text.anchor.x = 0;
		    text.anchor.y = 0.5;
		    text.x = 45;
		    text.y = 115;
		    chyron.addChild(text);
		}

	}

	// Update!
	self.update();

}
