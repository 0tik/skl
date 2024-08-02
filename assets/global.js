function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {

    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const mainIcon = detailsElement.closest('#nav-icon3');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        mainIcon.classList.add('open');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
      this.mainIcon.classList.add('open');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
        
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    if(!this.mainDetailsToggle.classList.contains('mobile-facets__disclosure')) {
      this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
    }
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
          $('#nav-icon3').toggleClass('open');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    if(elementToFocus != undefined){
    $('#nav-icon3').toggleClass('open');
    }
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    if(poster.classList.contains('no_poster')) {
      this.checkIfVideoInView = this.checkIfVideoInView.bind(this);
      document.addEventListener('scroll', this.checkIfVideoInView);
    } else {
      poster.addEventListener('click', this.loadContent.bind(this));
    }
  }

  checkIfVideoInView() {
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    const posterBoundingClientRect = poster.getBoundingClientRect();
    const top = posterBoundingClientRect.top - 50;
    const bottom = posterBoundingClientRect.bottom + 50;
    const posterInView = top <= window.innerHeight && bottom >= 0;
    if (posterInView) {
      this.loadContent();
      this.removeVideoListener();
    }
  }

  removeVideoListener(el) {
    document.removeEventListener('scroll', this.checkIfVideoInView);
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();

      const ad = this.closest('.card-wrapper__ad');
      if (!ad) return;
      ad.classList.add('video-loaded');
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor(
      (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset
    );
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;

    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1],
          },
        })
      );
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset;
    this.setSlidePosition(this.slideScrollPosition);
  }

  setSlidePosition(position) {
    this.slider.scrollTo({
      left: position,
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.announcementBarSlider = this.querySelector('.announcement-bar-slider');
    // Value below should match --duration-announcement-bar CSS value
    this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach((link) => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.announcementBarSlider) {
      this.announcementBarArrowButtonWasClicked = false;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion.addEventListener('change', () => {
        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
      });

      [this.prevButton, this.nextButton].forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            this.announcementBarArrowButtonWasClicked = true;
          },
          { once: true }
        );
      });
    }

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.autoplaySpeed = this.slider.dataset.speed * 1000;
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    if (this.querySelector('.slideshow__autoplay')) {
      this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
      this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
      this.autoplayButtonIsSetToPlay = true;
      this.play();
    } else {
      this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked ? this.pause() : this.play();
    }
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    this.wasClicked = true;

    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) {
      this.applyAnimationToAnnouncementBar(event.currentTarget.name);
      return;
    }

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition =
        this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }

    this.setSlidePosition(this.slideScrollPosition);

    this.applyAnimationToAnnouncementBar(event.currentTarget.name);
  }

  setSlidePosition(position) {
    if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout);
    this.setPositionTimeout = setTimeout(() => {
      this.slider.scrollTo({
        left: position,
      });
    }, this.announcerBarAnimationDelay);
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach((link) => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
      this.play();
    } else if (!this.reducedMotion.matches && !this.announcementBarArrowButtonWasClicked) {
      this.play();
    }
  }

  focusInHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
        this.play();
      } else if (this.autoplayButtonIsSetToPlay) {
        this.pause();
      }
    } else if (this.announcementBarSlider.contains(event.target)) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition =
      this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.sliderItemOffset;

    this.setSlidePosition(slideScrollPosition);
    this.applyAnimationToAnnouncementBar();
  }

  setSlideVisibility(event) {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.removeAttribute('tabindex');
          });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.setAttribute('tabindex', '-1');
          });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
    this.wasClicked = false;
  }

  applyAnimationToAnnouncementBar(button = 'next') {
    if (!this.announcementBarSlider) return;

    const itemsCount = this.sliderItems.length;
    const increment = button === 'next' ? 1 : -1;

    const currentIndex = this.currentPage - 1;
    let nextIndex = (currentIndex + increment) % itemsCount;
    nextIndex = nextIndex === -1 ? itemsCount - 1 : nextIndex;

    const nextSlide = this.sliderItems[nextIndex];
    const currentSlide = this.sliderItems[currentIndex];

    const animationClassIn = 'announcement-bar-slider--fade-in';
    const animationClassOut = 'announcement-bar-slider--fade-out';

    const isFirstSlide = currentIndex === 0;
    const isLastSlide = currentIndex === itemsCount - 1;

    const shouldMoveNext = (button === 'next' && !isLastSlide) || (button === 'previous' && isFirstSlide);
    const direction = shouldMoveNext ? 'next' : 'previous';

    currentSlide.classList.add(`${animationClassOut}-${direction}`);
    nextSlide.classList.add(`${animationClassIn}-${direction}`);

    setTimeout(() => {
      currentSlide.classList.remove(`${animationClassOut}-${direction}`);
      nextSlide.classList.remove(`${animationClassIn}-${direction}`);
    }, this.announcerBarAnimationDelay * 2);
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
        (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.checkData()
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateSoldOut();
    this.updateFieldsetText();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateFeaturedMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  checkData() {
    this.parentProduct = this.hasAttribute('data-parent');
    this.optionBase = this.dataset.base.split(',').length;
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media && !this.parentProduct) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    const mediaViewer = mediaGallery?.querySelector('[id^="GalleryViewer"]');

    const dataConnect = this.options.slice(0,this.optionBase).join(' / ');
    const optionSpecificMedia = mediaViewer?.querySelectorAll(`[data-connect="${ dataConnect }"]:not([data-feature="true"])`);

    if(optionSpecificMedia?.length > 0) {
      mediaViewer.querySelectorAll('[data-connect]').forEach((element) => {
        element.classList.remove('product__media-item--variant_current');
      });
      optionSpecificMedia?.forEach((element) => {
        element.classList.add('product__media-item--variant_current');
      });
    } else {
      mediaGallery?.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

      const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
      if (!modalContent) return;
      const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
      modalContent.prepend(newMediaModal);
    }

    mediaViewer?.initPages();
  }

  /*
   * SPECIFIC TO OBERMEYER
  */
  updateFeaturedMedia() {
    if (!this.currentVariant) return;

    const featureImages = document.querySelector('features-images');
    if(!featureImages) return
    const galleryEl = featureImages.querySelector('[id^="GalleryViewer"]');
    const slideshowEl = featureImages.querySelector('[id^="Slider-Gallery-"]');

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    const mediaViewer = mediaGallery.querySelector('[id^="GalleryViewer"]');

    const dataConnect = this.options.slice(0,this.optionBase).join(' / ');
    const featureSpecificMedia = mediaViewer.querySelectorAll(`[data-connect="${dataConnect}"][data-feature="true"]`);

    slideshowEl.innerHTML = '';

    var mediaLoop = new Promise((resolve, reject) => {
      featureSpecificMedia.forEach((element, index, array) => {
        let clonedImage = element.querySelector('.product__media').cloneNode(true);
        let wrapper = document.createElement('li');
        wrapper.classList.add('product__modal-opener--image','slider__slide');
        wrapper.appendChild(clonedImage);
        slideshowEl.appendChild(wrapper);

        if (index === array.length -1) resolve();
      });
    });

    if(featureSpecificMedia.length > 0) {
      mediaLoop.then(() => {
        // galleryEl.initPages();
      });
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateSoldOut() {
    const optionElements = Array.from(this.querySelectorAll('fieldset'));
    if(!optionElements) return;

    this.optionValues = optionElements.map((el) => {
      return el.tagName === 'SELECT' ? el.value : Array.from(el.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
    this.firstOptionValue = this.firstOptionValue || this.optionValues[0];

    for (var i = 1; i < optionElements.length; i++) {
      var optionInputs = optionElements[i].querySelectorAll('input');
      for (var j = 0; j < optionInputs.length; j++) {
        optionInputs[j].classList.add('disabled');
      }
    }

    this.options.forEach((option,index) => {
      var curr_option = option,
          curr_option_index = 'option'+(index+1),
          matching_variants = this.getVariantData().filter(function(element,index) {
            return element[curr_option_index] == curr_option;
          });
      if(index != 0) return;
      matching_variants.forEach((variant) => {
        if(variant.available) {
          variant.options.forEach((optionValue,optionIndex) => {
            optionElements[optionIndex].querySelector(`input[value="${optionValue}"]`).classList.remove('disabled');
          });
        }
      });

      /*
      switch(index) {
        case 0:
          if(!option2Fieldset) return;
            this.variantExistsCheck(option2Inputs,option2);
          if(!option3Fieldset) return;
            this.variantExistsCheck(option3Inputs,option3);
          break;
        case 1:
          if(!option1Fieldset) return;
            this.variantExistsCheck(option1Inputs,option1);
          if(!option3Fieldset) return;
            this.variantExistsCheck(option3Inputs,option3);
          break;
        case 2:
          if(!option1Fieldset) return;
            this.variantExistsCheck(option1Inputs,option1);
          if(!option2Fieldset) return;
            this.variantExistsCheck(option2Inputs,option2);
      }
      */
    });
  }

  updateFieldsetText() {
    const currOptions = this.options;
    const fieldsets = this.querySelectorAll('fieldset');
    fieldsets.forEach((fieldset,index) => {
      const optionValue = fieldset.querySelector('legend span');
      optionValue.innerText = currOptions[index];
    });
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class TooltipOpener extends HTMLElement {
  constructor() {
    super();

    const tooltip = new bootstrap.Tooltip(this)
  }
}

customElements.define('tooltip-component', TooltipOpener);


// WICK SPECIFIC FUNCTIONALITY


function errorMaker(el,errorMessage) {
  let form_error = el.nextElementSibling;
  if(!form_error || !form_error.classList.contains('form_error')) {
    form_error = document.createElement('div');
    form_error.classList.add('form_error');
    el.parentNode.insertBefore(form_error, el.nextSibling);
  }
  form_error.classList.add('error');
  form_error.innerText = errorMessage;
}

function validateEmail(email_entry) {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+")){1,64}@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email_entry);
}

function validateCountry(country_entry) {
  const countryJson = [{"code": "AF", "name": "Afghanistan"},{"code": "AX", "name": "\u00c5land Islands"},{"code": "AL", "name": "Albania"},{"code": "DZ", "name": "Algeria"},{"code": "AS", "name": "American Samoa"},{"code": "AD", "name": "Andorra"},{"code": "AO", "name": "Angola"},{"code": "AI", "name": "Anguilla"},{"code": "AQ", "name": "Antarctica"},{"code": "AG", "name": "Antigua and Barbuda"},{"code": "AR", "name": "Argentina"},{"code": "AM", "name": "Armenia"},{"code": "AW", "name": "Aruba"},{"code": "AU", "name": "Australia"},{"code": "AT", "name": "Austria"},{"code": "AZ", "name": "Azerbaijan"},{"code": "BS", "name": "Bahamas"},{"code": "BH", "name": "Bahrain"},{"code": "BD", "name": "Bangladesh"},{"code": "BB", "name": "Barbados"},{"code": "BY", "name": "Belarus"},{"code": "BE", "name": "Belgium"},{"code": "BZ", "name": "Belize"},{"code": "BJ", "name": "Benin"},{"code": "BM", "name": "Bermuda"},{"code": "BT", "name": "Bhutan"},{"code": "BO", "name": "Bolivia, Plurinational State of"},{"code": "BQ", "name": "Bonaire, Sint Eustatius and Saba"},{"code": "BA", "name": "Bosnia and Herzegovina"},{"code": "BW", "name": "Botswana"},{"code": "BV", "name": "Bouvet Island"},{"code": "BR", "name": "Brazil"},{"code": "IO", "name": "British Indian Ocean Territory"},{"code": "BN", "name": "Brunei Darussalam"},{"code": "BG", "name": "Bulgaria"},{"code": "BF", "name": "Burkina Faso"},{"code": "BI", "name": "Burundi"},{"code": "KH", "name": "Cambodia"},{"code": "CM", "name": "Cameroon"},{"code": "CA", "name": "Canada"},{"code": "CV", "name": "Cape Verde"},{"code": "KY", "name": "Cayman Islands"},{"code": "CF", "name": "Central African Republic"},{"code": "TD", "name": "Chad"},{"code": "CL", "name": "Chile"},{"code": "CN", "name": "China"},{"code": "CX", "name": "Christmas Island"},{"code": "CC", "name": "Cocos (Keeling) Islands"},{"code": "CO", "name": "Colombia"},{"code": "KM", "name": "Comoros"},{"code": "CG", "name": "Congo"},{"code": "CD", "name": "Congo, the Democratic Republic of the"},{"code": "CK", "name": "Cook Islands"},{"code": "CR", "name": "Costa Rica"},{"code": "CI", "name": "C\u00f4te d'Ivoire"},{"code": "HR", "name": "Croatia"},{"code": "CU", "name": "Cuba"},{"code": "CW", "name": "Cura\u00e7ao"},{"code": "CY", "name": "Cyprus"},{"code": "CZ", "name": "Czech Republic"},{"code": "DK", "name": "Denmark"},{"code": "DJ", "name": "Djibouti"},{"code": "DM", "name": "Dominica"},{"code": "DO", "name": "Dominican Republic"},{"code": "EC", "name": "Ecuador"},{"code": "EG", "name": "Egypt"},{"code": "SV", "name": "El Salvador"},{"code": "GQ", "name": "Equatorial Guinea"},{"code": "ER", "name": "Eritrea"},{"code": "EE", "name": "Estonia"},{"code": "ET", "name": "Ethiopia"},{"code": "FK", "name": "Falkland Islands (Malvinas)"},{"code": "FO", "name": "Faroe Islands"},{"code": "FJ", "name": "Fiji"},{"code": "FI", "name": "Finland"},{"code": "FR", "name": "France"},{"code": "GF", "name": "French Guiana"},{"code": "PF", "name": "French Polynesia"},{"code": "TF", "name": "French Southern Territories"},{"code": "GA", "name": "Gabon"},{"code": "GM", "name": "Gambia"},{"code": "GE", "name": "Georgia"},{"code": "DE", "name": "Germany"},{"code": "GH", "name": "Ghana"},{"code": "GI", "name": "Gibraltar"},{"code": "GR", "name": "Greece"},{"code": "GL", "name": "Greenland"},{"code": "GD", "name": "Grenada"},{"code": "GP", "name": "Guadeloupe"},{"code": "GU", "name": "Guam"},{"code": "GT", "name": "Guatemala"},{"code": "GG", "name": "Guernsey"},{"code": "GN", "name": "Guinea"},{"code": "GW", "name": "Guinea-Bissau"},{"code": "GY", "name": "Guyana"},{"code": "HT", "name": "Haiti"},{"code": "HM", "name": "Heard Island and McDonald Islands"},{"code": "VA", "name": "Holy See (Vatican City State)"},{"code": "HN", "name": "Honduras"},{"code": "HK", "name": "Hong Kong"},{"code": "HU", "name": "Hungary"},{"code": "IS", "name": "Iceland"},{"code": "IN", "name": "India"},{"code": "ID", "name": "Indonesia"},{"code": "IR", "name": "Iran, Islamic Republic of"},{"code": "IQ", "name": "Iraq"},{"code": "IE", "name": "Ireland"},{"code": "IM", "name": "Isle of Man"},{"code": "IL", "name": "Israel"},{"code": "IT", "name": "Italy"},{"code": "JM", "name": "Jamaica"},{"code": "JP", "name": "Japan"},{"code": "JE", "name": "Jersey"},{"code": "JO", "name": "Jordan"},{"code": "KZ", "name": "Kazakhstan"},{"code": "KE", "name": "Kenya"},{"code": "KI", "name": "Kiribati"},{"code": "KP", "name": "Korea, Democratic People's Republic of"},{"code": "KR", "name": "Korea, Republic of"},{"code": "KW", "name": "Kuwait"},{"code": "KG", "name": "Kyrgyzstan"},{"code": "LA", "name": "Lao People's Democratic Republic"},{"code": "LV", "name": "Latvia"},{"code": "LB", "name": "Lebanon"},{"code": "LS", "name": "Lesotho"},{"code": "LR", "name": "Liberia"},{"code": "LY", "name": "Libya"},{"code": "LI", "name": "Liechtenstein"},{"code": "LT", "name": "Lithuania"},{"code": "LU", "name": "Luxembourg"},{"code": "MO", "name": "Macao"},{"code": "MK", "name": "Macedonia, the Former Yugoslav Republic of"},{"code": "MG", "name": "Madagascar"},{"code": "MW", "name": "Malawi"},{"code": "MY", "name": "Malaysia"},{"code": "MV", "name": "Maldives"},{"code": "ML", "name": "Mali"},{"code": "MT", "name": "Malta"},{"code": "MH", "name": "Marshall Islands"},{"code": "MQ", "name": "Martinique"},{"code": "MR", "name": "Mauritania"},{"code": "MU", "name": "Mauritius"},{"code": "YT", "name": "Mayotte"},{"code": "MX", "name": "Mexico"},{"code": "FM", "name": "Micronesia, Federated States of"},{"code": "MD", "name": "Moldova, Republic of"},{"code": "MC", "name": "Monaco"},{"code": "MN", "name": "Mongolia"},{"code": "ME", "name": "Montenegro"},{"code": "MS", "name": "Montserrat"},{"code": "MA", "name": "Morocco"},{"code": "MZ", "name": "Mozambique"},{"code": "MM", "name": "Myanmar"},{"code": "NA", "name": "Namibia"},{"code": "NR", "name": "Nauru"},{"code": "NP", "name": "Nepal"},{"code": "NL", "name": "Netherlands"},{"code": "NC", "name": "New Caledonia"},{"code": "NZ", "name": "New Zealand"},{"code": "NI", "name": "Nicaragua"},{"code": "NE", "name": "Niger"},{"code": "NG", "name": "Nigeria"},{"code": "NU", "name": "Niue"},{"code": "NF", "name": "Norfolk Island"},{"code": "MP", "name": "Northern Mariana Islands"},{"code": "NO", "name": "Norway"},{"code": "OM", "name": "Oman"},{"code": "PK", "name": "Pakistan"},{"code": "PW", "name": "Palau"},{"code": "PS", "name": "Palestine, State of"},{"code": "PA", "name": "Panama"},{"code": "PG", "name": "Papua New Guinea"},{"code": "PY", "name": "Paraguay"},{"code": "PE", "name": "Peru"},{"code": "PH", "name": "Philippines"},{"code": "PN", "name": "Pitcairn"},{"code": "PL", "name": "Poland"},{"code": "PT", "name": "Portugal"},{"code": "PR", "name": "Puerto Rico"},{"code": "QA", "name": "Qatar"},{"code": "RE", "name": "R\u00e9union"},{"code": "RO", "name": "Romania"},{"code": "RU", "name": "Russian Federation"},{"code": "RW", "name": "Rwanda"},{"code": "BL", "name": "Saint Barth\u00e9lemy"},{"code": "SH", "name": "Saint Helena, Ascension and Tristan da Cunha"},{"code": "KN", "name": "Saint Kitts and Nevis"},{"code": "LC", "name": "Saint Lucia"},{"code": "MF", "name": "Saint Martin (French part)"},{"code": "PM", "name": "Saint Pierre and Miquelon"},{"code": "VC", "name": "Saint Vincent and the Grenadines"},{"code": "WS", "name": "Samoa"},{"code": "SM", "name": "San Marino"},{"code": "ST", "name": "Sao Tome and Principe"},{"code": "SA", "name": "Saudi Arabia"},{"code": "SN", "name": "Senegal"},{"code": "RS", "name": "Serbia"},{"code": "SC", "name": "Seychelles"},{"code": "SL", "name": "Sierra Leone"},{"code": "SG", "name": "Singapore"},{"code": "SX", "name": "Sint Maarten (Dutch part)"},{"code": "SK", "name": "Slovakia"},{"code": "SI", "name": "Slovenia"},{"code": "SB", "name": "Solomon Islands"},{"code": "SO", "name": "Somalia"},{"code": "ZA", "name": "South Africa"},{"code": "GS", "name": "South Georgia and the South Sandwich Islands"},{"code": "SS", "name": "South Sudan"},{"code": "ES", "name": "Spain"},{"code": "LK", "name": "Sri Lanka"},{"code": "SD", "name": "Sudan"},{"code": "SR", "name": "Suriname"},{"code": "SJ", "name": "Svalbard and Jan Mayen"},{"code": "SZ", "name": "Swaziland"},{"code": "SE", "name": "Sweden"},{"code": "CH", "name": "Switzerland"},{"code": "SY", "name": "Syrian Arab Republic"},{"code": "TW", "name": "Taiwan, Province of China"},{"code": "TJ", "name": "Tajikistan"},{"code": "TZ", "name": "Tanzania, United Republic of"},{"code": "TH", "name": "Thailand"},{"code": "TL", "name": "Timor-Leste"},{"code": "TG", "name": "Togo"},{"code": "TK", "name": "Tokelau"},{"code": "TO", "name": "Tonga"},{"code": "TT", "name": "Trinidad and Tobago"},{"code": "TN", "name": "Tunisia"},{"code": "TR", "name": "Turkey"},{"code": "TM", "name": "Turkmenistan"},{"code": "TC", "name": "Turks and Caicos Islands"},{"code": "TV", "name": "Tuvalu"},{"code": "UG", "name": "Uganda"},{"code": "UA", "name": "Ukraine"},{"code": "AE", "name": "United Arab Emirates"},{"code": "GB", "name": "United Kingdom"},{"code": "US", "name": "United States"},{"code": "UM", "name": "United States Minor Outlying Islands"},{"code": "UY", "name": "Uruguay"},{"code": "UZ", "name": "Uzbekistan"},{"code": "VU", "name": "Vanuatu"},{"code": "VE", "name": "Venezuela, Bolivarian Republic of"},{"code": "VN", "name": "Viet Nam"},{"code": "VG", "name": "Virgin Islands, British"},{"code": "VI", "name": "Virgin Islands, U.S."},{"code": "WF", "name": "Wallis and Futuna"},{"code": "EH", "name": "Western Sahara"},{"code": "YE", "name": "Yemen"},{"code": "ZM", "name": "Zambia"},{"code": "ZW", "name": "Zimbabwe"}]
  return countryJson.find(country => country.code === country_entry || country.name === country_entry );
}

function validateVisibleInputs(form) {
  var inputs = form.querySelectorAll('input');

  for (var i = 0; i < inputs.length; i++) {

    if (inputs[i].offsetParent === null) {
      continue;
    }

    if (inputs[i].classList.contains('required')) {

      if (!inputs[i].value) {
        inputs[i].classList.add('input_error');
        throw new Error('Required input is empty');
      }

      if (inputs[i].type == 'email' && !validateEmail(inputs[i].value)) {
        inputs[i].classList.add('input_error');
        throw new Error('The email is invalid');
      }

      if (inputs[i].type == 'text' && inputs[i].getAttribute('autocomplete') == 'country-name' && !validateCountry(inputs[i].value)) {
        inputs[i].classList.add('input_error');
        throw new Error('Valid country name required');
      }

    }
  }

  return true;
} 

function serializeJSON(form,invisible = true) {
  const formData = new FormData(form);
  const pairs = {}
  const consistent = {};
  if(invisible) {
    for (const [name, value] of formData) {
      if(value === null || value === '' || JSON.stringify(value) === '{}') {
        continue
      } else if (name == 'form_type' || name == 'utf8') {
        consistent[name] = value;
      } else {
        pairs[name] = value;
      }
    }
  } else {
    const visibleInputs = Array.from(form.elements).filter(e => e.style.display !== 'none');
    for (var i = 0; i < visibleInputs.length; i++) {
      if(visibleInputs[i].value === null || visibleInputs[i].value === '' || JSON.stringify(visibleInputs[i].value) === '{}') {
        continue
      } else if (visibleInputs[i].name == 'form_type' || visibleInputs[i].name == 'utf8') {
        consistent[visibleInputs[i].name] = visibleInputs[i].value;
      } else {
        pairs[visibleInputs[i].name] = visibleInputs[i].value;
      }
    }
  }
  return JSON.stringify({ consistent, data: pairs }, null, 2);
}

class FormBuilder extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.thanks = this.querySelector('#thanks');
    this.form_submit = this.form.querySelector('#custom-form-submit');

    if(!this.form) return;

    this.form.addEventListener('submit', this.formSubmit.bind(this));
    this.form.querySelectorAll('.field__input-file').forEach(
      (input) => input.addEventListener('change', this.onFileInput.bind(this))
    );
  }

  onFileInput(event) {
    const input = event.target;
    const file_link = input.nextElementSibling;
    if( input.files ) {
      this.form_submit.classList.add('button--loading');
      this.form_submit.disabled = true;

      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document', this.form_submit.dataset.source);

      var res = Array.from(formData.entries(), ([key, prop]) => (
        {[key]: {
          "ContentLength":
          typeof prop === "string"
          ? prop.length
          : prop.size
        }
        }
      ));

      if (file.size > 5000000) {
        alert('File size too large, please reduce file size and resubmit');
        input.value = '';
      } else {

        formData.append('service', input.dataset.service);

        if (!input.dataset.connection) {
          alert('Upload not Created');
          return;
        }

        fetch(input.dataset.connection, {
          method: 'POST',
          body: formData
        })
        .then(response => response.text())
        .then(data => {
          file_link.value = data;
          this.form_submit.classList.remove('button--loading');
          document.getElementById('custom-form-submit').disabled = false;
        })
        .catch((error) => {
          this.form_submit.classList.remove('button--loading');
          document.getElementById('custom-form-submit').disabled = false;
        });

      }
    }
  }

  formSubmit(event) {
    event.preventDefault();
    this.form_submit.classList.add('animate');
    let redirect_url;
    if(this.hasAttribute('data-redirect')) {
      redirect_url = this.dataset.redirect;
    }
    fetch(this.dataset.send, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serializeJSON(this.form)
    })
    .then(response => response.json())
    .then(data => {
      var form_error = document.getElementById('form_error');
      if(!form_error) {
        form_error = document.createElement('div');
        form_error.id = 'form_error';
        this.form_submit.parentNode.insertBefore(form_error, this.form_submit.nextSibling);
      }
      this.form_submit.classList.remove('animate');
      this.form_submit.classList.add('success');
      setTimeout(function(){
        this.form.classList.add('hidden');
        this.thanks.classList.remove('hidden');
        this.thanks.scrollIntoView();
        if(data.success) {
          if(redirect_url) {
            setTimeout(function(){
              window.location.href = redirect_url;
            },500);
          }
        } else {
          form_error.innerText = data.reason;
        }
      }.bind(this),500);
    })
    .catch((error) => {
      console.error('Error:', error);
      this.form_submit.classList.remove('animate');
      this.form_submit.classList.add('error');
    });
  }
}

customElements.define('form-builder', FormBuilder)

class ApplyProcode extends HTMLElement {
  constructor() {
    super();
    this.procodeForm = document.getElementById('pro-code--form');
    this.container = document.getElementById('procode');
    this.thanks = document.getElementById('pro-code--thanks');

    this.procodeForm.addEventListener('submit', this.procodeCheck.bind(this));
  }

  procodeCheck(event) {
    event.preventDefault();
    const form = event.target;
    const form_submit = form.querySelector('button');
    let redirect_url;
    if(this.hasAttribute('data-redirect')) {
      redirect_url = this.dataset.redirect;
    }
    form_submit.disabled = true;
    form_submit.classList.add('button--loading');
    fetch(this.procodeForm.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serializeJSON(form)
    })
    .then(response => response.json())
    .then(data => {
      form_submit.disabled = false;
      form_submit.classList.remove('button--loading');
      var form_error = document.getElementById('form_error');
      if(!form_error) {
        form_error = document.createElement('div');
        form_error.id = 'form_error';
        form_submit.parentNode.insertBefore(form_error, form_submit.nextSibling);
      }
      if(data.success) {
        this.form.classList.add('hidden');
        this.thanks.classList.remove('hidden');
        this.thanks.scrollIntoView();
        if(redirect_url) {
          setTimeout(function(){
            window.location.href = redirect_url;
          },500);
        }
      } else {
        form_error.innerText = data.reason;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}

customElements.define('apply-procode', ApplyProcode)

String.prototype.imgURL = function(size) {
  return this
    .replace(/\.jpg|\.png|\.gif|\.jpeg/g, function(match) {
      return '_'+size+match;
    })
  ;
};

class FeaturesImages extends HTMLElement {
  constructor() {
    super();

    this.selector = document.querySelector(`variant-selects[data-product="${this.dataset.product}"]`);
    if(!this.selector) {
      this.selector = document.querySelector(`variant-radios[data-product="${this.dataset.product}"]`);
      const fieldsets = Array.from(this.selector.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
    } else {
      this.options = Array.from(this.selector.querySelectorAll('select'), (select) => select.value);
    }

    this.parentProduct = this.selector.hasAttribute('data-parent');
    this.galleryEl = this.querySelector('[id^="GalleryViewer"]');
    this.slideshowEl = this.querySelector('[id^="Slider-Gallery-"]');
    this.optionBase = this.selector.dataset.base.split(',').length;

    const mediaGallery = document.getElementById(`MediaGallery-${this.selector.dataset.section}`);
    const mediaViewer = mediaGallery.querySelector('[id^="GalleryViewer"]');

    const dataConnect = this.options.slice(0,this.optionBase).join(' / ');
    const featureSpecificMedia = mediaViewer.querySelectorAll(`[data-connect="${ dataConnect }"][data-feature="true"]`);

    var mediaLoop = new Promise((resolve, reject) => {
      featureSpecificMedia.forEach((element, index, array) => {
        let clonedImage = element.querySelector('.product__media').cloneNode(true);
        let wrapper = document.createElement('li');
        wrapper.classList.add('product__modal-opener--image','slider__slide');
        wrapper.appendChild(clonedImage);
        this.slideshowEl.appendChild(wrapper);

        if (index === array.length -1) resolve();
      });
    });

    if(featureSpecificMedia.length > 0) {
      mediaLoop.then(() => {
        this.galleryEl.initPages();
      });
    }
  }
}
customElements.define('features-images', FeaturesImages);

class ShopTheLookForm extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select[name^="options"]'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    const featuredImage = this.currentVariant.featured_image;
    if(!featuredImage) return;
    const variantImage = this.closest('.row').querySelector('.media img');
    let featuredImageSrc = featuredImage.src;
    variantImage.removeAttribute('srcset');
    variantImage.src = featuredImageSrc.imgURL('750x');
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#ProductFormShopTheLook-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const idSwitcher = this.querySelector('select[name="product-change"]');
    const productUrl = idSwitcher ? idSwitcher.options[idSwitcher.selectedIndex].dataset.url : this.dataset.url
    fetch(`${productUrl}?variant=${this.currentVariant.id}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        this.productElement = html.querySelector('section[id^="MainProduct-"]');
        this.sectionId = this.productElement.dataset.section;
        const destination = document.getElementById(`price-${this.sectionId}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`ProductFormShopTheLook-${this.dataset.productid}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`ProductFormShopTheLook-${this.dataset.productid}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.productid}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    const idSwitcher = this.querySelector('select[name="product-change"]');
    const currentProductId = idSwitcher ? idSwitcher.options[idSwitcher.selectedIndex].dataset.product : this.dataset.productid;
    const variantJSON = this.closest('.shop-the-look__popup-content').querySelector(`[type="application/json"][data-productId="${currentProductId}"]`);
    this.variantData = JSON.parse(variantJSON.textContent);
    return this.variantData;
  }
}
customElements.define('shop-form', ShopTheLookForm);


class CollectionSlider extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.grid--collection_slider');
    this.sliderItems = this.querySelectorAll('.grid__item_collection');

    if (!this.slider || this.sliderItems.length < 2) return;

    new Glider(this.slider,{
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: {
        prev: '.glider-prev',
        next: '.glider-next'
      }
    });
  }
}

customElements.define('collection-slider', CollectionSlider);

class CardSwitcher extends HTMLAnchorElement {
  constructor() {
    super();

    this.addEventListener('click', this.colorSwitch);
  }

  colorSwitch(e) {
    e = window.event || e;
    let target = e.target;
    let mainImg = this.querySelector('.card-mainimg');
    let hoverImg = this.querySelector('.card-hoverimg');
    if(target.classList.contains('card-variant')) {
      e.preventDefault();
      let id = target.dataset.id;
      let href = this.href;
      let hrefSplit = href.split('?');
      let combinator = '';
      let elems = this.querySelectorAll('.card-information__variant-image');
      [].forEach.call(elems, function(el) {
        el.classList.remove('current');
      });
      target.closest('.card-information__variant-image').classList.add('current');
      if(hrefSplit[1] !== undefined) {
        combinator = '&' + hrefSplit[1];
      }
      let newHref = hrefSplit[0] +'?variant='+ id + combinator;
      this.setAttribute('href', newHref);
      let ogSrc = this.src;
      let targetSrc = target.dataset.featured;
      if(ogSrc != targetSrc) {
        let targetSrcset = target.dataset.featuredsrcset;
        let targetAlt = target.getAttribute('alt');
        mainImg.setAttribute('src', targetSrc);
        mainImg.setAttribute('srcset', targetSrcset);
        mainImg.setAttribute('alt', targetAlt);
        let targetHoverSrc = target.dataset.hover;
        if (targetHoverSrc !== '') {
          let targetHoverSrcset = target.dataset.hoversrcset;
          hoverImg.setAttribute('src', targetHoverSrc);
          hoverImg.setAttribute('srcset', targetHoverSrcset);
        }
      }
    }
  }
}

customElements.define('card-switcher', CardSwitcher, {extends: 'a'});

/*!
 * Jarallax v2.0.4 (https://github.com/nk-o/jarallax)
 * Copyright 2022 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).jarallax=t()}(this,(function(){"use strict";function e(e){"complete"===document.readyState||"interactive"===document.readyState?e():document.addEventListener("DOMContentLoaded",e,{capture:!0,once:!0,passive:!0})}let t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var i=t;const{navigator:o}=i,n=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(o.userAgent);let a,s;function l(){n?(!a&&document.body&&(a=document.createElement("div"),a.style.cssText="position: fixed; top: -9999px; left: 0; height: 100vh; width: 0;",document.body.appendChild(a)),s=(a?a.clientHeight:0)||i.innerHeight||document.documentElement.clientHeight):s=i.innerHeight||document.documentElement.clientHeight}l(),i.addEventListener("resize",l),i.addEventListener("orientationchange",l),i.addEventListener("load",l),e((()=>{l()}));const r=[];function m(){r.length&&(r.forEach(((e,t)=>{const{instance:o,oldData:n}=e,a=o.$item.getBoundingClientRect(),l={width:a.width,height:a.height,top:a.top,bottom:a.bottom,wndW:i.innerWidth,wndH:s},m=!n||n.wndW!==l.wndW||n.wndH!==l.wndH||n.width!==l.width||n.height!==l.height,c=m||!n||n.top!==l.top||n.bottom!==l.bottom;r[t].oldData=l,m&&o.onResize(),c&&o.onScroll()})),i.requestAnimationFrame(m))}let c=0;class p{constructor(e,t){const i=this;i.instanceID=c,c+=1,i.$item=e,i.defaults={type:"scroll",speed:.5,imgSrc:null,imgElement:".jarallax-img",imgSize:"cover",imgPosition:"50% 50%",imgRepeat:"no-repeat",keepImg:!1,elementInViewport:null,zIndex:-100,disableParallax:!1,disableVideo:!1,videoSrc:null,videoStartTime:0,videoEndTime:0,videoVolume:0,videoLoop:!0,videoPlayOnlyVisible:!0,videoLazyLoading:!0,onScroll:null,onInit:null,onDestroy:null,onCoverImage:null};const n=i.$item.dataset||{},a={};if(Object.keys(n).forEach((e=>{const t=e.substr(0,1).toLowerCase()+e.substr(1);t&&void 0!==i.defaults[t]&&(a[t]=n[e])})),i.options=i.extend({},i.defaults,a,t),i.pureOptions=i.extend({},i.options),Object.keys(i.options).forEach((e=>{"true"===i.options[e]?i.options[e]=!0:"false"===i.options[e]&&(i.options[e]=!1)})),i.options.speed=Math.min(2,Math.max(-1,parseFloat(i.options.speed))),"string"==typeof i.options.disableParallax&&(i.options.disableParallax=new RegExp(i.options.disableParallax)),i.options.disableParallax instanceof RegExp){const e=i.options.disableParallax;i.options.disableParallax=()=>e.test(o.userAgent)}if("function"!=typeof i.options.disableParallax&&(i.options.disableParallax=()=>!1),"string"==typeof i.options.disableVideo&&(i.options.disableVideo=new RegExp(i.options.disableVideo)),i.options.disableVideo instanceof RegExp){const e=i.options.disableVideo;i.options.disableVideo=()=>e.test(o.userAgent)}"function"!=typeof i.options.disableVideo&&(i.options.disableVideo=()=>!1);let s=i.options.elementInViewport;s&&"object"==typeof s&&void 0!==s.length&&([s]=s),s instanceof Element||(s=null),i.options.elementInViewport=s,i.image={src:i.options.imgSrc||null,$container:null,useImgTag:!1,position:"fixed"},i.initImg()&&i.canInitParallax()&&i.init()}css(e,t){return"string"==typeof t?i.getComputedStyle(e).getPropertyValue(t):(Object.keys(t).forEach((i=>{e.style[i]=t[i]})),e)}extend(e,...t){return e=e||{},Object.keys(t).forEach((i=>{t[i]&&Object.keys(t[i]).forEach((o=>{e[o]=t[i][o]}))})),e}getWindowData(){return{width:i.innerWidth||document.documentElement.clientWidth,height:s,y:document.documentElement.scrollTop}}initImg(){const e=this;let t=e.options.imgElement;return t&&"string"==typeof t&&(t=e.$item.querySelector(t)),t instanceof Element||(e.options.imgSrc?(t=new Image,t.src=e.options.imgSrc):t=null),t&&(e.options.keepImg?e.image.$item=t.cloneNode(!0):(e.image.$item=t,e.image.$itemParent=t.parentNode),e.image.useImgTag=!0),!!e.image.$item||(null===e.image.src&&(e.image.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",e.image.bgImage=e.css(e.$item,"background-image")),!(!e.image.bgImage||"none"===e.image.bgImage))}canInitParallax(){return!this.options.disableParallax()}init(){const e=this,t={position:"absolute",top:0,left:0,width:"100%",height:"100%",overflow:"hidden"};let o={pointerEvents:"none",transformStyle:"preserve-3d",backfaceVisibility:"hidden"};if(!e.options.keepImg){const t=e.$item.getAttribute("style");if(t&&e.$item.setAttribute("data-jarallax-original-styles",t),e.image.useImgTag){const t=e.image.$item.getAttribute("style");t&&e.image.$item.setAttribute("data-jarallax-original-styles",t)}}if("static"===e.css(e.$item,"position")&&e.css(e.$item,{position:"relative"}),"auto"===e.css(e.$item,"z-index")&&e.css(e.$item,{zIndex:0}),e.image.$container=document.createElement("div"),e.css(e.image.$container,t),e.css(e.image.$container,{"z-index":e.options.zIndex}),"fixed"===this.image.position&&e.css(e.image.$container,{"-webkit-clip-path":"polygon(0 0, 100% 0, 100% 100%, 0 100%)","clip-path":"polygon(0 0, 100% 0, 100% 100%, 0 100%)"}),e.image.$container.setAttribute("id",`jarallax-container-${e.instanceID}`),e.$item.appendChild(e.image.$container),e.image.useImgTag?o=e.extend({"object-fit":e.options.imgSize,"object-position":e.options.imgPosition,"max-width":"none"},t,o):(e.image.$item=document.createElement("div"),e.image.src&&(o=e.extend({"background-position":e.options.imgPosition,"background-size":e.options.imgSize,"background-repeat":e.options.imgRepeat,"background-image":e.image.bgImage||`url("${e.image.src}")`},t,o))),"opacity"!==e.options.type&&"scale"!==e.options.type&&"scale-opacity"!==e.options.type&&1!==e.options.speed||(e.image.position="absolute"),"fixed"===e.image.position){const t=function(e){const t=[];for(;null!==e.parentElement;)1===(e=e.parentElement).nodeType&&t.push(e);return t}(e.$item).filter((e=>{const t=i.getComputedStyle(e),o=t["-webkit-transform"]||t["-moz-transform"]||t.transform;return o&&"none"!==o||/(auto|scroll)/.test(t.overflow+t["overflow-y"]+t["overflow-x"])}));e.image.position=t.length?"absolute":"fixed"}o.position=e.image.position,e.css(e.image.$item,o),e.image.$container.appendChild(e.image.$item),e.onResize(),e.onScroll(!0),e.options.onInit&&e.options.onInit.call(e),"none"!==e.css(e.$item,"background-image")&&e.css(e.$item,{"background-image":"none"}),e.addToParallaxList()}addToParallaxList(){r.push({instance:this}),1===r.length&&i.requestAnimationFrame(m)}removeFromParallaxList(){const e=this;r.forEach(((t,i)=>{t.instance.instanceID===e.instanceID&&r.splice(i,1)}))}destroy(){const e=this;e.removeFromParallaxList();const t=e.$item.getAttribute("data-jarallax-original-styles");if(e.$item.removeAttribute("data-jarallax-original-styles"),t?e.$item.setAttribute("style",t):e.$item.removeAttribute("style"),e.image.useImgTag){const i=e.image.$item.getAttribute("data-jarallax-original-styles");e.image.$item.removeAttribute("data-jarallax-original-styles"),i?e.image.$item.setAttribute("style",t):e.image.$item.removeAttribute("style"),e.image.$itemParent&&e.image.$itemParent.appendChild(e.image.$item)}e.image.$container&&e.image.$container.parentNode.removeChild(e.image.$container),e.options.onDestroy&&e.options.onDestroy.call(e),delete e.$item.jarallax}clipContainer(){}coverImage(){const e=this,t=e.image.$container.getBoundingClientRect(),i=t.height,{speed:o}=e.options,n="scroll"===e.options.type||"scroll-opacity"===e.options.type;let a=0,l=i,r=0;return n&&(0>o?(a=o*Math.max(i,s),s<i&&(a-=o*(i-s))):a=o*(i+s),1<o?l=Math.abs(a-s):0>o?l=a/o+Math.abs(a):l+=(s-i)*(1-o),a/=2),e.parallaxScrollDistance=a,r=n?(s-l)/2:(i-l)/2,e.css(e.image.$item,{height:`${l}px`,marginTop:`${r}px`,left:"fixed"===e.image.position?`${t.left}px`:"0",width:`${t.width}px`}),e.options.onCoverImage&&e.options.onCoverImage.call(e),{image:{height:l,marginTop:r},container:t}}isVisible(){return this.isElementInViewport||!1}onScroll(e){const t=this,o=t.$item.getBoundingClientRect(),n=o.top,a=o.height,l={};let r=o;if(t.options.elementInViewport&&(r=t.options.elementInViewport.getBoundingClientRect()),t.isElementInViewport=0<=r.bottom&&0<=r.right&&r.top<=s&&r.left<=i.innerWidth,!e&&!t.isElementInViewport)return;const m=Math.max(0,n),c=Math.max(0,a+n),p=Math.max(0,-n),d=Math.max(0,n+a-s),g=Math.max(0,a-(n+a-s)),u=Math.max(0,-n+s-a),f=1-(s-n)/(s+a)*2;let h=1;if(a<s?h=1-(p||d)/a:c<=s?h=c/s:g<=s&&(h=g/s),"opacity"!==t.options.type&&"scale-opacity"!==t.options.type&&"scroll-opacity"!==t.options.type||(l.transform="translate3d(0,0,0)",l.opacity=h),"scale"===t.options.type||"scale-opacity"===t.options.type){let e=1;0>t.options.speed?e-=t.options.speed*h:e+=t.options.speed*(1-h),l.transform=`scale(${e}) translate3d(0,0,0)`}if("scroll"===t.options.type||"scroll-opacity"===t.options.type){let e=t.parallaxScrollDistance*f;"absolute"===t.image.position&&(e-=n),l.transform=`translate3d(0,${e}px,0)`}t.css(t.image.$item,l),t.options.onScroll&&t.options.onScroll.call(t,{section:o,beforeTop:m,beforeTopEnd:c,afterTop:p,beforeBottom:d,beforeBottomEnd:g,afterBottom:u,visiblePercent:h,fromViewportCenter:f})}onResize(){this.coverImage()}}const d=function(e,t,...i){("object"==typeof HTMLElement?e instanceof HTMLElement:e&&"object"==typeof e&&null!==e&&1===e.nodeType&&"string"==typeof e.nodeName)&&(e=[e]);const o=e.length;let n,a=0;for(;a<o;a+=1)if("object"==typeof t||void 0===t?e[a].jarallax||(e[a].jarallax=new p(e[a],t)):e[a].jarallax&&(n=e[a].jarallax[t].apply(e[a].jarallax,i)),void 0!==n)return n;return e};d.constructor=p;const g=i.jQuery;if(void 0!==g){const e=function(...e){Array.prototype.unshift.call(e,this);const t=d.apply(i,e);return"object"!=typeof t?t:this};e.constructor=d.constructor;const t=g.fn.jarallax;g.fn.jarallax=e,g.fn.jarallax.noConflict=function(){return g.fn.jarallax=t,this}}return e((()=>{d(document.querySelectorAll("[data-jarallax]"))})),d}));
//# sourceMappingURL=jarallax.min.js.map

jarallax(document.querySelectorAll('.jarallax'), {
  speed: 0.2,
});

  document.querySelectorAll('.product-colors-wrap .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', function(e) {
      e.preventDefault();
      
      e.target.closest('.product-colors-wrap').querySelectorAll('.color-swatch').forEach(swatchImg =>{
        swatchImg.classList.remove('active');
      });
      swatch.classList.add('active');

      e.target.closest('.card-wrapper').querySelector('.card-mainimg').style.display = 'none';
      e.target.closest('.card-wrapper').querySelectorAll('.grid-product__color-image').forEach(swatchBGImg => {
        swatchBGImg.classList.remove('is-active');
      });
      
      var id = swatch.dataset.variantId;
      var image = swatch.dataset.variantImage;
      var variant_url = swatch.href;
      var price_original = swatch.dataset.price;
      var price_sale_on = swatch.dataset.compareprice;
      var img_Element = "<a href="+variant_url+"><img src="+image+" loading='lazy' width='400' height='400'/></a>";
      var el = document.querySelector('.grid-product__color-image--' + id);
      var parentCard = swatch.closest('.card-wrapper')
      var lifestyleurl = e.target.closest('.card-wrapper').querySelector('.life-style-content');
      //el.style.backgroundImage = 'url(' + image + ')';
      el.innerHTML = img_Element;
      el.classList.add('is-active');
      if(price_sale_on){
        parentCard.querySelector('.price-item--sale.price-item--last').innerHTML = price_original;
        parentCard.querySelector('.price__sale .price-item.price-item--regular').innerHTML = price_sale_on;
        if (!parentCard.querySelector('.price').classList.contains('price--on-sale')) {
            parentCard.querySelector('.price').classList.add('price--on-sale');
        }
    }
    else{
        if (parentCard.querySelector('.price').classList.contains('price--on-sale')) {
            parentCard.querySelector('.price').classList.remove('price--on-sale')
        }
        parentCard.querySelector('.price-item.price-item--regular').innerHTML = price_original;
    }
      if(lifestyleurl){
        lifestyleurl.querySelector('a').href = variant_url
      }
    });
  });
  document.querySelectorAll('.grid-product__colors').forEach(grid =>{grid.firstElementChild.click()});
  document.querySelectorAll('.grid-product__colors .flickity-slider').forEach(grid =>{grid.firstElementChild.click()});

    let video_status_btns = document.querySelectorAll('.desktop-pause-btn, .mobile-pause-btn');

    video_status_btns.forEach(btn => {
        btn.addEventListener('click', function() {
            let video = btn.previousElementSibling;
            if (!video.paused) {
                video.pause();
                btn.innerHTML = `
  <svg class="video-play-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 210 210" xml:space="preserve">
      <path d="M179.07,105L30.93,210V0L179.07,105z"/>
  </svg>`;
            } else {
                video.play();
                btn.innerHTML =`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 48">
                  <g data-name="Group 3482" transform="translate(6625 19047.896)" opacity="0.275">
                    <rect  data-name="Rectangle 2591" width="13" height="48" transform="translate(-6625 -19047.896)" fill="#fff"/>
                    <rect  data-name="Rectangle 2592" width="13" height="48" transform="translate(-6603 -19047.896)" fill="#fff"/>
                  </g>
                </svg>`;
            }
        });
    });

    function checkChildrenLength() {
      let flickityAllSlider = document.querySelectorAll('.flickity-enabled .flickity-page-dots');
      flickityAllSlider.forEach(dot => {
          if (dot) {
              let childrenLength = dot.children.length;
              if (childrenLength > 1) {
                  dot.style.opacity = 1;
              } else {
                  dot.style.opacity = 0;
              }
          }
      });
  }

  window.onload = function() {
    checkChildrenLength();
};
    window.addEventListener('resize', function() {
      checkChildrenLength();
  });