/*aside carousel play and pause feature*/
'use strict';

(function ($) {
  const carousels = [];
  const eqHeight = (carousels) => {
    carousels.forEach(function (e) {
      const items = $('#' + e + '').find('.carousel-item');
      const heights = [];
      let tallest;
      if (items.length) {
        var normalizeHeights = function () {
          items.each(function () {
            heights.push($(this).height());
          });
          tallest = Math.max.apply(null, heights);
          items.each(function () {
            $(this).css('min-height', tallest + 'px');
          });
        };
        normalizeHeights();
        $(window).on('resize orientationchange', function () {
          tallest = 0;
          heights.length = 0;
          items.each(function () {
            $(this).css('min-height', '0');
          });
          normalizeHeights();
        });
      }
    });
  };
  $('.qg-featured .carousel.slide').each(function (i, e) {
    const carousel = $(e).attr('id');
    carousels.push(carousel);
    $(this).attr('data-state', 'cycle');
    $('#' + carousel + '').find('.toggleCarousel').click(function (e) {
      e.preventDefault();
      var $parentCarousel = $(this).parents('div.carousel.slide');
      $parentCarousel.attr('data-state') === 'cycle' ? $parentCarousel.attr('data-state', 'pause') : $parentCarousel.attr('data-state', 'cycle');
      $parentCarousel.carousel($parentCarousel.attr('data-state'));
      $(this).find('i').toggleClass('fa-sync fa-pause');
    });
  });
  window.onload = function () {
    eqHeight(carousels);
  };
})(jQuery);
