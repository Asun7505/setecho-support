const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('[data-motion-toggle]');
const stageExample = document.querySelector('[data-demo]');
let paused = false;

document.querySelectorAll('[data-needs-script]').forEach(control => {
  control.hidden = false;
});

function applyMotionPreference() {
  const off = reduced.matches || paused;
  root.dataset.motion = off ? 'off' : 'auto';
  if (!motionButton) return;
  motionButton.disabled = reduced.matches;
  motionButton.setAttribute('aria-pressed', String(off));
  motionButton.querySelector('[data-motion-label]').textContent = reduced.matches
    ? motionButton.dataset.system : paused ? motionButton.dataset.resume : motionButton.dataset.pause;
}

motionButton?.addEventListener('click', () => {
  paused = !paused;
  applyMotionPreference();
});
reduced.addEventListener('change', applyMotionPreference);
applyMotionPreference();

if (stageExample) {
  const controls = Array.from(stageExample.querySelectorAll('[data-scene-select]'));
  const panels = stageExample.querySelectorAll('[data-panel]');
  const artworkArea = stageExample.querySelector('[data-parallax]');

  function selectScene(button) {
    const scene = button.dataset.sceneSelect;
    if (scene === stageExample.dataset.scene) return;
    stageExample.dataset.scene = scene;
    controls.forEach(control => {
      control.setAttribute('aria-pressed', String(control === button));
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.panel !== scene;
    });
  }

  controls.forEach(button => button.addEventListener('click', () => selectScene(button)));

  let frame = 0;
  artworkArea.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || root.dataset.motion === 'off') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = artworkArea.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stageExample.style.setProperty('--yaw', x * 14 + 'deg');
      stageExample.style.setProperty('--roll', -y * 12 + 'deg');
    });
  });
  artworkArea.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    stageExample.style.removeProperty('--yaw');
    stageExample.style.removeProperty('--roll');
  });
}

const contentsLinks = Array.from(document.querySelectorAll('.doc-toc-link'));
if (contentsLinks.length) {
  const sections = contentsLinks.map(link => document.getElementById(link.hash.slice(1)));
  let frame = 0;

  function updateCurrentSection() {
    const marker = Math.min(208, window.innerHeight * 0.31);
    let current = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i]?.getBoundingClientRect().top <= marker) current = i;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = sections.length - 1;
    }
    contentsLinks.forEach((link, index) => {
      if (current === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleContentsUpdate() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener('scroll', scheduleContentsUpdate, {passive: true});
  window.addEventListener('resize', scheduleContentsUpdate, {passive: true});
  updateCurrentSection();
}

const emailCopy = document.querySelector('[data-copy-email]');
if (emailCopy) {
  const status = document.querySelector('[data-copy-status]');
  emailCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailCopy.dataset.copyEmail);
      status.textContent = emailCopy.dataset.copied;
    } catch {
      status.textContent = emailCopy.dataset.copyError;
    }
  });
}
