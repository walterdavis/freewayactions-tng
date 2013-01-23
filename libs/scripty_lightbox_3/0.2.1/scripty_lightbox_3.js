document.observe('dom:loaded', function(){
  //read the dimensions out of the filename string
  var version = '0.2.1';
  function read_geometry(str){
    var out = {'width':640,'height':480};
    if(str.length > 3 && str.include('x')){
      var parts = str.match(/\d{1,4}x\d{1,4}/);
      if(parts.length > 0){
        var dims = parts[0].split(/x/);
        if(dims[0] && dims[1]){
          out.width = parseInt(dims[0],10);
          out.height = parseInt(dims[1],10);
        }
      }
    }
    return out
  }
  function read_autoplay(str){
    var out = 'false';
    if(str.length > 3 && str.include('autoplay')){
      var parts = str.match(/autoplay:(true|false)/);
      if(parts.length > 0){
        return parts[1];
      }
    }
    return out
  }
  Element.addMethods({
    resizeToOverlay: function(element){
      var element = $(element);
      var width = element.getWidth();
      var height = element.getHeight();
      var size = parseFloat(element.readAttribute('data-size'));
      var ratio = Math.round((parseInt(width,10) / parseInt(height,10)) * 100) / 100;
      var screen = document.viewport.getDimensions();
      var screen_ratio = Math.round((parseInt(screen.width,10) / parseInt(screen.height,10)) * 100) / 100;
      if(ratio > screen_ratio){
        //photo is wide format, screen is not so go width-wise first, then set height
        if (width > (screen.width * size)){
          var new_width = (Math.round(screen.width * size));
          element.setStyle('width:' + new_width.toString() + 'px; height:' + Math.round(new_width / ratio).toString() + 'px');
        }
      }else{
        //go height-wise first, then set width
        if(element.getHeight() > (screen.height * size)){
          var new_height = (Math.round(screen.height * size));
          new_width = Math.round(new_height * ratio);
          element.setStyle('height:' + new_height.toString() + 'px; width:' + new_width.toString() + 'px');
        }
      }
      element.setStyle('top:' + (Math.floor(screen.height - element.getHeight()) / 2 + document.viewport.getScrollOffsets().top).toString() + 'px; left:' + ((Math.floor(screen.width - element.getWidth()) / 2) - $('PageDiv').positionedOffset().left).toString() + 'px;');
      element.setOpacity(1);
    }
  });
  //center the player in the window
  function center_player(){
    var elm = $('_player');
    var view = document.viewport.getDimensions();
    var container = elm.getDimensions();
    elm.setStyle('top:' + (Math.floor(view.height - container.height) / 2 + document.viewport.getScrollOffsets().top).toString() + 'px; left:' + ((Math.floor(view.width - container.width) / 2) - $('PageDiv').positionedOffset().left).toString() + 'px;');
    return Element.setOpacity.delay(0.1,elm,1);
  }
  //loop through all of the popup links, if any
  $$('a.popup').each(function(elm){
    //try to get the dimensions of the movie out of the filename, fall back to 640x480
    if(elm.rel){
      var geometry = read_geometry(elm.rel.toString());
      var autoplay = read_autoplay(elm.rel.toString());
    }else{
      var geometry = {'width':640,'height':480};
      var autoplay = 'false';
    }
    elm.observe('click',function(evt){
      evt.stop();
      if($('_player')) $('_player').remove();
      var player = new Element('div',{
        id:'_player',
        'class':'overlay'
        }
      );
      $('PageDiv').insert(player);
      if(elm.hasClassName('right')) player.addClassName('right');
      player.setStyle('background-color:' + elm.readAttribute('data-border'));
      player.writeAttribute('data-size', elm.readAttribute('data-size'));
      var radius = elm.readAttribute('data-radius') + 'px';
      $w('-moz-border-radius -webkit-border-radius	border-radius').each(function(attr){
        player.setStyle(attr + ':' + radius);
      })
      player.setOpacity(0);
      var filename = elm.href.toString().substr(elm.href.lastIndexOf('/') + 1);
      var extension = (filename.match(/\./)) ? filename.substr(filename.lastIndexOf('.') + 1).split(/[\?#]/)[0].toLowerCase() : false;
      if(geometry && (!extension || $w('htm html asp php jsp').include(extension))){
        player.setStyle('width:' + (geometry.width) + 'px; height:' + (geometry.height + 16) + 'px;');
        var iframe = new Template('<iframe width="#{width}" height="#{height}" border="0" src="#{src}"></iframe>');
        vars = {'height':(geometry.height), 'width':geometry.width, 'src':elm.href};
        player.update(iframe.evaluate(vars));
        window.setTimeout(center_player,1);
      }
      if(geometry && $w('mov m4v mp4').include(extension)){
        player.setStyle('width:' + (geometry.width) + 'px; height:' + (geometry.height + 16) + 'px;');
        var qt = new Template('<p><object width="#{width}" height="#{height}" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab"> <param name="src" value="#{src}"/> <param name="controller" value="true"/> <param name="autoplay" value="#{autoplay}"/> <embed src="#{src}" width="#{width}" height="#{height}" controller="true" scale="tofit" cache="true" autoplay="#{autoplay}" pluginspage="http://www.apple.com/quicktime/download/" /></object></p>');
        vars = {'height':(geometry.height + 16), 'width':geometry.width, 'src':elm.href, 'autoplay' : autoplay};
        player.update(qt.evaluate(vars));
        window.setTimeout(center_player,1);
      }
      if(geometry && extension == 'swf'){
        player.setStyle('width:' + geometry.width + 'px; height:' + geometry.height + 'px;');
        var swf = new Template('<p><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="#{width}" height="#{height}" align="middle"><param name="allowScriptAccess" value="sameDomain"/><param name="movie" value="#{src}"/><param name="quality" value="high"/><embed src="#{src}" quality="high" width="#{width}" height="#{height}" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer"/></object></p>');
        vars = {'height':geometry.height, 'width':geometry.width, 'src':elm.href};
        player.update(swf.evaluate(vars));
        window.setTimeout(center_player,1);
      }
      if($w('jpg jpeg png gif').include(extension)){
        var img = new Template('<p><img src="#{src}" class="popup" alt="#{src}" /></p>');
        player.update(img.evaluate({'src':elm.href}));
        if (!!geometry){
          player.setStyle('width:' + geometry.width + 'px; height:' + geometry.height + 'px;');
        }else{
          if(player.down('img')){
            geometry = player.down('img').getDimensions();
            player.setStyle('width:' + geometry.width + 'px; height:' + geometry.height + 'px;');
          }
        }
        Element.resizeToOverlay.delay(0.1,player);
      }
      player.insert({top:'<span id="_closer"></span>'});
    });
  });
  //close the player when the close box is clicked
  document.observe('click',function(evt){
    var elm;
    if( evt.findElement('#_closer') ){
      if($('_player')){
        $('_player').remove();
      }
    }
  });
  //hide the player on stray touch events (iOS only)
  document.observe('touchstart',function(evt){
    if(evt.findElement('#_player') || evt.findElement('a.popup')){
      //ignore
    }else if(evt.findElement('#_closer')){
      if($('_player')){
        $('_player').remove();
      }
    }else{
      if($('_player')){
        $('_player').remove();
      }
    }
  });
});