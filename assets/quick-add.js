if (!customElements.get('quick-add-modal')) {
  customElements.define('quick-add-modal', class QuickAddModal extends ModalDialog {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
    }

    hide(preventFocus = false) {
      const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (cartNotification) cartNotification.setActiveElement(this.openedBy);
      this.modalContent.innerHTML = '';

      if (preventFocus) this.openedBy = null;
      super.hide();
    }

    show(opener) {
      opener.setAttribute('aria-disabled', true);
      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          const icon_with_text = responseHTML.querySelector('.sp-container');
          const tab_content = responseHTML.querySelector('.tab-container');
          if(icon_with_text){
            icon_with_text.remove()
          }
          if(tab_content){
            tab_content.remove()
          }
          this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          this.preventDuplicatedIDs();
          this.removeDOMElements();
          this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }

          if (window.ProductModel) window.ProductModel.loadShopifyXR();

          this.removeGalleryListSemantic();
          this.preventVariantURLSwitching();
          this.oldjscode()
          super.show(opener);
        })
        .finally(() => {
          opener.removeAttribute('aria-disabled');
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    setInnerHTML(element, html) {
      element.innerHTML = html;

      // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      element.querySelectorAll('script').forEach(oldScriptTag => {
        const newScriptTag = document.createElement('script');
        Array.from(oldScriptTag.attributes).forEach(attribute => {
          newScriptTag.setAttribute(attribute.name, attribute.value)
        });
        newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
        oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      });
    }

    preventVariantURLSwitching() {
      this.modalContent.querySelector('variant-radios,variant-selects').setAttribute('data-update-url', 'false');
    }

    removeDOMElements() {
      const pickupAvailability = this.productElement.querySelector('pickup-availability');
      if (pickupAvailability) pickupAvailability.remove();

      const productModal = this.productElement.querySelector('product-modal');
      if (productModal) productModal.remove();
    }

    preventDuplicatedIDs() {
      const sectionId = this.productElement.dataset.section;
      this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${ sectionId }`);
      this.productElement.querySelectorAll('variant-selects, variant-radios').forEach((variantSelect) => {
        variantSelect.dataset.originalSection = sectionId;
      });
    }

    removeGalleryListSemantic() {
      const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
      if (!galleryList) return;

      galleryList.setAttribute('role', 'presentation');
      galleryList.querySelectorAll('[id^="Slide-"]').forEach(li => li.setAttribute('role', 'presentation'));
    }
    oldjscode(){
      function arrowToShow(){
        let lengthOfSlide = document.querySelector('.carousel-nav .flickity-slider').childElementCount;
        if (lengthOfSlide <= 6) {
            document.querySelectorAll('.carousel-nav .flickity-button').forEach(btn => {
                btn.style.display = 'none';
            });
        }
        $(".carousel-nav .next").on("click", function() {
                   mainFlickity.next();
            });
         $(".carousel-nav .previous").on("click", function() {
                  mainFlickity.previous();
            });
      }
  
      function checkingvideo() {
        let activeslide = document.querySelector('.carousel-main .gallery-cell.is-selected');
        let video_slide = activeslide.querySelector('video');
        if (video_slide) {
          if (!video_slide.paused) {
            showPauseButton();
          } else {
            showPlayButton();
            console.log('play')
          }
        }
      }
  
      function playVideo() {
        let activeslide = document.querySelector('.carousel-main .gallery-cell.is-selected');
        let video_slide = activeslide.querySelector('video');
  
        if (video_slide) {
          video_slide.play();
          showPauseButton();
        }
      }
  
      function pauseVideo() {
        let activeslide = document.querySelector('.carousel-main .gallery-cell.is-selected');
        let video_slide = activeslide.querySelector('video');
  
        if (video_slide) {
          video_slide.pause();
          showPlayButton();
        }
      }
  
      function showPlayButton() {
        document.querySelector('.carousel-main .is-selected .gallery-play').style.display = 'block';
        document.querySelector('.carousel-main .is-selected .gallery-pause').style.display = 'none';
      }
  
      function showPauseButton() {
        document.querySelector('.carousel-main .is-selected .gallery-play').style.display = 'none';
        document.querySelector('.carousel-main .is-selected .gallery-pause').style.display = 'block';
      }
  
      var navCarousel = document.querySelector('.carousel-nav');
      var mainCarousel = document.querySelector('.carousel-main');
      var navFlickity;
      var mainFlickity;
      function initializeFlickity() {
        navFlickity = new Flickity(navCarousel, {
          asNavFor: '.carousel-main',
          contain: true,
          prevNextButtons: true,
          pageDots: false,
          cellSelector: '.gallery-cell'
        });
  
        mainFlickity = new Flickity(mainCarousel, {
          pageDots: false,
          prevNextButtons: false,
          selectedAttraction: 0.1,
        friction: 0.55,
          cellSelector: '.gallery-cell',
          arrowShape: {
            x0: 10,
            x1: 60, y1: 50,
            x2: 65, y2: 45,
            x3: 20
          }
        });
  
        navFlickity.on( 'change', function(index) {
          console.log(index)
          checkingvideo()
        });
  
        document.querySelector('.carousel-main .gallery-play')?.addEventListener('click', playVideo);
        document.querySelector('.carousel-main .gallery-pause')?.addEventListener('click', pauseVideo);
        arrowToShow()
      }
  
      initializeFlickity();
      function selectLabel(event) {
        const currentLabel = event.currentTarget;
        const prevInput = currentLabel.previousElementSibling.value;
        const filterValue = prevInput.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
        var slide = mainCarousel.querySelectorAll('.slide');
        var slide1 = navCarousel.querySelectorAll('.slide1');
        var active = document.querySelectorAll('.' + filterValue);
        if (document.querySelectorAll('.meta-featured-img')) {
          document.querySelectorAll('.meta-featured-img').forEach(featured_img => {featured_img.remove() });
        }
        active.forEach(function(element) {
            element.style.display = 'block';
        });
         slide.forEach(function(sld) {
           sld.classList.add('gallery-cell');
         })
        slide1.forEach(function(sld1) {
           sld1.classList.add('gallery-cell');
         })
  
  
        document.querySelectorAll('.gallery-cell:not(.' + filterValue + ')').forEach(function(element) {
            element.classList.remove('gallery-cell');
            element.style.display = 'none';
        });
  
  
        navFlickity.destroy();
        mainFlickity.destroy();
        initializeFlickity();
    if (document.querySelector('.flickity-prev-next-button.next:disabled') && document.querySelector('.flickity-prev-next-button.previous:disabled')) {
      document.querySelector('.flickity-prev-next-button.next:disabled').style.display = 'none';
      document.querySelector('.flickity-prev-next-button.previous:disabled').style.display = 'none';
    }
    }
  
    const labels_quick = document.querySelectorAll('fieldset.product-form__input-color label');
    labels_quick.forEach(label => {
        label.addEventListener('click', selectLabel);
    });
  
  
  
    const selectedRadio = document.querySelector('fieldset.product-form__input-color input[type="radio"]:checked');
  
        if (selectedRadio) {
          const selectedValue = selectedRadio.value;
          const filterValue = selectedValue.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
        var slide = mainCarousel.querySelectorAll('.slide');
        var slide1 = navCarousel.querySelectorAll('.slide1');
        var active = document.querySelectorAll('.' + filterValue);
        if(document.querySelectorAll('.meta-featured-img') && !window.location.href.includes("variant")){
  
          document.querySelectorAll('.meta-featured-img').forEach(featured_img => {featured_img.classList.add(filterValue) });
        }
        active.forEach(function(element) {
            element.style.display = 'block';
        });
         slide.forEach(function(sld) {
           sld.classList.add('gallery-cell');
         })
        slide1.forEach(function(sld1) {
           sld1.classList.add('gallery-cell');
         })
  
  
        document.querySelectorAll('.gallery-cell:not(.' + filterValue + ')').forEach(function(element) {
            element.classList.remove('gallery-cell');
            element.style.display = 'none';
        });
  
  
        navFlickity.destroy();
        mainFlickity.destroy();
        initializeFlickity();
         document.querySelectorAll('.carousel-main .gallery-cell').forEach((vddiv) =>{
          if(vddiv.querySelector('video')){
            vddiv.querySelector('video').play();
          }
        })
        }
        
      function selectedVariant() {
        let variantSelect = document.querySelector('.product__info-wrapper .product-form input[name=id]').value;
        let varId = document.querySelector(`.var-quantity span[data-id="${variantSelect}"]`);
        if (varId) {
            let varQty = varId.getAttribute('data-qty');
            let numericVarQty = parseFloat(varQty);

            if (numericVarQty < 5) {
                let emElement = document.querySelector('.product-form__input-color .form__label em');

                if (emElement) {
                    let inputStr = emElement.innerHTML;
                    let outputStr = inputStr.replace(/\d+/g, numericVarQty);
                    outputStr = outputStr.replace(/\[num\]/g, numericVarQty);
                    emElement.innerHTML = outputStr;
                    emElement.style.display = 'inline-block';
                }
            } else {
                document.querySelector('.product-form__input-color .form__label em').style.display = 'none';
            }
        }
    }
    setTimeout(() => {
    selectedVariant();
     }, 100);


    let labels = document.querySelectorAll('.product__info-wrapper .product-form__input label');
    labels.forEach((input) => {
        input.addEventListener('click', function () {
            setTimeout(() => {
                selectedVariant();
            }, 100);

            let limitVariants = document.querySelectorAll('.limit-variant');
            if (input.classList.contains('variant_label--color__image') && limitVariants) {
                limitVariants.forEach(limitVariant => {
                    limitVariant.classList.remove('active');
                });
            }
        });
    });

    let limitVariants = document.querySelectorAll('.limit-variant');
    limitVariants.forEach(limitVariant => {
        limitVariant.addEventListener('click', function () {
            limitVariants.forEach(classRemove => {
                classRemove.classList.remove('active');
            });

            let limitColor = limitVariant.getAttribute('data-limit');
            let parentDiv = limitVariant.closest('variant-radios');
            let activeColor = parentDiv.querySelector(`input[value="${limitColor}"]`).nextElementSibling.click();
            limitVariant.classList.add('active');
        });
    });

    const checkedColorInput = document.querySelector('.product-form__input-color input:checked');

    if (checkedColorInput) {
        const checkedValue = checkedColorInput.value;
        const limitColorActive = document.querySelector(`.limit-variant[data-limit="${checkedValue}"]`);

        if (limitColorActive) {
            limitColorActive.classList.add('active');
        }
    }
    }
  });
}
