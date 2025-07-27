const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    zoom: {
        maxRatio: 3, // oder mehr, z.B. 3 oder 4
        limitToOriginalSize: true,
    },

    touchRatio: 1,
    passiveListeners: false,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

});