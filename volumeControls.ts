export function volumeControls(audio: HTMLAudioElement, control: HTMLDivElement) {
  function setControlClass() {
    if (!audio.paused) {
      control.className = 'control on';
    }
    else {
      control.className = 'control';
    }
  }
  setControlClass();
  audio.addEventListener('playing', () => {
    setControlClass();
  });
  audio.addEventListener('pause', () => {
    setControlClass();
  });
  control.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });
}
