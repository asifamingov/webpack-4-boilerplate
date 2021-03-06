/*global qg, jQuery, google*/
let qgInitAutocompleteAddress;

(function (qg, $) {
  'use strict';
  const inputLocationId = 'qg-location-autocomplete';
  let addressSelection = false;

  const el = {
    $searchWidget: $('#qg-search-widget'),
    $autoComplete: $('.qg-location-autocomplete'),
    $latitude: $('#latitude'),
    $longitude: $('#longitude'),
    $form: $('#qg-search-widget-form'),
  };

  // getting and setting input fields value using query parameter
  var setsValue = function () {
    el.$form.find(':input:not(:checkbox):not(:radio), select, textarea').each(function () {
      const name = $(this).attr('name');
      const getParameterVal = qg.swe.getParameterByName($(this).attr('name'));
      if (getParameterVal !== false) {
        $('[name="' + name + '"]').val(getParameterVal);
      }
    }).end().find('input[type=checkbox], input[type=radio]').each(function () {
      const name = $(this).attr('name');
      const getParameterVal = qg.swe.getParameterByName(name);
      if (getParameterVal !== false) {
        $('[value="' + getParameterVal + '"]').prop('checked', true);
      }
    });
  };
  setsValue();

  // removing hidden fields value on reset
  el.$searchWidget.find('button[type="reset"]').click(function (evt) {
    evt.preventDefault();
    el.$form.find(':input:not(:checkbox):not(:radio), select, textarea').each(function () {
      $(this).val('');
    }).end().find('input[type=checkbox], input[type=radio]').each(function () {
      $(this).prop('checked', false);
    });
  });

  // on autoComplete blur removing hidden fields values
  el.$autoComplete.blur(function () {
    if ($(this).val().length === 0) {
      el.$searchWidget.find(el.$latitude).val('')
        .end()
        .find(el.$longitude).val('');
    }
  });
  if ($('.' + inputLocationId).length > 0) {
    const getLocationEle = $('.qg-app-geocoding');
    qgInitAutocompleteAddress = () => {
      const qldBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-29, 138.0578426),
        new google.maps.LatLng(-9.9339, 153.63831));
      const inputLocationEle = document.getElementsByClassName(inputLocationId);
      const addressFormId = 'qg-address-autocomplete';
      $.each(inputLocationEle, function () {
        const dataStrictBounds = $(this).data('strictbounds') || true;
        const options = {
          bounds: qldBounds,
          strictBounds: dataStrictBounds,
          types: ['geocode'],
        };
        const autocomplete = new google.maps.places.Autocomplete(this, options);
        //if address form exists fill the selection
        const form = $(this).siblings('.' + addressFormId);
        if (form.length > 0) {
          const formFields = {
            street_number: { dataType: 'street', name: 'short_name' },
            route: { dataType: 'street', name: 'long_name' },
            locality: { dataType: 'city', name: 'long_name' },
            administrative_area_level_1: { dataType: 'state', name: 'short_name' },
            country: { dataType: 'country', name: 'long_name' },
            postal_code: { dataType: 'zip', name: 'short_name' },
          };
          const fillInAddress = () => {
            const loc = autocomplete.getPlace();
            if ($('.error-handler').length > 0) { $('.error-handler').html(''); }
            //clear form
            $.each(formFields, (i, v) => {
              form.find('input[data-type="' + v.dataType + '"]').val('');
            });
            for (let i = 0; i < loc.address_components.length; i++) {
              const type = loc.address_components[i].types[0];
              if (formFields[type] !== undefined && formFields[type].dataType !== undefined) {
                const inputEle = form.find('input[data-type="' + formFields[type].dataType + '"]');
                if (inputEle.length > 0) {
                  const val = inputEle.val() + ' ' + loc.address_components[i][formFields[type].name];
                  inputEle.val(val);
                  inputEle.change();
                }
              }
            }
          };
          autocomplete.addListener('place_changed', fillInAddress);
        } else {
          var fillInAddress = () => {
            var place = autocomplete.getPlace();
            if ($('.error-handler').length > 0 && $('.error-handler').val()) { $('.error-handler').html(''); }
            $('.qg-result-title h2').append(`near '<strong><em>${place.formatted_address}'</em></strong>`);
            if (place.geometry) {
              el.$searchWidget.find(el.$latitude).val(place.geometry.location.lat())
                .end()
                .find(el.$longitude).val(place.geometry.location.lng());
            }
          };
          autocomplete.addListener('place_changed', fillInAddress);
        }
        el.$form.find('.qg-location-autocomplete').keydown(function (e) {
          if (addressSelection === false && $(this).val().length > 1) {
            if (e.keyCode === 13 || e.keyCode === 9) {
              e.preventDefault();
            }
          }
        });
        el.$form.find('.qg-location-autocomplete').keyup(function (e) {
          if ($(this).val().length > 1) {
            var reqReady = true;
            var formContainer = $('.qg-fl');
            var errorMessage = $('<p class="text-danger font-italic pt-2 pl-2">No result found</p>');
            var errorHandler = $('<div class="error-handler"></div>');
            if (!$('.error-handler').length > 0) { errorHandler.insertAfter(formContainer); }
            const itemFull = $('.pac-container .pac-item:first').text();
            const itemQuery = $('.pac-container .pac-item:first .pac-item-query').text();
            const firstResult = itemQuery + ' ' + itemFull.substring(itemQuery.length);
            if (e.keyCode === 13 || e.keyCode === 9) {
              e.preventDefault();
              if (firstResult.length > 1 && reqReady === true) {
                $('.qg-location-autocomplete').val(firstResult);
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: firstResult }, function (results, status) {
                  if (status === 'OK') {
                    reqReady = false;
                    if (results) {
                      $('.qg-location-autocomplete').val(results[0].formatted_address);
                      const latitude = results[0].geometry.location.lat();
                      const longitude = results[0].geometry.location.lng();
                      $('.error-handler').html('');
                      addressSelection = true;
                      el.$searchWidget.find(el.$latitude).val(latitude)
                        .end()
                        .find(el.$longitude).val(longitude);
                      setTimeout(function () {
                        reqReady = true;
                      }, 1000);
                    } else {
                      reqReady = true;
                      $('.error-handler').html(errorMessage);
                    }
                  } else {
                    reqReady = true;
                    if (status === 'ZERO_RESULTS' || status === 'OVER_QUERY_LIMIT' || status === undefined) {
                      $('.error-handler').html(errorMessage);
                    }
                  }
                });
              }
            }
          } else {
            addressSelection = false;
          }
        });
      });

      //Get current location
      if (getLocationEle.length > 0) {
        $.each(getLocationEle, (i, ele) => {
          $(ele).on('click', function (event) {
            event.preventDefault();
            if (navigator.geolocation) {
              const showLocation = (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
                const geocoder = new google.maps.Geocoder();
                const locationInput = $(this).siblings('.' + inputLocationId);
                el.$searchWidget.find(el.$latitude).val(latitude)
                  .end()
                  .find(el.$longitude).val(longitude);
                if (locationInput.length > 0) {
                  geocoder.geocode({ location: latlng }, (results, status) => {
                    if (status === 'OK') {
                      if ($('.error-handler').length > 0) { $('.error-handler').html(''); }
                      if (results[1]) {
                        locationInput.val(results[1].formatted_address);
                        locationInput.trigger('place_changed');
                      } else {
                        window.alert('No results found');
                      }
                    } else {
                      window.alert('Geocoder failed due to: ' + status);
                    }
                  });
                }
              };
              const errorHandler = (err) => {
                if (err.code === 1) {
                  alert('Error: Access is denied!');
                } else if (err.code === 2) {
                  alert('Error: Position is unavailable!');
                }
              };
              const options = { timeout: 60000 };
              navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
            } else {
              // Browser doesn't support Geolocation
              window.alert('Your browser does not support Geolocation');
            }
          });
        });
      }
    };
    qg.loadGoogle(qgInitAutocompleteAddress);
  }
}(qg, jQuery));
