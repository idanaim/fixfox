declare global {
  var global: {
    reload?: () => void;
  } & typeof globalThis;
}

export {}; 