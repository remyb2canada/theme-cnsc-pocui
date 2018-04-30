/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
;(function ($, wb, window) {
  'use strict'
  window.poc = {
    // USERS & AUTHENTICATION
    getCurrentUser: getCurrentUser,
    signIn: signIn,

    // LICENCES
    getLicenceList: getLicenceList,
    getSelectedLicence: getSelectedLicence,
    licenceListTo2DArray: licenceListTo2DArray,
    selectLicence: selectLicence,

    // DATA TABLE HELPER
    addRowClickHandler: addRowClickHandler,
    bindDataToTable: bindDataToTable
  }

  var API_ROOT = 'https://cnsc-poc-api.azurewebsites.net/api/'

  /* -----------------------------
   * USERS AND AUTHENTICATION
   *----------------------------- */
  function signIn (email, password, redirect, store, location) {
    location = location || window.location
    $.get(API_ROOT + '/users/1234', function (user) {
      user.email = user.email || email
      cacheUser(user, store)
      location.href = redirect
    })
  }

  function cacheUser (user, store) {
    setState({
      currentUser: {
        id: '1234',
        email: user.email,
        name: user.firstName + ' ' + user.lastName
      }
    }, store)
  }

  function getCurrentUser (store) {
    const user = getState(store).currentUser
    if (user) {
      return user
    }
    location.href = '/index-' + wb.lang + '.html'
  }

  /* -----------------------------
   * LICENCES
   *----------------------------- */
  function getLicenceList (listReceivedCallback, store) {
    var licenceList = getCachedLicenseList(store)
    if (licenceList) {
      console.log('using cached license list')
      return listReceivedCallback(licenceList)
    }

    var sstsAuthorizationsEndpoint =
      API_ROOT + '/users/' + getCurrentUser().id + '/authorizations/SSTS'

    $.get(sstsAuthorizationsEndpoint, authorizationReceived)

    function authorizationReceived (authorization) {
      var licenceList = authorization.licences
      cacheLicenceList(licenceList)
      listReceivedCallback(licenceList)
    }
  }

  function getCachedLicenseList (store) {
    return getState(store).licenceList
  }

  function cacheLicenceList (list, store) {
    setState({
      licenceList: list
    }, store)
  }

  function licenceListTo2DArray (list) {
    return list.map(function (licence) {
      return [licence.licenceNumber, licence.effectiveDate, licence.expiryDate]
    })
  }

  function selectLicence (licenceNumber) {
    console.log('selected licence number: ' + licenceNumber)
    setState({
      selectedLicence: licenceNumber
    })
  }

  function getSelectedLicence () {
    var selectedLicence = getState().selectedLicence
    if (!selectedLicense) {
      location.href = '/create-sealed-source-step-one-' + wb.lang + '.html'
    }
    return selectedLicense
  }

  /* -----------------------------
   * DATA TABLE HELPERS
   *----------------------------- */
  function bindDataToTable (data, $table, options) {
    var config = options || {}
    config.data = data

    $table
      .addClass('wb-tables')
      .attr('data-wb-tables', JSON.stringify(config))
      .trigger('wb-init.wb-tables')
  }

  function addRowClickHandler ($table, onClick) {
    $table.on('init.dt', function (event) {
      $table.find('tr').each(function (index, row) {
        if (index > 0) {
          $(row).click(function (e) {
            onClick($(row))
          })
        }
      })
    })
  }

  /* -----------------------------
   * STATE MANAGEMENT
   *----------------------------- */
  function getState (store) {
    store = store || window.sessionStorage
    return JSON.parse(store.getItem('state') || '{}')
  }

  function setState (state, store) {
    store = store || window.sessionStorage
    store.setItem('state', JSON.stringify(Object.assign(getState(), state)))
  }

  /* -----------------------------
   * POLYFILL FOR Object.Assign
   * originally from: 
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   * ----------------------------- */
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }
  
        var to = Object(target);
  
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
  
          if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  window['wb-data-ajax'] = {
    corsFallback: function (fetchObj) {
      fetchObj.url = fetchObj.url.replace('.html', '.htmlp')
      return fetchObj
    }
  }
})(jQuery, wb, this)
