document.addEventListener('DOMContentLoaded', function() {
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
   if (window.innerWidth <= 600) {
   let productGuideSliderElement = document.querySelector('.product-guide-final-wrapper');
   productGuideSliderElement.flickityInstance = new Flickity(productGuideSliderElement, {
    pageDots: true,
    freeScroll: true,
    contain: true,
    prevNextButtons: false,
    groupCells: true,
    selectedAttraction: 0.1,
    friction: 0.55
    });
    }
  })