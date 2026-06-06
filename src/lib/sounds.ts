import { Howl } from 'howler';

const sounds: Record<string, Howl> = {
  ambient: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], // Smoother cinematic drone
    loop: true,
    volume: 0.15
  }),
  transition: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], // Soft digital sweep (upward, positive)
    volume: 0.2
  }),
  success: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'], // Chime
    volume: 0.8
  }),
  selection: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Soft digital tick/click
    volume: 0.3
  })
};

export const playSound = (name: keyof typeof sounds) => {
  sounds[name]?.play();
};

export const stopSound = (name: keyof typeof sounds) => {
  sounds[name]?.stop();
};
