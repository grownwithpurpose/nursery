(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', 'Plant photo viewer');

  const closeButton = document.createElement('button');
  closeButton.className = 'photo-viewer-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close photo viewer');
  closeButton.textContent = '×';

  const frame = document.createElement('iframe');
  frame.className = 'photo-viewer-frame';
  frame.title = 'Selected plant photo';
  frame.setAttribute('sandbox', '');

  const toolbar = document.createElement('div');
  toolbar.className = 'photo-viewer-toolbar';

  const previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.setAttribute('aria-label', 'Show previous photo');
  previousButton.textContent = '‹';

  const counter = document.createElement('span');
  counter.setAttribute('aria-live', 'polite');

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Show next photo');
  nextButton.textContent = '›';
  toolbar.append(previousButton, counter, nextButton);
  dialog.append(closeButton, frame, toolbar);
  document.body.appendChild(dialog);

  let photos = [];
  let currentIndex = 0;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const showPhoto = index => {
    if (!photos.length) return;
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    const source = new URL(photo.src, document.baseURI).href;
    frame.title = photo.alt || 'Selected plant photo';
    frame.srcdoc = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#17211b}body{position:relative}img{position:absolute;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain}</style><img src="${escapeHtml(source)}" alt="${escapeHtml(photo.alt || '')}"></html>`;
    counter.textContent = `${currentIndex + 1} of ${photos.length}`;
  };

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest('[data-full-image][data-photo-group]');
    if (!trigger) return;
    const group = trigger.dataset.photoGroup;
    const photoElements = [...document.querySelectorAll('[data-full-image][data-photo-group]')]
      .filter(photo => photo.dataset.photoGroup === group);
    photos = photoElements
      .map(photo => ({
        src: photo.dataset.fullImage,
        alt: photo.dataset.imageAlt || photo.alt || ''
      }));
    currentIndex = photoElements.indexOf(trigger);
    if (currentIndex < 0) currentIndex = 0;
    window.trackNurseryEvent?.('enlarge_plant_photo', {
      plant_id: group,
      photo_index: currentIndex + 1
    });
    showPhoto(currentIndex);
    if (!dialog.open) dialog.showModal();
  });

  previousButton.addEventListener('click', () => showPhoto(currentIndex - 1));
  nextButton.addEventListener('click', () => showPhoto(currentIndex + 1));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    }
  });
})();
