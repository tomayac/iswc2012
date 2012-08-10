function restore() {
  var numMicroposts = document.getElementById('num_microposts');
  numMicroposts.value = localStorage.getItem('num_microposts') || 2;
  numMicroposts.addEventListener('change', function(e) {
    localStorage.setItem('num_microposts', numMicroposts.value);
  }, false);
  
  var googleKey = document.getElementById('google_key');    
  googleKey.value = localStorage.getItem('google_key') || '';
  googleKey.addEventListener('change', function(e) {
    localStorage.setItem('google_key', googleKey.value);
  }, false);
}  
window.onload = restore();
