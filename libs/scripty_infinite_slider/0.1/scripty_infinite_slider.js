document.observe('dom:loaded', function(){
  $$('.scripty-infinite-slider').each(function(elm){
    var animation_interval = parseInt(elm.readAttribute('data-slider-interval'),10);
    var animation_duration = parseInt(elm.readAttribute('data-slider-duration'),10);
    var backgrounds = elm.select('img').pluck('src');
    var elm = elm.update();
    var items = [];
    backgrounds.each(function(bg){
      var wrapper = new Element('div').addClassName('scripty-infinite-slide').setStyle('background-image:url(' + bg + ')');
      elm.insert(wrapper);
      items.push(wrapper);
    });
    items.each(function(item, idx){
      item['nxt'] = (items[idx + 1]) ? items[idx + 1] : items[0];
    }).first().addClassName('top');
    setInterval(
      function(){
        var top = elm.select('.top').first(), nxt = top.nxt;
        nxt.addClassName('on-deck');
        top.morph('left: -100%',{
          duration: animation_duration,
          afterFinish: function(){
            nxt.removeClassName('on-deck').addClassName('top');
            top.removeClassName('top').setStyle('left:0');
          }
        });
      },
      animation_interval * 1000);
    });
  }
);