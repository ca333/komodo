class Tour extends createjs.Container {

  constructor(params) {

    super();
    var defaults = {
    };

    this.params = extend(defaults,params);
    this.chapters = [];
    this.current = null;
    this.init(params);
  }

  init(params) {
    //
  }

  start() {

    this.current = this.chapters[0];
    this.current.start();

    Stage.addEventListener('chapter_ended', proxy(this.next, this));
  }

  addChapter(chapter) {

    this.chapters.push(chapter);
  }

  goToChapter(name) {

    let chapter = this.chapters.find(c => c.params.name == name);
    if(chapter == null) console.error('Chapter "'+name+'" does not exist');

    this.current.stop();
    this.clearStage();
    chapter.start();

    this.current = chapter;
  }

  next() {

    let chapter = this.chapters[this.chapters.indexOf(this.current)+1];

    if(chapter == null) return this.stop();

    this.current.stop();
    this.clearStage();
    chapter.start();

    this.current = chapter;
  }

  clearStage() {

    Cont_main.removeAllChildren();
  }

  stop() {

    Stage.dispatchEvent('tour_ended')
  }

}