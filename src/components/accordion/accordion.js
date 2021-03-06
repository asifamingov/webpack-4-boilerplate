/**
 * This will handle functionalities like
 * - Expand all / Collapse all link
 * - Ability to direct link to each section and expand the linked section
 * - Handles aria-expanded values
 */

(function ($) {
  const accordion = '.qg-accordion';
  if ($(accordion).length > 0) {
    let tabindex = 1;
    const accordionControls = 'input[name=control]';
    let linkedpanel =  window.location.hash && $('input[aria-controls=' + window.location.hash.substring(1) + ']');

    //Handle events of accordion inputs
    $(accordion).find('article input').on('change', function () {
      const checkedStatus = $(this).prop('checked');
      const controlledPanedId = $('#' + $(this).attr('aria-controls'));
      $(this)
        .attr('aria-expanded', checkedStatus) //sets aria
        .parents(accordion).find(accordionControls).prop('checked', false); //clears expand/collapse selection
      controlledPanedId.attr('aria-hidden', !checkedStatus);
    });

    //expand all click
    // label selector is to provide backward compatibility in case projects are using old markup
    $('.qg-acc-controls .expand, label[for=\'expand\']').click(function (e) {
      e.preventDefault();
      $(this).focus();
      $(this).parents('.qg-accordion').find('input:checkbox').prop('checked', true);
    });

    // collapse all click
    // label selector is to provide backward compatibility in case projects are using old markup
    $('.qg-acc-controls .collapse, label[for=\'collapse\']').click(function (e) {
      e.preventDefault();
      $(this).parents('.qg-accordion').find('input:checkbox').prop('checked', false);
    });

    // open on page load
    const hashTrigger = function () {
      linkedpanel = window.location.hash && $('input[aria-controls=' + window.location.hash.substring(1) + ']');
      if (linkedpanel.length > 0) {
        linkedpanel.parents(accordion).find('~ article input').prop('checked', false); //clears expand/collapse selection
        linkedpanel.prop('checked', true);
        $('html, body').animate({
          scrollTop: linkedpanel.offset().top,
        }, 500);
      }
    };
    hashTrigger();
    window.onhashchange = hashTrigger;

    // inserting tab index dynamically
    // label selector is to provide backward compatibility in case projects are using old markup
    $('.qg-accordion .acc-heading, .qg-acc-controls .expand, .qg-acc-controls .collapse, label[for="expand"], label[for="collapse"]').each(function () {
      if (this.type !== 'hidden') {
        var $input = $(this);
        $input.attr('tabindex', tabindex);
        tabindex++;
      }
    });
    $('input[name=tabs]').click(function () {
      $(this).parent('article').find('.acc-heading').focus();
    });

    // highlight title on hover
    $('.qg-accordion article').hover(function () {
      $(accordion).find('.title').removeClass('ht');
      $(this).find('.title').addClass('ht');
    }, function () {
      $(accordion).find('.title').removeClass('ht');
    });
  }
}(jQuery));
