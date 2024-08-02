
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
      var img_Element = "<a href="+variant_url+"><img src="+image+" loading='lazy' /></a>";
      var el = document.querySelector('.grid-product__color-image--' + id);
      //el.style.backgroundImage = 'url(' + image + ')';
      el.innerHTML = img_Element;
      el.classList.add('is-active');
    });
  });

    var searchslider = document.querySelector('.custom-search-slick');
    searchslider = new Flickity(searchslider, {
        pageDots: false,
        prevNextButtons: true,
        freeScroll: true,
        contain: true,
        groupCells: true
      });
 
if(innerWidth <= 990){
setTimeout(function() {
$('#mobile-header-search').attr('open', 'open');
}, 100);
}
else{

setTimeout(function() {
$('#custom-search-result').attr('open', 'open');
}, 50);
}
$('.close-custom-search').click(function(){
if(innerWidth <= 990){
$('#mobile-header-search').css('display', 'none');
$('#mobile-header-search').removeAttr('open');
}
{
$('#custom-search-result').css('display', 'none');
$('#custom-search-result').removeAttr('open');
$('.header__inline-menu').css('position', 'unset');
$('.header__inline-menu .list-menu--inline').css('pointer-events', 'all');
}

})