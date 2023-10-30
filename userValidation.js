"use strict";

const Joi = require('joi');
function validateForm() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const acceptTerms = document.getElementById("accept-terms").checked;

      if (email.trim() === "") {
        alert("Please enter your email.");
        return false;
      }

      if (password.trim() === "") {
        alert("Please enter your password.");
        return false;
      }

      if (!acceptTerms) {
        alert("Please accept the terms and conditions.");
        return false;
      }

      // If all validations pass, the form will be submitted
      return true;
    }

}; 
