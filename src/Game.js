/* jshint browser:true */
// create BasicGame Class
BasicGame = {

};

// create Game function in BasicGame
BasicGame.Game = function (game) {
};

// set Game function prototype
BasicGame.Game.prototype = {

    init: function () {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
        this.stage.backgroundColor = '#fff';
        
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        // Force the orientation in landscape or portrait.
        // * Set first to true to force landscape. 
        // * Set second to true to force portrait.
        this.scale.forceOrientation(false, true);
        
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.restitution = 0.2; //this gives bounce
        this.physics.p2.gravity.y = 500;
        
        //draw the board
		var graphics = this.add.graphics(0, 0);
		graphics.beginFill(0xc0c0c0,0);
		graphics.lineStyle(2, 0xc0c0c0, 0.5);
		this.boundaryLine = this.world.height/2;
		graphics.moveTo(0, this.boundaryLine);
		graphics.lineTo(this.world.width, this.boundaryLine); 
        
        //new
        // collision groups http://phaser.io/examples/v2/p2-physics/collision-groups
        this.physics.p2.setImpactEvents(true);
        //  Create our collision groups. One for the rocks, one for the bottles
        this.rockCollisionGroup = this.physics.p2.createCollisionGroup();
        //this.bottleCollisionGroup = this.physics.p2.createCollisionGroup();
        this.physics.p2.updateBoundsCollisionGroup();
        
    },

    preload: function () {

        this.load.image('rock', 'asset/a_0.png');
        //rock2 code
        this.load.image('bottle', 'asset/bottle1.png');
        this.load.spritesheet('bottleSht', 'asset/bottleSheet.png', 20, 55, 6);
        this.load.audio('breakBottle', ['asset/bottleBreak2.wav']);
        this.load.audio('rockHit', ['asset/rockHit.wav']);
    },

    create: function () {
        // Add logo to the center of the stage
        this.rock = this.add.sprite(this.world.centerX, this.world.centerY, 'rock');
        this.rock.anchor.setTo(0.5, 0.5);
        this.rock.scale.setTo(0.06,0.06);
        
        // turn false the collision circle in production
        this.physics.p2.enable(this.rock, false); //change to true to see hitcircle
        this.rock.body.setRectangle(25,20);
        this.rock.body.collideWorldBounds = true;
        this.rock.body.velocity.x = 20;
        this.rock.body.velocity.y = 150;
        this.rock.body.angularDamping = 0.5;
        
        
        //new set collision group and tell what to collide with
        this.rock.body.setCollisionGroup(this.rockCollisionGroup);
        //this.rock.body.collides(this.bottleCollisionGroup,this.bottleHit2,this);
       
        
        this.bottleBreak =  this.add.audio('breakBottle');
        this.rockHitSnd =  this.add.audio('rockHit');
        //add start marker to rock hit sound
        this.rockHitSnd.addMarker('rockSrt',0.15,0.5);
        this.rock.grabbed = false;
        this.rock.body.onBeginContact.add(this.rockHit, this);
        //***rock2 code *************
                    
        
        //input event liseteners
        this.input.onDown.add(this.rockGrab, this);
        this.input.onUp.add(this.rockDrop, this);
        this.input.addMoveCallback(this.rockMove, this);
        

    },
    
    update: function(){
        
   
        
    },
    
    
    
    // utility functions for the rock grab *****************
    rockGrab: function (pointer) {
        console.log(pointer.x);
        if(pointer.y > this.boundaryLine && this.rock.y > this.boundaryLine){
            this.rock.body.angularVelocity = 0;
            this.rock.grabbed = true;
            //create a sprite at the pointer
            pointer.handle = this.add.sprite(pointer.x, pointer.y);
            this.physics.p2.enable(pointer.handle, false);

            pointer.handle.body.setRectangle(5);
            pointer.handle.anchor.setTo(0.5, 0.5);
            pointer.handle.body.static = true;
            pointer.handle.body.collideWorldBounds = true;

            //create a constraint with the rock and the pointer
            pointer.rockConstraint = this.physics.p2.createLockConstraint(this.rock, pointer.handle );
        }
        
    },
    rockMove: function(pointer, x, y, isDown) {
        //at this point the constraint may is attached
        if(pointer.rockConstraint){
            pointer.handle.body.x = x;
            pointer.handle.body.y = y;
        }
    }, 
    rockDrop: function(pointer){
        if(pointer.rockConstraint){
            this.physics.p2.removeConstraint(pointer.rockConstraint);
            pointer.handle.destroy();
            
            pointer.rockConstraint = null;
            this.rock.grabbed = false;
        }
    },
    rockHit: function(){
        if(!this.rock.grabbed){
            this.rockHitSnd.play('rockSrt');
        }
    },
    //*************************************


    // Rock2 Bottle utility methods
    bottleHit2: function(rock, bottle){
        //console.log(rock.velocity.y);
                
        if(rock.velocity.y < -800){
            this.bottleBreak.play();
            //last true kills the sprite
            bottle.sprite.animations.play('splode',30,false,true); 
            //bottle.sprite.kill();
            this.time.events.add(Phaser.Timer.SECOND * 2, this.spawnBottle, this);
        }
        
    },
    spawnBottle: function(){
        // grab a dead bottle from the group
        var bottle = this.bottles.getFirstDead();
        
        if(bottle != null){
            bottle.animations.stop('splode',true);
            bottle.body.x = -10;
            bottle.body.velocity.x = this.rnd.integerInRange(50,150);
            bottle.body.angularVelocity = this.rnd.integerInRange(-5,5);
            
            var scaleFactor = this.rnd.realInRange(.6,1);
            bottle.scale.setTo(scaleFactor,scaleFactor);
            bottle.body.setRectangle(scaleFactor*15,scaleFactor*40);
                        bottle.body.setCollisionGroup(this.bottleCollisionGroup);
            bottle.body.collides(this.rockCollisionGroup);
            bottle.body.static = true;
            
            bottle.revive();
        }
    },

    //*****************************************

};