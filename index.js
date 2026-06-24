document.addEventListener("DOMContentLoaded", () => {
  initMetaballsBlock();
  initAddToCart();
  initAccordion();
  initVariantSwatches();
  initGalleryThumbs();
  initScrollHint();
  initAboutSlider();
  initEventsSwitcher();
  initCart();
  initButtonHover();
  initEmailForm();
  initShopButtons();
});

/* МЕТАБОЛЫ */
function initMetaballsBlock() {
  const canvas = document.getElementById("metaballsCanvas");
  if (!canvas) return;

  const container = canvas.parentElement;
  const ctx = canvas.getContext("2d");

  const BG_COLOR = { r: 35, g: 33, b: 33 };
  const BALL_COLOR = { r: 18, g: 17, b: 17 };
  const GLINT_COLOR = { r: 45, g: 40, b: 40 }; 

  class Ball {
    constructor(effect, x, y) {
      this.effect = effect;
      this.x = x || Math.random() * this.effect.width;
      this.y = y || Math.random() * this.effect.height;
      this.radius = Math.random() * 60 + 30;
      this.speedX = (Math.random() - 0.5) * 2; 
      this.speedY = (Math.random() - 0.5) * 2;
    }
    update() {
      if (this.x - this.radius < 0) { this.x = this.radius; this.speedX = -this.speedX; }
      if (this.x + this.radius > this.effect.width) { this.x = this.effect.width - this.radius; this.speedX = -this.speedX; }
      if (this.y - this.radius < 0) { this.y = this.radius; this.speedY = -this.speedY; }
      if (this.y + this.radius > this.effect.height) { this.y = this.effect.height - this.radius; this.speedY = -this.speedY; }

      this.x += this.speedX;
      this.y += this.speedY;
    }
  }

  class MetaballsEffect {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.balls = [];
    }
    init(numberOfBalls) {
      for (let i = 0; i < numberOfBalls; i++) {
        this.balls.push(new Ball(this));
      }
    }
    update() {
      this.balls.forEach((ball) => ball.update());
    }
    draw(context) {
      const imageData = context.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = BG_COLOR.r;
        data[i + 1] = BG_COLOR.g;
        data[i + 2] = BG_COLOR.b;
        data[i + 3] = 255;
      }

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let sum = 0;
          let glintSum = 0;

          for (let ball of this.balls) {
            const dx = x - ball.x;
            const dy = y - ball.y;
            const distanceSq = dx * dx + dy * dy;
    
            sum += (ball.radius * ball.radius) / (distanceSq + 0.1);

            const glintDx = dx - ball.radius * 0.35; 
            const glintDy = dy + ball.radius * 0.35; 
            const glintDistanceSq = glintDx * glintDx + glintDy * glintDy;

            const rSmall = ball.radius * 0.5;
            glintSum += (rSmall * rSmall) / (glintDistanceSq + 0.1);
          }

          if (sum > 0.55) {
            const index = (y * this.width + x) * 4;

            if (glintSum > 0.2) {
            
              const t = Math.min(1, (glintSum - 0.2) / 0.8);

              data[index] = BALL_COLOR.r + (GLINT_COLOR.r - BALL_COLOR.r) * t;
              data[index + 1] = BALL_COLOR.g + (GLINT_COLOR.g - BALL_COLOR.g) * t;
              data[index + 2] = BALL_COLOR.b + (GLINT_COLOR.b - BALL_COLOR.b) * t;
            } else {
              // Обычный цвет тела метабола
              data[index] = BALL_COLOR.r;
              data[index + 1] = BALL_COLOR.g;
              data[index + 2] = BALL_COLOR.b;
            }
            data[index + 3] = 255;
          }
        }
      }
      context.putImageData(imageData, 0, 0);
    }
    addBall(x, y) {
      const newBall = new Ball(this, x, y);
      newBall.radius = Math.random() * 35 + 15;
      newBall.speedX = (Math.random() - 0.5) * 2;
      newBall.speedY = (Math.random() - 0.5) * 2;
      this.balls.push(newBall);
    }
    removeBall() {
      if (this.balls.length > 1) this.balls.pop();
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
    }
  }

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (effect) effect.resize(canvas.width, canvas.height);
  }

  const effect = new MetaballsEffect(canvas.width, canvas.height);
  effect.init(8);

  function animate() {
    if (!canvas.isConnected) return;
    effect.update();
    effect.draw(ctx);
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  setTimeout(animate, 200);

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestBall = null;
    let closestDistance = Infinity;

    for (let ball of effect.balls) {
      const dx = ball.x - mouseX;
      const dy = ball.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBall = ball;
      }
    }

    if (closestBall && closestDistance < 100) {
      const dx = mouseX - closestBall.x;
      const dy = mouseY - closestBall.y;
      closestBall.speedX += dx * 0.03;
      closestBall.speedY += dy * 0.03;

      const maxSpeed = 4;
      closestBall.speedX = Math.min(maxSpeed, Math.max(-maxSpeed, closestBall.speedX));
      closestBall.speedY = Math.min(maxSpeed, Math.max(-maxSpeed, closestBall.speedY));
    }
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    effect.addBall(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    effect.removeBall();
  });

  window.addEventListener("resize", resizeCanvas);
}
/*  ДОБАВЛЕНИЕ В КОРЗИНУ  */
function initAddToCart() {
  document.querySelectorAll('.product-btn, .add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const productName = this.dataset.product || "Товар";
      
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(productName);
      localStorage.setItem('cart', JSON.stringify(cart));
      
      alert(`Товар "${productName}" добавлен в корзину!`);
      window.location.href = './shop.html';
    });
  });
}

/*  АККОРДЕОН */
function initAccordion() {

  const triggers = document.querySelectorAll('.accordion__trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.dataset.target);
      const arrow = trigger.querySelector('.accordion__arrow');
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      setPanelState(trigger, panel, arrow, !isOpen);
    });
  });

  const archiveItems = document.querySelectorAll('.accordion__item:not(.is-disabled)');
  if (archiveItems.length > 0) {
    archiveItems.forEach(function (item) {
      const header = item.querySelector('.accordion__header');
      if (!header) return;

      header.addEventListener('click', function () {
        const willOpen = !item.classList.contains('is-open');

        archiveItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            const otherHeader = other.querySelector('.accordion__header');
            if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('is-open', willOpen);
        header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  }
}

function setPanelState(trigger, panel, arrow, open) {
  if (!panel) return;
  trigger.setAttribute('aria-expanded', String(open));
  if (arrow) arrow.classList.toggle('is-open', open);

  if (open) {
    panel.hidden = false;
    panel.style.maxHeight = panel.scrollHeight + 'px';
  } else {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    requestAnimationFrame(() => {
      panel.style.maxHeight = '0px';
    });
    panel.addEventListener('transitionend', function hide() {
      if (trigger.getAttribute('aria-expanded') === 'false') {
        panel.hidden = true;
      }
      panel.removeEventListener('transitionend', hide);
    });
  }
}

window.addEventListener('load', () => {
  document.querySelectorAll('.accordion__panel').forEach((panel) => {
    panel.style.transition = 'max-height .35s cubic-bezier(.4,0,.2,1)';
    panel.style.maxHeight = !panel.hidden ? panel.scrollHeight + 'px' : '0px';
  });
});
/* HOVER */
function initButtonHover() {
    document.querySelectorAll('[data-default][data-hover]').forEach(function(img) {
        const parent = img.closest('a, button');
        if (!parent) return;
        parent.addEventListener('mouseenter', function() {
            img.src = img.dataset.hover;
        });
        parent.addEventListener('mouseleave', function() {
            img.src = img.dataset.default;
        });
    });
}
/* EMAIL ФОРМА:*/
function initEmailForm() {
    const form    = document.getElementById('emailForm');
    const input   = document.getElementById('emailInput');
    const modal   = document.getElementById('emailModal');
    const closeBtn = document.getElementById('emailModalClose');
    if (!form || !modal) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!input.value || !input.validity.valid) {
            input.style.borderColor = 'rgba(233,100,100,0.7)';
            setTimeout(function() { input.style.borderColor = ''; }, 1500);
            return;
        }
        input.value = '';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    });
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') modal.classList.remove('is-open');
    });
}
/* КНОПКИ МАГАЗИНА */
function initShopButtons() {
    document.querySelectorAll('.product-btn[data-href]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = btn.dataset.href;
        });
    });
}
/* КНОПКИ ВАРИАНТОВ*/
function initVariantSwatches() {
  const swatches = document.querySelectorAll('.variant-swatch');
  const mainImg = document.getElementById('galleryMainImg');
  const titleEl = document.querySelector('.info__title') || document.querySelector('.product__title');
  const descEl = document.querySelector('.accordion__panel#description p');
  const thumbs = document.querySelectorAll('.gallery__thumb');
  
  const charVolume = document.getElementById('charVolume');
  const charForm = document.getElementById('charForm');
  const charUsage = document.getElementById('charUsage');
  const charAging = document.getElementById('charAging');
  const charStorage = document.getElementById('charStorage');
  const addToCartBtn = document.querySelector('.add-to-cart');

  if (swatches.length === 0) return;

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('is-active'));
      swatch.classList.add('is-active');

      const rawData = swatch.dataset.productData || swatch.getAttribute("data-product-data");
      if (!rawData) return;

      try {
        const product = JSON.parse(rawData);

        if (titleEl && product.title) titleEl.textContent = product.title;
        if (descEl && product.description) descEl.textContent = product.description;

        if (mainImg && (product.mainImg || product.mainImg)) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.setAttribute('src', product.mainImg || product.mainImg);
            mainImg.style.opacity = '1';
          }, 150);
        }

        if (thumbs[0] && product.thumb1) {
          const img1 = thumbs[0].querySelector('img');
          if (img1) img1.setAttribute('src', product.thumb1);
          thumbs[0].setAttribute('data-full', product.thumb1);
        }
        if (thumbs[1] && product.thumb2) {
          const img2 = thumbs[1].querySelector('img');
          if (img2) img2.setAttribute('src', product.thumb2);
          thumbs[1].setAttribute('data-full', product.thumb2);
        }

        if (charVolume && product.volume) charVolume.textContent = product.volume;
        if (charForm && product.form) charForm.textContent = product.form;
        if (charUsage && product.usage) charUsage.textContent = product.usage;
        if (charAging && product.aging) charAging.textContent = product.aging;
        if (charStorage && product.storage) charStorage.textContent = product.storage;

        if (addToCartBtn && product.title) addToCartBtn.setAttribute('data-product', product.title);

      } catch (e) {
        console.error("Ошибка при чтении данных товара: ", e);
      }
    });
  });
}

/* ГАЛЕРЕЯ (Клик по миниатюрам)  */
function initGalleryThumbs() {
  const galleries = document.querySelectorAll('[data-gallery]');
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const mainImg = gallery.querySelector('#galleryMainImg') || gallery.querySelector('.archive-display__img');
    const thumbs = gallery.querySelectorAll('.gallery__thumb, .archive-gallery__thumb');
    
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      const thumbImg = thumb.querySelector('img');
      if (!thumbImg) return;

      thumb.addEventListener('click', () => {
        const currentMainSrc = mainImg.getAttribute('src');
        const currentThumbSrc = thumbImg.getAttribute('src');

        if (currentMainSrc === currentThumbSrc) return;

        mainImg.style.opacity = '0';

        window.setTimeout(() => {
          if (thumb.classList.contains('archive-gallery__thumb')) {
            const fullSrc = thumb.getAttribute('data-full') || currentThumbSrc;
            mainImg.setAttribute('src', fullSrc);
          } else {
            mainImg.setAttribute('src', currentThumbSrc);
            thumbImg.setAttribute('src', currentMainSrc);
            thumb.setAttribute('data-full', currentMainSrc);
          }
          mainImg.style.opacity = '1';
        }, 180);
        thumbs.forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });
  });
}

/* СКРОЛЛ */
function initScrollHint() {
  const hint = document.querySelector(".scroll-hint");
  if (!hint) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      hint.style.opacity = "0";
      hint.style.pointerEvents = "none";
    } else {
      hint.style.opacity = "1";
      hint.style.pointerEvents = "auto";
    }
  });
}

/* 7. СЛАЙДЕР ИНТЕРЬЕРОВ (О компании) */
function initAboutSlider() {
  const slides = document.querySelectorAll('.about-slider__img');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  
  if (slides.length > 0 && prevBtn && nextBtn) {
    let currentSlideIndex = 0;

    function changeSlide(nextIndex) {
      slides[currentSlideIndex].classList.remove('is-active');
      
      if (nextIndex >= slides.length) {
        currentSlideIndex = 0;
      } else if (nextIndex < 0) {
        currentSlideIndex = slides.length - 1;
      } else {
        currentSlideIndex = nextIndex;
      }
      
      slides[currentSlideIndex].classList.add('is-active');
    }

    nextBtn.addEventListener('click', () => {
      changeSlide(currentSlideIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
      changeSlide(currentSlideIndex - 1);
    });
  }
}

/* СТРАНИЦА СОБЫТИЙ: переключение событий и миниатюр */
function initEventsSwitcher() {
  const sidebarItems = document.querySelectorAll('.events__list-item');
  if (!sidebarItems.length) return;
  const EVENTS = [
    {
      poster:   './images/poster1.2.png',
      thumbs:   ['./images/poster1.1.png', './images/poster1.3.png'],
      title:    'с тобой в темноте',
      dateTime: '17.08  19:00',
      blocks: [
        { label: 'близкое', desc: 'шёпот, дыхание, шорохи. Источники – в 5–10 сантиметрах от вашего уха. Возникает устойчивое ощущение, что в комнате с вами кто-то есть.' },
        { label: 'далёкое', desc: 'шаги по металлу, эхо в пустоте, капли воды. Источники – за десятки метров от вас.' },
      ],
    },
    {
      poster:   './images/poster2.1.png', 
      thumbs:   ['./images/poster2.3.png', './images/poster2.2.png'],
      title:    'видеть страхи',
      dateTime: '14.10  18:30',
      blocks: [
        { label: 'о лекции', desc: 'открытая лекция о механизмах восприятия страха' },
        { label: 'формат',   desc: 'два часа, вопросы и ответы, архивные материалы лаборатории' },
      ],
    },
    {
      poster:   './images/poster3.2.png',
      thumbs:   ['./images/poster3.1.png', './images/poster3.3.png'],
      title:    'детские страхи',
      dateTime: '17.11  11:00',
      blocks: [
        { label: 'проект',  desc: 'исследуем природу детских страхов совместно с психологами' },
        { label: 'участие', desc: 'возраст 8–14 лет. Необходима регистрация. Мест: 12' },
      ],
    },
    {
      poster:   './images/poster4.1.png',
      thumbs:   ['./images/poster4.2.png', './images/poster4.3.png'],
      title:    'эхо изоляции',
      dateTime: '05.12  20:00',
      blocks: [
        { label: 'интерактивная выставка', desc: ' в замкнутом пространстве.' },
        { label: 'Длительность', desc: 'сеанс 90 минут без антракта.' },
      ],
    },
    {
      poster:   './images/poster5.1.png',
      thumbs:   ['./images/poster5.2.png', './images/poster5.3.png'],
      title:    'твои фобии',
      dateTime: '20.12  16:00',
      blocks: [
        { label: 'курс лекций', desc: 'социальная ответственность за фобии' },
        { label: 'лектор', desc: 'главный технолог отдела разработки системы восприятия страха' },
      ],
    },
    
  ];
  const poster       = document.getElementById('evPoster');
  const title        = document.getElementById('evTitle');
  const dateTime     = document.getElementById('evDateTime');
  const label1       = document.getElementById('evLabel1');
  const desc1        = document.getElementById('evDesc1');
  const label2       = document.getElementById('evLabel2');
  const desc2        = document.getElementById('evDesc2');
  const thumbContainer = document.getElementById('evThumbs');
  function applyEvent(idx) {
    const ev = EVENTS[idx];
    if (!ev) return;

    if (poster) { poster.style.opacity = '0'; poster.style.transform = 'scale(1.03)'; }
    setTimeout(function () {
      if (poster)   { poster.src = ev.poster; poster.style.opacity = '1'; poster.style.transform = 'scale(1)'; }
      if (title)    title.textContent = ev.title;
      if (dateTime) dateTime.textContent = ev.dateTime;
      if (label1 && ev.blocks[0]) label1.textContent = ev.blocks[0].label;
      if (desc1  && ev.blocks[0]) desc1.textContent  = ev.blocks[0].desc;
      if (label2 && ev.blocks[1]) label2.textContent = ev.blocks[1].label;
      if (desc2  && ev.blocks[1]) desc2.textContent  = ev.blocks[1].desc;

      if (thumbContainer) {
        const thumbBtns = thumbContainer.querySelectorAll('.events__thumb');
        thumbBtns.forEach(function (btn, i) {
          const img = btn.querySelector('img');
          if (img) img.src = ev.thumbs[i] !== undefined ? ev.thumbs[i] : ev.thumbs[0];
          btn.classList.toggle('events__thumb--active', i === 0);
        });
      }
    }, 220);
  }

  sidebarItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const idx = parseInt(item.dataset.event, 10);
      sidebarItems.forEach(function (el) {
        el.classList.remove('events__list-item--active');
      });
      item.classList.add('events__list-item--active');
      applyEvent(idx);
    });
  });

  if (thumbContainer) {
    thumbContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('.events__thumb');
      if (!btn) return;
      const thumbBtns = thumbContainer.querySelectorAll('.events__thumb');
      const clickedImg = btn.querySelector('img');
      if (poster && clickedImg) {
        const oldSrc = poster.src;
        poster.style.opacity = '0';
        setTimeout(function () {
          poster.src = clickedImg.src;
          clickedImg.src = oldSrc;
          poster.style.opacity = '1';
        }, 200);
      }
      thumbBtns.forEach(function (el) { el.classList.remove('events__thumb--active'); });
      btn.classList.add('events__thumb--active');
    });
  }
}
/* КОРЗИНА */
function initCart() {
    const cartItems   = document.querySelectorAll('.cart-item');
    const totalEl     = document.getElementById('cartTotal');
    const countEl     = document.getElementById('cartCount');
    const emptyEl     = document.getElementById('cartEmpty');
    const recBtns     = document.querySelectorAll('.cart-rec-card__btn');
    const clearBtn    = document.getElementById('cartClearBtn');
    if (!cartItems.length && !recBtns.length) return;
    function recalc() {
        let sum = 0, count = 0;
        document.querySelectorAll('.cart-item').forEach(function(item) {
            const cb  = item.querySelector('.cart-item__checkbox');
            const qty = parseInt(item.querySelector('.cart-item__qty-val').textContent, 10);
            const price = parseInt(item.dataset.price, 10);
            if (cb && cb.checked) {
                sum   += price * qty;
                count += qty;
            }
            item.classList.toggle('is-unchecked', cb && !cb.checked);
        });
        if (totalEl) totalEl.textContent = sum.toLocaleString('ru-RU') + ' ₽';
        if (countEl) countEl.textContent = count;

        const remaining = document.querySelectorAll('.cart-item');
        if (emptyEl) emptyEl.style.display = remaining.length === 0 ? 'block' : 'none';
    }

    document.querySelectorAll('.cart-item__checkbox').forEach(function(cb) {
        cb.addEventListener('change', recalc);
    });

    document.querySelectorAll('.cart-item__qty-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const item   = btn.closest('.cart-item');
            const valEl  = item.querySelector('.cart-item__qty-val');
            let   qty    = parseInt(valEl.textContent, 10);
            if (btn.dataset.action === 'plus') qty = Math.min(qty + 1, 99);
            if (btn.dataset.action === 'minus') qty = Math.max(qty - 1, 1);
            valEl.textContent = qty;
            const price = parseInt(item.dataset.price, 10);
            item.querySelector('.cart-item__price').textContent =
                (price * qty).toLocaleString('ru-RU') + ' ₽';
            recalc();
        });
    });

    document.querySelectorAll('.cart-item__remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            btn.closest('.cart-item').remove();
            recalc();
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.querySelectorAll('.cart-item').forEach(function(el) { el.remove(); });
            recalc();
        });
    }

    recBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const card  = btn.closest('.cart-rec-card');
            const name  = card.dataset.name;
            const price = card.dataset.price;
           
            const itemsContainer = document.querySelector('.cart-items') || document.getElementById('cartItems');
            if (!itemsContainer) return;
            
            if (emptyEl) emptyEl.style.display = 'none';
           
            let found = null;
            document.querySelectorAll('.cart-item').forEach(function(el) {
                if (el.querySelector('.cart-item__name') &&
                    el.querySelector('.cart-item__name').textContent === name) found = el;
            });
            if (found) {
               
                const valEl   = found.querySelector('.cart-item__qty-val');
                const qty     = parseInt(valEl.textContent, 10) + 1;
                valEl.textContent = qty;
                const p = parseInt(found.dataset.price, 10);
                found.querySelector('.cart-item__price').textContent =
                    (p * qty).toLocaleString('ru-RU') + ' ₽';
            } else {
               
                const newItem = document.createElement('div');
                newItem.className = 'cart-item';
                newItem.dataset.price = price;
                newItem.innerHTML = `
                    <label class="cart-item__check-wrap">
                        <input type="checkbox" class="cart-item__checkbox" checked />
                        <span class="cart-item__checkmark"></span>
                    </label>
                    <div class="cart-item__img-wrap">
                        <img src="${card.querySelector('img').src}" alt="${name}" class="cart-item__img" />
                    </div>
                    <div class="cart-item__info">
                        <p class="cart-item__name">${name}</p>
                        <p class="cart-item__desc">добавлено из рекомендаций</p>
                    </div>
                    <div class="cart-item__qty">
                        <button class="cart-item__qty-btn" data-action="minus">−</button>
                        <span class="cart-item__qty-val">1</span>
                        <button class="cart-item__qty-btn" data-action="plus">+</button>
                    </div>
                    <p class="cart-item__price">${parseInt(price).toLocaleString('ru-RU')} ₽</p>
                    <button class="cart-item__remove" aria-label="Удалить">✕</button>`;
                
                itemsContainer.insertBefore(newItem, emptyEl);
                
                newItem.querySelector('.cart-item__checkbox').addEventListener('change', recalc);
                newItem.querySelector('.cart-item__remove').addEventListener('click', function() {
                    newItem.remove(); recalc();
                });
                newItem.querySelectorAll('.cart-item__qty-btn').forEach(function(b) {
                    b.addEventListener('click', function() {
                        const v = newItem.querySelector('.cart-item__qty-val');
                        let q = parseInt(v.textContent, 10);
                        if (b.dataset.action === 'plus') q = Math.min(q+1,99);
                        if (b.dataset.action === 'minus') q = Math.max(q-1,1);
                        v.textContent = q;
                        newItem.querySelector('.cart-item__price').textContent =
                            (parseInt(price)*q).toLocaleString('ru-RU') + ' ₽';
                        recalc();
                    });
                });
            }
            recalc();
            btn.textContent = '✓ добавлено';
            setTimeout(function() { btn.textContent = 'в корзину'; }, 2000);
        });
    });
    recalc(); 
}