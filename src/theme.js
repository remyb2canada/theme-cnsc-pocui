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
  var store = window.sessionStorage

  /* -----------------------------
   * USERS AND AUTHENTICATION
   *----------------------------- */
  function signIn (email, password, redirect) {
    $.get(API_ROOT + '/users/1234', function (user) {
      user.email = user.email || email
      cacheUser(user)
      location.href = redirect
    })
  }

  function cacheUser (user) {
    setState({
      currentUser: {
        id: '1234',
        email: user.email,
        name: user.firstName + ' ' + user.lastName
      }
    })
  }

  function getCurrentUser () {
    const user = getState().currentUser
    if (user) {
      return user
    }
    location.href = '/index-' + wb.lang + '.html'
  }

  /* -----------------------------
   * LICENCES
   *----------------------------- */
  function getLicenceList (listReceivedCallback) {
    var licenceList = getCachedLicenseList()
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

  function getCachedLicenseList () {
    return getState().licenceList
  }

  function cacheLicenceList (list) {
    setState({
      licenceList: list
    })
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
  function getState () {
    return JSON.parse(store.getItem('state') || '{}')
  }

  function setState (state) {
    store.setItem('state', JSON.stringify(Object.assign(getState(), state)))
  }

  window['wb-data-ajax'] = {
    corsFallback: function (fetchObj) {
      fetchObj.url = fetchObj.url.replace('.html', '.htmlp')
      return fetchObj
    }
  }
})(jQuery, wb, this)
