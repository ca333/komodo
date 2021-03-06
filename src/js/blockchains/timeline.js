import {extend, proxy} from '../utils';
import createjs from 'createjs';

export class Timeline extends createjs.Container {

	constructor(params) {

		super();
		var defaults = {
			width: 1000,
			height: 1000,
			minuteWidth: 120,
			minuteSeconds: 2,
			minutePause: 500,
			paddingTop: 0,
			paddingBottom: 0,
			defaultTime: 5,
		};

		this.params = extend(defaults,params);
		this.currentBar = null;
		this.time = this.params.defaultTime;
		this.lines = [];
		this.totalTime = 0;
		this.timeInterval = null;
		this.runing = false;

		this.cont_background = new createjs.Container();
		this.cont_lines = new createjs.Container();
		this.cont_blockchains = new createjs.Container();
		this.cont_sliding = new createjs.Container();
		this.cont_foreground = new createjs.Container();

		this.cont_sliding.addChild(this.cont_lines, this.cont_blockchains);
		this.addChild(this.cont_background, this.cont_sliding, this.cont_foreground);

		this.init(params);
	}

	init(params) {

		this.drawLines();
		this.initTimeline();
		this.initCurrentTime();

		this.newMinuteListener = window.Stage.on('newminute', function(event) {
			if(event.time >=5) {
				this.addLine(this.totalTime+1);
				this.removeLines();
			}
		}, this);
	}

	reset() {
		this.stop();
		this.clear();
		window.Stage.off('newminute', this.newMinuteListener);
		this.cont_sliding.x = 0;
		this.cont_blockchains.y = 0;
		this.removeCurrentBar();
		this.cont_lines.removeAllChildren();
		this.lines = [];
		this.time = this.params.defaultTime;
		window.Blockchains = [];
	  window.Platforms = [];
	  window.Emitters = [];
	  window.Particles = [];
	  window.Mempools = [];
		this.init();
	}

	initTimeline() {

		let nb_columns = this.params.width / this.params.minuteWidth + 1;
		for(let i=1,ln=nb_columns; i<ln; i++) {
			this.addLine(i);
		}
	}

	drawLines() {

		let line = new createjs.Shape();
		line.graphics.setStrokeStyle(1).beginStroke('#DDD')
				.moveTo(0, this.params.height - this.params.paddingBottom)
				.lineTo(0, this.params.paddingTop)
				.closePath();
		line.cache(-1, -1, 2, this.params.height);
		this.lineImage = new createjs.Bitmap(line.cacheCanvas);

		let lineBold = new createjs.Shape();
		lineBold.graphics.setStrokeStyle(1).beginStroke('#AAA')
				.moveTo(0, this.params.height - this.params.paddingBottom)
				.lineTo(0, this.params.paddingTop)
				.closePath();
		lineBold.cache(-1, -1, 2, this.params.height);
		this.lineBoldImage = new createjs.Bitmap(lineBold.cacheCanvas);


	}

	addLine(i) {

		let line = this.lineImage.clone();
		if(i%10 == 0) line = this.lineBoldImage.clone();
		line.x = i*this.params.minuteWidth;
		this.cont_lines.addChild(line);
		this.lines.push(line);

		let color = (i%10 == 0)? '#AAA' : '#DDD';
		let minute = new createjs.Text(i+' min','13px Arial', color);
			minute.x = i*this.params.minuteWidth - minute.getMeasuredWidth() - 2;
			minute.y = this.params.paddingTop + 5;
		minute.cache(0, 0, minute.getMeasuredWidth(), minute.getMeasuredHeight());
		this.cont_lines.addChild(minute);
		this.lines.push(minute);

		this.totalTime = i;
	}

	removeLines() {

		for(let i=0,ln=this.lines.length-3; i<=ln; i++) {
			let line = this.lines[i];
			let pos = line.localToGlobal(0,0);
			if(pos.x < 100) {
				this.removeChild(line);
				this.lines.splice(i, 1);
			}
		}
	}

	initCurrentTime() {

		this.currentBar = new createjs.Shape();
		this.currentBar.graphics.setStrokeStyle(1).beginStroke('#ff6c6c')
			.moveTo(0, this.params.height - this.params.paddingBottom)
			.lineTo(0, 0 + this.params.paddingTop)
			.closePath();
		this.currentBar.cache(-1, -1, 2, this.params.height);

		this.currentBar.x = this.params.defaultTime * this.params.minuteWidth;
		window.Cont_currenttime.addChild(this.currentBar);
	}

	removeCurrentBar() {
		window.Cont_currenttime.removeAllChildren();
		this.currentBar = null;
	}

	start() {

		let tw = createjs.Tween.get(this.cont_sliding, { timeScale: window.TimeScale }).to({x: this.cont_sliding.x - this.params.minuteWidth}, 1000 * this.params.minuteSeconds)
							.call(proxy(this.incrementTime, this));
		window.Tweens.add(tw);
		this.slideTween = tw;
		window.Emitters.map(e => e.start());
		window.Platforms.map(p => p.start());

		return this;
	}

	stop() {
		createjs.Tween.removeTweens(this.cont_sliding);
		createjs.Tween.removeTweens(this.cont_background);
		createjs.Tween.removeTweens(this.cont_foreground);
		createjs.Tween.removeTweens(this.currentBar);
		window.Emitters.map(e => e.stop());
		window.Platforms.map(p => p.stop());
		return this;
	}

	clear() {
		this.stop();
		this.cont_background.removeAllChildren();
		this.cont_blockchains.removeAllChildren();
		this.cont_foreground.removeAllChildren();
		return this;
	}

	incrementTime() {

		this.time += 1;
		var ev = new createjs.Event('newminute');
		ev.time = this.time;
		window.Stage.dispatchEvent(ev);

		let tw = createjs.Tween.get(this.cont_sliding, { timeScale: window.TimeScale }).to({x: this.cont_sliding.x - this.params.minuteWidth}, 1000 * this.params.minuteSeconds)
							.call(proxy(this.incrementTime, this));
		window.Tweens.add(tw);
		this.slideTween = tw;

	}

	scrollY(y) {

		let time = 777;
		createjs.Tween.get(this.cont_blockchains).to({y: this.cont_blockchains.y + y}, time).call(proxy(this.scrollEnd, this));

		window.Platforms.map(p => {
			createjs.Tween.get(p.cont_background).to({y: p.cont_background.y + y}, time);
			createjs.Tween.get(p.cont_text).to({y: p.cont_background.y + y}, time);
		})
	}

	scrollEnd() {

		window.Platforms.map(p => p.chains.map(c => {
			let pos = c.localToGlobal(0,0);
      if(pos.y < 0 || pos.y > STAGEHEIGHT) c.params.visible = false;
		}));
	}

	hide() {
		this.alpha = 0;
		this.currentBar.alpha = 0;
		return this;
	}

	fadeIn(ms = 500) {
		createjs.Tween.get(this).to({alpha: 1}, ms);
		createjs.Tween.get(this.currentBar).to({alpha: 1}, ms);
		return this;
	}

	fadeOut(ms = 500) {
		createjs.Tween.get(this).to({alpha: 0}, ms);
		createjs.Tween.get(this.currentBar).to({alpha: 0}, ms);
		return this;
	}

}