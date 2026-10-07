/* =========================================================
   Nicole Paula · Lash designer
   JavaScript puro, sem dependências.
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     CONFIGURAÇÃO — o que você pode editar
     ======================================================= */

  // WhatsApp: código do país (55) + DDD + número, só dígitos.
  const WHATSAPP_NUMBER = "5521993788215";
  const WHATSAPP_MESSAGE = "Olá! Vi seu trabalho e gostaria de saber mais sobre os atendimentos.";

  // Instagram
  const INSTAGRAM_URL = "https://www.instagram.com/nicole_paula_21/";

  // Nome de cada coleção (pasta). Troque livremente.
  // Pasta sem nome aqui aparece como "Trabalhos".
  const galleryTitles = {
    "01": "Sobrancelhas",
    "02": "Cílios e sobrancelhas",
    "03": "Cílios e sobrancelhas",
    "04": "Cílios e sobrancelhas",
    "05": "Unhas",
    "06": "Cílios",
    "07": "Cílios e sobrancelhas"
  };
  const DEFAULT_GALLERY_TITLE = "Trabalhos";

  // Depois de quantas coleções aparece a faixa "Gostou do que viu?"
  const CTA_EVERY = 3;
  const CTA_TEXT = "Gostou do que viu?";

  /* =======================================================
     A LISTA DE MÍDIAS (window.GALLERIES) vem do arquivo galleries.js.
     Ele é gerado automaticamente por scripts/gerar_galerias.py
     (e pelo workflow do GitHub, sempre que você envia arquivos
     para assets/). A ordem é numérica pelo nome do arquivo.
     ======================================================= */

  const IMAGE_EXT = ['webp', 'jpg', 'jpeg', 'png', 'avif', 'gif'];
  const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v'];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilidades ---------- */
  const baseName = (p) => p.split('/').pop();
  const extOf = (p) => (p.split('?')[0].split('.').pop() || '').toLowerCase();
  const typeOf = (p) => {
    const e = extOf(p);
    if (VIDEO_EXT.includes(e)) return 'video';
    if (IMAGE_EXT.includes(e)) return 'image';
    return null;
  };
  // Ordenação NUMÉRICA pelo nome (01, 02, 03 ... 10), ignorando o tipo do arquivo.
  const byNumber = (a, b) =>
    baseName(a).localeCompare(baseName(b), 'pt', { numeric: true, sensitivity: 'base' });

  const normalize = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === false || v == null) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  };

  const svg = (inner, extra) => {
    const wrap = document.createElement('span');
    wrap.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" focusable="false"' + (extra || '') + '>' + inner + '</svg>';
    return wrap.firstChild;
  };

  /* ---------- links de WhatsApp e Instagram ---------- */
  function setupLinks() {
    const wa = 'https://wa.me/' + WHATSAPP_NUMBER.replace(/\D/g, '') +
      '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
    document.querySelectorAll('[data-whatsapp]').forEach((a) => { a.href = wa; });

    document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = INSTAGRAM_URL; });
    const handle = INSTAGRAM_URL.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
    document.querySelectorAll('[data-instagram-handle]').forEach((a) => {
      if (handle) a.textContent = '@' + handle;
    });
  }

  /* ---------- controle global de vídeo (um por vez) ---------- */
  let playing = null;
  function playVideo(v) {
    if (playing && playing !== v) playing.pause();
    playing = v;
    const p = v.play();
    if (p && p.catch) p.catch(() => { /* autoplay bloqueado: o botão de play continua disponível */ });
  }
  function pauseVideo(v) {
    v.pause();
    if (playing === v) playing = null;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) playing.pause();
  });

  /* ---------- carrossel ---------- */
  function buildCarousel(folder, title, files) {
    const total = files.length;
    const nVideos = files.filter((f) => typeOf(f) === 'video').length;
    const nImages = total - nVideos;

    const track = el('div', {
      class: 'carousel__track',
      tabindex: total > 1 ? '0' : false,
      'aria-label': total > 1 ? title + ': use as setas do teclado para navegar' : false
    });

    const slides = files.map((src, i) => {
      const kind = typeOf(src);
      const label = title + ', item ' + (i + 1) + ' de ' + total;
      const slide = el('div', {
        class: 'slide',
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': (i + 1) + ' de ' + total
      });

      if (kind === 'video') {
        const poster = src.replace(/[^/]+$/, 'posters/' + baseName(src).replace(/\.[^.]+$/, '.jpg'));
        const video = el('video', {
          src: src,
          poster: poster,
          muted: true,
          loop: true,
          playsinline: true,
          preload: 'none',
          disablepictureinpicture: true,
          'aria-label': 'Vídeo: ' + label
        });
        video.muted = true; // garante o atributo em todos os navegadores
        const toggle = el('button', { class: 'slide__toggle', type: 'button', 'aria-label': 'Reproduzir ou pausar o vídeo' });
        slide.classList.add('is-paused');
        video.addEventListener('play', () => slide.classList.remove('is-paused'));
        video.addEventListener('pause', () => slide.classList.add('is-paused'));
        toggle.addEventListener('click', () => {
          if (video.paused) { delete slide.dataset.userPaused; playVideo(video); }
          else { slide.dataset.userPaused = '1'; pauseVideo(video); }
        });
        slide.append(video, toggle);
      } else {
        slide.appendChild(el('img', {
          src: src,
          alt: label,
          loading: 'lazy',
          decoding: 'async'
        }));
      }
      track.appendChild(slide);
      return slide;
    });

    /* controles */
    const dots = slides.map((_, i) => {
      const d = el('button', { class: 'carousel__dot', type: 'button', 'aria-label': 'Ir para o item ' + (i + 1) });
      d.addEventListener('click', () => goTo(i));
      return d;
    });
    const prev = el('button', { class: 'carousel__btn', type: 'button', 'aria-label': 'Item anterior' },
      [svg('<path d="M15 5l-7 7 7 7"/>')]);
    const next = el('button', { class: 'carousel__btn', type: 'button', 'aria-label': 'Próximo item' },
      [svg('<path d="M9 5l7 7-7 7"/>')]);
    prev.addEventListener('click', () => goTo(active - 1));
    next.addEventListener('click', () => goTo(active + 1));

    const controls = el('div', { class: 'carousel__controls' }, [
      el('div', { class: 'carousel__dots' }, dots),
      el('div', { class: 'carousel__arrows' }, [prev, next])
    ]);

    const root = el('div', {
      class: 'carousel' + (total === 1 ? ' is-single' : ''),
      role: 'region',
      'aria-roledescription': 'carrossel',
      'aria-label': title + ' (' + total + (total === 1 ? ' item' : ' itens') + ')'
    }, [track, controls]);

    /* estado */
    let active = 0;
    let inView = false;

    const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;

    function goTo(i) {
      const idx = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: slides[idx].offsetLeft - padLeft(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function computeActive() {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 2) return 0;
      if (track.scrollLeft >= max - 2) return total - 1;
      const pad = padLeft();
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - pad - track.scrollLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function syncVideos() {
      slides.forEach((slide, i) => {
        const v = slide.querySelector('video');
        if (!v) return;
        const wanted = inView && i === active && !slide.dataset.userPaused && !reduceMotion;
        if (wanted) playVideo(v);
        else if (!v.paused) pauseVideo(v);
      });
    }

    function render() {
      dots.forEach((d, i) => d.setAttribute('aria-current', i === active ? 'true' : 'false'));
      prev.disabled = active === 0;
      next.disabled = active === total - 1;
      syncVideos();
    }

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const idx = computeActive();
        if (idx !== active) {
          // ao mudar de slide, o vídeo anterior pausa e a escolha manual é zerada
          slides.forEach((s, i) => { if (i !== idx) delete s.dataset.userPaused; });
          active = idx;
          render();
        }
      });
    }, { passive: true });

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
    });

    window.addEventListener('resize', () => { active = computeActive(); render(); }, { passive: true });

    /* vídeo só toca com o carrossel visível; metadados só perto da tela */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          inView = en.isIntersecting;
          syncVideos();
        });
      }, { threshold: 0.45 }).observe(root);

      if (nVideos) {
        const warm = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            root.querySelectorAll('video').forEach((v) => { if (v.preload === 'none') v.preload = 'metadata'; });
            warm.disconnect();
          });
        }, { rootMargin: '600px 0px' });
        warm.observe(root);
      }
    }

    render();
    return { root, nImages, nVideos };
  }

  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  function metaText(nImages, nVideos) {
    const parts = [];
    if (nImages) parts.push(plural(nImages, 'foto', 'fotos'));
    if (nVideos) parts.push(plural(nVideos, 'vídeo', 'vídeos'));
    return parts.join(' e ');
  }

  /* ---------- montagem das galerias ---------- */
  function buildGalleries() {
    const host = document.getElementById('galleries');
    const data = window.GALLERIES;
    if (!host) return {};
    if (!data || !Object.keys(data).length) {
      host.appendChild(el('p', { class: 'works__empty', text: 'Em breve, novos trabalhos por aqui.' }));
      return {};
    }

    const folders = Object.keys(data)
      .filter((k) => parseInt(k, 10) > 0) // 00 é a identidade, não é carrossel
      .sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));

    const titlesByFolder = {};
    let shown = 0;

    folders.forEach((folder) => {
      const files = (data[folder] || []).filter((f) => typeOf(f)).slice().sort(byNumber);
      if (!files.length) return;

      const title = (galleryTitles[folder] || '').trim() || DEFAULT_GALLERY_TITLE;
      titlesByFolder[folder] = title;
      const id = 'galeria-' + folder;
      const { root, nImages, nVideos } = buildCarousel(folder, title, files);

      const article = el('article', {
        class: 'gallery reveal' + (shown % 2 === 1 ? ' gallery--flip' : ''),
        id: id,
        'aria-labelledby': id + '-title'
      }, [
        el('div', { class: 'gallery__head' }, [
          el('h3', { id: id + '-title', text: title }),
          el('p', { class: 'gallery__meta', text: metaText(nImages, nVideos) })
        ]),
        root
      ]);
      host.appendChild(article);
      shown += 1;

      // faixa de WhatsApp depois de cada bloco de galerias
      if (shown % CTA_EVERY === 0 && shown < folders.length) {
        const a = el('a', { class: 'btn btn--primary btn--on-light', href: '#agendar', target: '_blank', rel: 'noopener', 'data-whatsapp': true, 'aria-label': 'Agendar pelo WhatsApp' }, [
          waIcon(),
          document.createTextNode('Agendar pelo WhatsApp')
        ]);
        host.appendChild(el('div', { class: 'cta-band reveal' }, [el('p', { text: CTA_TEXT }), a]));
      }
    });

    return titlesByFolder;
  }

  function waIcon() {
    const wrap = document.createElement('span');
    wrap.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42"/></svg>';
    return wrap.firstChild;
  }

  /* ---------- serviços ligados às coleções pelo nome ---------- */
  function linkServices(titlesByFolder) {
    document.querySelectorAll('.service[data-match]').forEach((item) => {
      const key = item.getAttribute('data-match');
      const link = item.querySelector('.service__link');
      if (!link || link.hasAttribute('data-whatsapp')) return;
      const folder = Object.keys(titlesByFolder).find((f) => normalize(titlesByFolder[f]).includes(key));
      if (folder) link.setAttribute('href', '#galeria-' + folder);
      else link.setAttribute('href', '#trabalhos');
    });
  }

  /* ---------- revelar ao rolar ---------- */
  function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((n) => io.observe(n));
  }

  /* ---------- botão flutuante (celular) ---------- */
  function setupFab() {
    const fab = document.querySelector('.fab');
    const hero = document.querySelector('.hero');
    const final = document.getElementById('agendar');
    if (!fab || !hero || !('IntersectionObserver' in window)) return;
    fab.hidden = false;

    let heroVisible = true, finalVisible = false;
    const update = () => fab.classList.toggle('is-shown', !heroVisible && !finalVisible);

    new IntersectionObserver((e) => { heroVisible = e[0].intersectionRatio > 0.35; update(); }, { threshold: [0, 0.35, 1] }).observe(hero);
    new IntersectionObserver((e) => { finalVisible = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(final);
  }

  /* ---------- iniciar ---------- */
  function init() {
    setupLinks();
    const titles = buildGalleries();
    linkServices(titles);
    setupLinks(); // aplica os links também aos botões criados dinamicamente
    setupReveal();
    setupFab();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
