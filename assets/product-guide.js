document.addEventListener('DOMContentLoaded', function() {
    let productGuideSliderElement = document.querySelector('.product-guide-final-wrapper');
    let existingFlickityInstance = productGuideSliderElement.flickityInstance;

    function initializeProductGuideSlider() {
        if (existingFlickityInstance) {
            existingFlickityInstance.destroy();
        }
        productGuideSliderElement.flickityInstance = new Flickity(productGuideSliderElement, {
            pageDots: true,
            freeScroll: true,
            contain: true,
            prevNextButtons: false,
            groupCells: true,
            selectedAttraction: 0.1,
            friction: 0.55
        });
        window.dispatchEvent(new Event('resize'));
    }

 
    let step_intro = document.querySelector('.product-guide-intro-step');
    let step_one = document.querySelectorAll('.guide-step-one .product-guide-content');
    let step_two = document.querySelectorAll('.guide-step-two .product-guide-content');
    let all_step_section = document.querySelectorAll('.guide-step-section');

    step_intro.addEventListener('click', function() {
        all_step_section.forEach(all_step => {
            all_step.classList.remove('active');
        });
        document.querySelector('.product-step-1').classList.add('active');
        document.querySelector('.step-bar-1.step-count').classList.add('active');
    });

    step_one.forEach(e => {
        e.addEventListener('click', function() {
            step_one.forEach(f => {
                f.removeAttribute('active');
            });
            step_two.forEach(tt => {
                tt.classList.remove('show-guide');
            });
            let stepSelect = e.getAttribute('step-one');
            e.setAttribute('active', 'true');
            let stepTwo = document.querySelectorAll(`.guide-step-two .${stepSelect}`);
            stepTwo.forEach(j => {
                j.classList.add('show-guide');
            });
            all_step_section.forEach(all_step => {
                all_step.classList.remove('active');
            });
            document.querySelector('.product-step-2').classList.add('active');
            document.querySelector('.step-bar-2.step-count').classList.add('active');
        });
    });

    step_two.forEach(k => {
        k.addEventListener('click', function() {
            step_two.forEach(p => {
                p.removeAttribute('active');
            });
            let stepOneSelect = document.querySelector('.guide-step-one .product-guide-content[active]').getAttribute('step-one');
            let stepTwoSelect = k.getAttribute('step-two');
            let combineSelect = stepOneSelect + '-' + stepTwoSelect;
            let finalValue = combineSelect.trim();
            let guideCard = document.querySelectorAll('.product-list-card');
            guideCard.forEach(q => {
                q.classList.remove('active');
            });
            let guideCardShow = document.querySelectorAll(`.product-list-card.${finalValue}`);
            guideCardShow.forEach(n => {
                n.classList.add('active');
                n.querySelector('.product-list-color-img:first-child').click();
                n.querySelectorAll('.guide-spec-info').forEach(d => {
                    d.classList.remove('active');
                });
                let specShow = n.querySelectorAll(`.guide-spec-info.${finalValue}`);
                specShow.forEach(z => {
                    z.classList.add('active');
                });
            });
            if (guideCardShow.length >= 1) {
                document.querySelector('.product-guide-final-step').classList.remove('hidden');
                let headingElement = document.querySelector('.final-result-count p');
                let currentHTML = headingElement.innerHTML;
                if (currentHTML.includes('{num}')) {
                    headingElement.innerHTML = currentHTML.replace('{num}', `(${guideCardShow.length})`);
                } else if (/\(\d+\)/.test(currentHTML)) {
                    headingElement.innerHTML = currentHTML.replace(/\(\d+\)/, `(${guideCardShow.length})`);
                }
                if (window.innerWidth <= 600) {
                    initializeProductGuideSlider();
                }
                window.dispatchEvent(new Event('resize'));
                setTimeout(function() {
                    if (document.querySelector('.product-guide-final-wrapper').querySelector('.flickity-page-dots')) {
                        console.log(document.querySelector('.product-guide-final-wrapper').querySelector('.flickity-page-dots').children.length);
                        if (document.querySelector('.product-guide-final-wrapper').querySelector('.flickity-page-dots').children.length <= 1) {
                            document.querySelector('.product-guide-final-wrapper').querySelector('.flickity-page-dots').style.opacity = 0;
                        }
                    }
                }, 300);
            } else {
                document.querySelector('.final-no-result').classList.remove('hidden');
            }
            k.setAttribute('active', 'true');
            all_step_section.forEach(all_step => {
                all_step.classList.remove('active');
            });
            document.querySelector('.product-final-result').classList.add('active');
            document.querySelector('.step-bar-result.step-count').classList.add('active');
        });
    });

    let all_step_counts = document.querySelectorAll('.steps-count-bar .circle-step');

    function handleStepClick(step_count, targetClass) {
        all_step_section.forEach(all_step => {
            all_step.classList.remove('active');
        });
        let nextSibling = step_count.nextElementSibling;
        while (nextSibling) {
            nextSibling.classList.remove('active');
            nextSibling = nextSibling.nextElementSibling;
        }
        document.querySelector(targetClass).classList.add('active');
    }

    all_step_counts.forEach(step_circle => {
        step_circle.addEventListener('click', function() {
            let step_count = this.parentNode;
            if (step_count.classList.contains('active')) {
                if (step_count.classList.contains('step-bar-1')) {
                    handleStepClick(step_count, '.product-step-1');
                } else if (step_count.classList.contains('step-bar-2')) {
                    handleStepClick(step_count, '.product-step-2');
                } else if (step_count.classList.contains('step-bar-intro')) {
                    handleStepClick(step_count, '.guide-intro-start');
                }
            }
        });
    });

    window.addEventListener('resize', function() {
        let final_check_slider = document.querySelector('.product-final-result');
        if (final_check_slider.classList.contains('active')) {
            if (window.innerWidth <= 600) {
                initializeProductGuideSlider();
            } else {
                if (existingFlickityInstance) {
                    existingFlickityInstance.destroy();
                }
            }
        }
    });

    let productLists = document.querySelectorAll('.product-list-slider');
    productLists.forEach(productList=>{
     let productListSlider = new Flickity( productList, {
       pageDots: false,
       prevNextButtons: true,
       freeScroll: true,
       contain: true,
       selectedAttraction: 0.1,
       friction: 0.55
     });
     const labels = productList.closest('.product-list-card').querySelectorAll('.product-list-color-img');
     labels.forEach(label => {
         label.addEventListener('click',e=>{
           const currentLabel = e.currentTarget;
           const colorFor = currentLabel.dataset.color;
           const price_original = currentLabel.dataset.price;
           const price_sale_on = currentLabel.dataset.compareprice;
           const filterValue = colorFor.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
           const parentCard = currentLabel.closest('.product-list-card')
           var slide = parentCard.querySelectorAll('.slide');
           var active = parentCard.querySelectorAll('.' + filterValue);
           parentCard.querySelector('.product-color-heading span').innerHTML = colorFor;
           active.forEach(function(element) {
               element.style.display = 'block';
           });
           slide.forEach(function(sld) {
             sld.classList.add('gallery-cell');
           })
           parentCard.querySelectorAll('.gallery-cell:not(.' + filterValue + ')').forEach(function(element) {
               element.classList.remove('gallery-cell');
               element.style.display = 'none';
           });

           productListSlider.destroy()
           productListSlider = new Flickity(productList, {
             pageDots: false,
             prevNextButtons: true,
             freeScroll: true,
             contain: true,
             cellSelector: '.gallery-cell',
             selectedAttraction: 0.1,
             friction: 0.55
           });
           labels.forEach(classRemoving => {
             classRemoving.classList.remove('active')
           });
           currentLabel.classList.add('active');
           let checkingSold = currentLabel.dataset.available;
           let variantId = currentLabel.dataset.id;
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
           if (checkingSold !== 'true') {
             parentCard.querySelector('.product-form__submit').disabled = true;
             parentCard.querySelector('.product-form__submit span').innerHTML = 'Sold Out';
           } else {
             parentCard.querySelector('.product-form__submit').disabled = false;
             parentCard.querySelector('.product-form__submit span').innerHTML = 'Add to cart';
             parentCard.querySelector('product-form input[name="id"]').value = variantId;
           }            
         });
         labels[0].click();
     });
   });


  });