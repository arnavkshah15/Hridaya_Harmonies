/* ════════════════════════════════════════════════
   HRIDAYA HARMONIES — AUDIO PLAYER + REEL FIX
   ════════════════════════════════════════════════ */

// Override reel card selector to scope only to the reel panel
(function () {
  'use strict';

  /* ── Fix reel switcher scope ────────────────────── */
  const reelPanel   = document.getElementById('featuredReel');
  const mainVideoEl = document.getElementById('featuredVideoPlayer');
  const mainOverlay = document.getElementById('featuredVideoOverlay');
  const mainTitle   = document.getElementById('featuredTitle');
  const mainTag     = document.getElementById('featuredTag');
  const mainDesc    = document.getElementById('featuredDesc');

  if (reelPanel && mainVideoEl) {
    const reelCards = reelPanel.querySelectorAll('.reel-card');
    reelCards.forEach(function (card) {
      card.addEventListener('click', function () {
        reelCards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');
        var src   = card.getAttribute('data-src');
        var title = card.getAttribute('data-title');
        var tag   = card.getAttribute('data-tag');
        var desc  = card.getAttribute('data-desc');
        if (!src) return; // skip cards without video src
        mainVideoEl.pause();
        mainVideoEl.src = src;
        mainVideoEl.load();
        if (mainTitle) mainTitle.textContent = title || '';
        if (mainTag)   mainTag.textContent   = tag   || '';
        if (mainDesc)  mainDesc.textContent  = desc  || '';
        if (mainOverlay) mainOverlay.classList.remove('hidden');
      });
    });
  }

  /* ── Audio Player: शहनाई गूँज ────────────────── */
  var audio        = document.getElementById('shahnaiAudio');
  var playBtn      = document.getElementById('audioPlayBtn');
  var rewindBtn    = document.getElementById('audioRewind');
  var forwardBtn   = document.getElementById('audioForward');
  var progressWrap = document.getElementById('audioProgressWrap');
  var progressBar  = document.getElementById('audioProgressBar');
  var currentEl    = document.getElementById('audioCurrentTime');
  var durationEl   = document.getElementById('audioDuration');
  var waveform     = document.getElementById('audioWaveform');

  if (!audio || !playBtn) return;

  function fmtTime(s) {
    if (!isFinite(s) || isNaN(s)) return '--:--';
    var m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function setPlaying(playing) {
    var iconPlay  = playBtn.querySelector('.icon-play');
    var iconPause = playBtn.querySelector('.icon-pause');
    if (iconPlay)  iconPlay.classList.toggle('hidden',  playing);
    if (iconPause) iconPause.classList.toggle('hidden', !playing);
    if (waveform)  waveform.classList.toggle('playing', playing);
  }

  playBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().catch(function () {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play',  function () { setPlaying(true); });
  audio.addEventListener('pause', function () { setPlaying(false); });
  audio.addEventListener('ended', function () {
    setPlaying(false);
    if (progressBar) progressBar.style.width = '0%';
    if (currentEl)   currentEl.textContent = '0:00';
  });

  audio.addEventListener('loadedmetadata', function () {
    if (durationEl) durationEl.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (currentEl) currentEl.textContent = fmtTime(audio.currentTime);
  });

  if (progressWrap) {
    progressWrap.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressWrap.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  }

  if (rewindBtn) {
    rewindBtn.addEventListener('click', function () {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
  }
  if (forwardBtn) {
    forwardBtn.addEventListener('click', function () {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });
  }
})();
