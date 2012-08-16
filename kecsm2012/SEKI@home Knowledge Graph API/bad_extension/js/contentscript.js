var links = JSON.parse(localStorage['links'] || '{}');

(function() {


  $(function() {
    var interval = setInterval(function() {
      if ($('#rhs_block').length > 0) {
        clearInterval(interval);
        $('.kno-fv a')
          .add($('.vrt.kno-fb-ctx a.fl.ellip'))
          .each(function(){
            var href = $(this).attr('href');
            links[href] = links[href] || 1;
          });

        saveLinks();
        for (var link in links) {
          if (links[link] === 1) {
            links[link] = 2;
            saveLinks();
            console.warn('Going to: ', link);
            setTimeout(function(){
              window.location.href = link;
            }, 7 * 1000);
            break;
          }
        }
      }
    }, 1000);
  });


})();

function saveLinks () {
  localStorage['links'] = JSON.stringify(links);
}