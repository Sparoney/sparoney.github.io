var mainContainer = document.getElementById('js-main-container'),
    loginContainer = document.getElementById('js-login-container'),
    loginButton = document.getElementById('js-btn-login'),
    background = document.getElementById('js-background');

var spotifyPlayer = new SpotifyPlayer();

var template = function (data) {
  return `
    <div class="main-wrapper">
      <div class="now-playing__img">
        <img src="${data.item.album.images[0].url}">
      </div>
      <div class="now-playing__side">
        <div class="now-playing__name">${data.item.name}</div>
        <div class="now-playing__artist">${data.item.artists[0].name}</div>
        ${!data.is_playing ? '<div class="now-playing__status">Paused</div>' : ''}
        <div class="progress">
          <div class="progress__bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
        </div>
      </div>
    </div>
	<div class="background" ${artistsCache[data.item.artists[0].id] ? 'style="background-image:url(' + artistsCache[data.item.artists[0].id] + ')"' : ''}></div>
  `;
};

//	<div class="background" ${artistsCache[data.item.artists[0].id] ? 'style="background-image:url(' + artistsCache[data.item.artists[0].id] + ')"' : ''}></div>

// <div class="background" style="background-image:url(${data.item.album.images[0].url})"></div>

var artistsCache = {},
    artistFetching = false;
spotifyPlayer.on('update', response => {
  var mainArtist = response.item.artists[0];
  if (!(mainArtist.id in artistsCache) && !artistFetching) {
    artistFetching = true;
    spotifyPlayer.fetchGeneric(mainArtist.href)
      .then(function(artist) {
        artistFetching = false;
        return artist.json();
      }).then(function(artist) {
        if (artist.images.length) {
          artistsCache[artist.id] = artist.images[0].url;
        }
      }).catch(function(e) {
        artistFetching = false;
      });
  }
  mainContainer.innerHTML = template(response);
});

spotifyPlayer.on('login', user => {
  if (user === null) {
    loginContainer.style.display = 'block';
    mainContainer.style.display = 'none';
  } else {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
  }
});

loginButton.addEventListener('click', () => {
    spotifyPlayer.login();
});

// click on the result and press enter to go fullscreen
document.addEventListener('keydown', (e) => {
  if (e.keyCode == 13) {
    var el = document.documentElement,
        rfs = el.requestFullscreen
          || el.webkitRequestFullScreen
          || el.mozRequestFullScreen
          || el.msRequestFullscreen;
    rfs.call(document.querySelector('.container'));
  }
}, false);

spotifyPlayer.init();