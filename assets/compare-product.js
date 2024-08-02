document.addEventListener('DOMContentLoaded', function () {
    let heightImg = 0;
    let productGuideSliderElement = document.querySelector('.comparison-card-wrapper');
    let asfornavslide = document.querySelector('.comparison-info-wrapper');

    function initializeProductGuideSlider() {
        if (productGuideSliderElement.flickityInstance) {
            productGuideSliderElement.flickityInstance.destroy();
        }
        if (asfornavslide.flickityInstance) {
            asfornavslide.flickityInstance.destroy();
        }

        productGuideSliderElement.flickityInstance = new Flickity(productGuideSliderElement, {
            pageDots: true,
            contain: true,
            prevNextButtons: false,
            groupCells: true,
            selectedAttraction: 0.1,
            friction: 0.55
        });

        asfornavslide.flickityInstance = new Flickity(asfornavslide, {
            pageDots: false,
            contain: true,
            prevNextButtons: false,
            groupCells: true,
            selectedAttraction: 0.1,
            friction: 0.55,
            asNavFor: ".comparison-card-wrapper"
        });
    }
    function setMaxHeight(className) {
        let maxHeight = 0;
        const elements = document.querySelectorAll(className);
        elements.forEach(el => {
            el.style.height = 'auto'
        });
        elements.forEach(el => {
            if (el.clientHeight > maxHeight) {
                maxHeight = el.clientHeight;
            }
        });

        elements.forEach(el => {
            el.style.height = maxHeight + 'px';
        });
    }
    function havescroll() {
        var elements = document.querySelectorAll('.product-list-variants');

        elements.forEach(function (wrapper) {
            var isDragging = false;
            var startX;
            var scrollLeft;

            function checkHorizontalOverflow() {
                var hasHorizontalOverflow = wrapper.scrollWidth > wrapper.clientWidth;
                if (hasHorizontalOverflow) {
                    wrapper.style.cursor = 'grab';
                    wrapper.addEventListener('mousedown', onMouseDown);
                } else {
                    wrapper.style.cursor = 'default';
                    wrapper.removeEventListener('mousedown', onMouseDown);
                }
            }

            function onMouseDown(e) {
                if (e.button !== 0) return;
                isDragging = true;
                startX = e.clientX - wrapper.offsetLeft;
                scrollLeft = wrapper.scrollLeft;
                wrapper.style.cursor = 'grabbing';
                e.preventDefault();

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }

            function onMouseMove(e) {
                if (!isDragging) return;
                var x = e.clientX - wrapper.offsetLeft;
                var walk = (x - startX) * 2;
                wrapper.scrollLeft = scrollLeft - walk;
            }

            function onMouseUp() {
                if (!isDragging) return;
                isDragging = false;
                wrapper.style.cursor = 'grab';


                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            checkHorizontalOverflow();
            window.addEventListener('resize', checkHorizontalOverflow);
        });
    }
    function stickyCard(){
        window.addEventListener('scroll', function() {
            const comparisonCard = document.querySelector('.comparison-card-wrapper');
            if (comparisonCard) {
                const rect = comparisonCard.getBoundingClientRect();
                const top = rect.top;
                  console.log(top)
                if (top <= 5) {
            comparisonCard.classList.add('sticky-card');
            setMaxHeight('.product-list-card.active .product-list-title');
            if (productGuideSliderElement.flickityInstance) {
                productGuideSliderElement.flickityInstance.resize();
            }
                } else {
                    comparisonCard.classList.remove('sticky-card');
                    setMaxHeight('.product-list-card.active .product-list-title');
                if (productGuideSliderElement.flickityInstance) {
                productGuideSliderElement.flickityInstance.resize();
            }
                }
            }
        });
    }
    var compareInputs = document.querySelectorAll('.compare-input');
    compareInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const checkbox = event.target;
            var proID = checkbox.value;
            var proImage = checkbox.dataset.image;
            var existingProduct = document.querySelector(`.compare-product-wrapper [data-id="${proID}"]`);
            var mainDivp = document.querySelector('.compare-product-wrapper');
            var compareBtn = document.querySelector('.pro-compare-content.pro-compare-content-btn');
            var checkedLength = document.querySelectorAll('.compare-input:checked').length;
            var firstdummy = document.querySelector('.first-dummy');
            var seconddummy = document.querySelector('.second-dummy');
            if (!existingProduct) {
                var compareProduct = document.createElement('div');
                compareProduct.classList.add('pro-compare-content');
                compareProduct.setAttribute('data-id', proID);
                compareProduct.innerHTML = `<img src="${proImage}" width="150" height="200"/> <span class="close-pro-comp"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                  </svg></span>`;
                  if(checkedLength === 2){
                    mainDivp.insertBefore(compareProduct, firstdummy);
                    firstdummy.style.display = 'none';
                  }
                else if (compareBtn) {
                    mainDivp.insertBefore(compareProduct, compareBtn);
                } else {
                    mainDivp.appendChild(compareProduct)
                }
            }
            if(checkedLength === 1 && !firstdummy){
                    var compareProductdummy = document.createElement('div');
                    compareProductdummy.classList.add('pro-compare-content', 'first-dummy'); 
                    mainDivp.appendChild(compareProductdummy);
                
                    var compareProductdummyClone = compareProductdummy.cloneNode(true);
                    compareProductdummyClone.classList.remove('first-dummy'); 
                    compareProductdummyClone.classList.add('second-dummy');
                    mainDivp.appendChild(compareProductdummyClone);
                    compareProductdummy.style.display = 'block';
                    compareProductdummyClone.style.display = 'block';

            }
            if(checkedLength === 2){
                seconddummy.style.display = 'block';
            }
            if (checkedLength === 2 && !compareBtn) {
                var compareProductbutton = document.createElement('div');
                compareProductbutton.classList.add('pro-compare-content', 'pro-compare-content-btn');
                compareProductbutton.innerHTML = `<button class="compares-btn">Compare</button> <button class="remove-all-btn">Clear all</button>`;
                mainDivp.appendChild(compareProductbutton);
            }
            else if (checkedLength === 1 && compareBtn){
                compareBtn.remove();
                firstdummy.style.display = 'block';
                seconddummy.style.display = 'block';
            }
            if(checkedLength === 0){
                firstdummy.remove();
                seconddummy.remove();
            }
            var compareProductContainer = document.querySelector('.compare-product-section');
            if (!compareProductContainer.classList.contains('active')) {
                compareProductContainer.classList.add('active');
            }
            if (checkedLength >= 1) {
                if (!mainDivp.classList.contains('active')) {
                    mainDivp.classList.add('active')
                }
                document.querySelector('.compare-product-total').innerText = `(${checkedLength})`;
                if (checkedLength >= 3) {
                    document.querySelectorAll('.compare-input:not(:checked)').forEach(notcheck => {
                        notcheck.disabled = true;
                    });
                    firstdummy.style.display = 'none';
                    seconddummy.style.display = 'none';
                } else {
                    document.querySelectorAll('.compare-input').forEach(checkbox => {
                        checkbox.disabled = false;
                    });
                }
            }
            if (checkbox.checked == false) {
                document.querySelector(`.pro-compare-content[data-id="${proID}"]`).querySelector('.close-pro-comp').click();
            }
            if (checkedLength === 0) {
                if (document.querySelector('.compare-product-wrapper').classList.contains('active')) {
                    document.querySelector('.compare-product-wrapper').classList.remove('active');
                }
                if (document.querySelector('.count-svg').classList.contains('active')) {
                    document.querySelector('.count-svg').classList.remove('active');
                }
            }
        });
    });
    document.addEventListener('click', function (event) {   
        if (event.target.closest('.compare-heading')) {
            document.querySelector('.compare-product-wrapper').classList.toggle('active');
            document.querySelector('.count-svg').classList.toggle('active')
        }
        if (event.target.closest('.close-pro-comp')) {
            var closeBtn = event.target;
            var parentDiv = closeBtn.closest('.pro-compare-content');
            var closeProId = parentDiv.dataset.id;
            var productRemove = closeBtn.closest('.pro-compare-content');
            var compareWrapper = closeBtn.closest('.compare-product-wrapper');
            var firstdummy = document.querySelector('.first-dummy');
            var seconddummy = document.querySelector('.second-dummy');
            productRemove.parentNode.removeChild(productRemove);
            document.querySelector(`input[value="${closeProId}"]`).checked = false;
            var checkedLength = document.querySelectorAll('.compare-input:checked').length;
            document.querySelector('.compare-product-total').innerText = `(${checkedLength})`;
            if (checkedLength <= 2) {
                document.querySelectorAll('.compare-input').forEach(checkbox => {
                    checkbox.disabled = false;
                });
            }
            if (checkedLength === 1) {
                if(document.querySelector('.pro-compare-content-btn')){
                    document.querySelector('.pro-compare-content-btn').remove();
                }
                firstdummy.style.display = 'block';
                seconddummy.style.display = 'block';
            }
            if(checkedLength === 2){
                firstdummy.style.display = 'none';
                seconddummy.style.display = 'block';
            }
            if (checkedLength === 0) {
                if (document.querySelector('.compare-product-wrapper').classList.contains('active')) {
                    document.querySelector('.compare-product-wrapper').classList.remove('active');
                }
                if (document.querySelector('.count-svg').classList.contains('active')) {
                    document.querySelector('.count-svg').classList.remove('active');
                }
                compareWrapper.innerHTML = '';
            }
        }
        if (event.target.classList.contains('remove-all-btn')) {

            document.querySelector('.compare-product-wrapper').innerHTML = '';
            document.querySelector('.compare-product-wrapper').classList.remove('active');
            document.querySelector('.compare-product-total').innerText = '(0)';
            compareInputs.forEach(input => {
                input.checked = false;
                input.disabled = false;
            });
        }
        if (event.target.classList.contains('compares-btn')) {
            var closeBtn = event.target;
            var compareWrapper = closeBtn.closest('.compare-product-wrapper');
            var all_comapre_ids = compareWrapper.querySelectorAll('.pro-compare-content');
            var reslut_product = document.querySelectorAll('.product-list-card');
            var reslut_product_info = document.querySelectorAll('.product-info-card');
            const ids = [];
            all_comapre_ids.forEach(element => {
                const id = element.dataset.id;
                if (id) {
                    ids.push(id);
                }
            });
            localStorage.setItem('proCompareIds', JSON.stringify(ids));

            reslut_product.forEach(resultItem => {
                resultItem.style.display = 'none';
                if (resultItem.classList.contains('active')) {
                    resultItem.classList.remove('active');
                }
            })
            reslut_product_info.forEach(resultItem => {
                resultItem.style.display = 'none';
                if (resultItem.classList.contains('active')) {
                    resultItem.classList.remove('active');
                }
                if (resultItem.classList.contains('active-first')) {
                    resultItem.classList.remove('active-first');
                }
            })
            all_comapre_ids.forEach((compareItem) => {
                var itemId = compareItem.dataset.id;
                var resultShow = document.querySelector(`.product-list-card[data-id="${itemId}"]`);
                var resultinfoShow = document.querySelector(`.product-info-card[data-id="${itemId}"]`);
                if (resultShow) {
                    resultShow.style.display = 'flex';
                    resultShow.classList.add('active');
                }
                if (resultinfoShow) {
                    resultinfoShow.style.display = 'flex';
                    resultinfoShow.classList.add('active');
                }
            });
            document.querySelectorAll('#MainContent .shopify-section:not(.product-comp-section)').forEach(section => {
                section.style.display = 'none';
            });
            document.querySelector('.product-info-card.active').classList.add('active-first');
            document.querySelector('#MainContent .shopify-section.product-comp-section').style.display = 'block';
            document.querySelector('.comparise-section').classList.remove('hidden');
            document.querySelector('.compare-product-section').classList.remove('active');
            setMaxHeight('.product-list-card.active .product-list-title');
            setMaxHeight('.product-info-card.active .product-com-des');
            setMaxHeight('.product-info-card.active .comp-featured-wrapper');
            setMaxHeight('.product-info-card.active .comp-additional-feature');
            setMaxHeight('.product-info-card.active .extended-features');
            setMaxHeight('.product-info-card.active .comp-tech-spec');
            setMaxHeight('.product-info-card.active .comp-in-box');
            if (window.innerWidth <= 990) {
                console.log(heightImg)
                initializeProductGuideSlider();
                let widthCard = document.querySelector('.product-info-card.active').clientWidth;
                document.querySelectorAll(' .product-list-image').forEach(imgdiv => {
                    if (heightImg == 0) {
                        imgdiv.style.height = (widthCard - 10) + 'px';
                        heightImg = widthCard;
                    }
                    else {
                        imgdiv.style.height = heightImg + 'px';
                    }
                });
            }

            havescroll();
            window.dispatchEvent(new Event('resize'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(()=>{
                    stickyCard()
                }, 3000)
        }
        if (event.target.classList.contains('comparison-close')) {
            document.querySelector('#MainContent .shopify-section.product-comp-section').style.display = 'none';
            document.querySelectorAll('#MainContent .shopify-section:not(.product-comp-section)').forEach(section => {
                section.style.display = 'block';
            });
            document.querySelector('.compare-product-section').classList.add('active');
            document.querySelector('.compare-product-wrapper').classList.add('active');
            setTimeout(() => {
                setTimeout
                window.dispatchEvent(new Event('resize'));
            }, 100)
        }
    });
    let productLists = document.querySelectorAll('.product-list-slider');
    productLists.forEach(productList => {
        let productListSlider = new Flickity(productList, {
            pageDots: false,
            prevNextButtons: true,
            contain: true,
            selectedAttraction: 0.1,
            friction: 0.55
        });
        const labels = productList.closest('.product-list-card').querySelectorAll('.product-list-color-img');
        labels.forEach(label => {
            label.addEventListener('click', e => {
                const currentLabel = e.currentTarget;
                const colorFor = currentLabel.dataset.color;
                const price_original = currentLabel.dataset.price;
                const price_sale_on = currentLabel.dataset.compareprice;
                const filterValue = colorFor.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                const parentCard = currentLabel.closest('.product-list-card');
                var slide = parentCard.querySelectorAll('.slide');
                var active = parentCard.querySelectorAll('.' + filterValue);
                parentCard.querySelector('.product-color-heading span').innerHTML = colorFor;
                active.forEach(function (element) {
                    element.style.display = 'block';
                });
                slide.forEach(function (sld) {
                    sld.classList.add('gallery-cell');
                })
                parentCard.querySelectorAll('.gallery-cell:not(.' + filterValue + ')').forEach(function (element) {
                    element.classList.remove('gallery-cell');
                    element.style.display = 'none';
                });
                productListSlider.destroy()
                productListSlider = new Flickity(productList, {
                    pageDots: false,
                    prevNextButtons: true,
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
                if (price_sale_on) {
                    parentCard.querySelector('.price-item--sale.price-item--last').innerHTML = price_original;
                    parentCard.querySelector('.price__sale .price-item.price-item--regular').innerHTML = price_sale_on;
                    if (!parentCard.querySelector('.price').classList.contains('price--on-sale')) {
                        parentCard.querySelector('.price').classList.add('price--on-sale');
                    }
                }
                else {
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
    document.querySelectorAll('.compare-input').forEach(checkbox => {
        checkbox.disabled = false;
        checkbox.checked = false;
    });
    const storedIds = localStorage.getItem('proCompareIds');
    if (storedIds) {
        const ids = JSON.parse(storedIds);
        ids.forEach(id => {
            const input = document.querySelector(`input[value='${id}']`);
            if (input) {
                input.click();
            }
        });
    }
});