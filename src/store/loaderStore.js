// Module-level loader state — avoids prop drilling and context overhead.
// Hero Canvas delays its mount until PageReveal finishes, preventing
// simultaneous WebGL contexts that cause THREE.WebGLRenderer: Context Lost.

let _done = false;
const _listeners = [];

export function setLoaderDone() {
  _done = true;
  _listeners.forEach(fn => fn());
  _listeners.length = 0;
}

export function onLoaderDone(fn) {
  if (_done) {
    fn();
  } else {
    _listeners.push(fn);
  }
}
