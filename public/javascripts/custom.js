/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
$(document).ready(function () {
  function validateForm () {
    var usernameRegex = /[^\w\.]/g
    var username = document.form['registerForm']['username'].value
    var pw1 = document.forms['registerForm']['password'].value
    var pw2 = document.forms['registerForm']['confirmPassword'].value
    if (username.search(usernameRegex)) {
      alert('Usernames may only contain letters, numbers, and periods')
      return false
    }

    if (pw1 !== pw2) {
      alert('Passwords do not match.')
      return false
    }
  }
})
