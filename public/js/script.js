// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  // Validation for booking form dates
  const bookingForm = document.querySelector('form[action$="/bookings"]');
  if (bookingForm) {
    const checkInInput = bookingForm.querySelector('#checkInDate');
    const checkOutInput = bookingForm.querySelector('#checkOutDate');

    bookingForm.addEventListener('submit', (event) => {
      const checkInDate = new Date(checkInInput.value);
      const checkOutDate = new Date(checkOutInput.value);

      if (checkOutDate <= checkInDate) {
        event.preventDefault();
        event.stopPropagation();
        alert('Check-out date must be after check-in date.');
      }
    });
  }
})();
