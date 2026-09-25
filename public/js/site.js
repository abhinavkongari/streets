// Mobile menu.
(function() {
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.site-header__toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function() {
    var open = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();

// Submission form: fill in fields from the link that brought you here
// (e.g. "Report a change" on a story), and send without leaving the page.
(function() {
  var form = document.getElementById('submit-form');
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var city = params.get('city');
  var report = params.get('report');
  var type = params.get('type');

  if (city && form.elements.city) form.elements.city.value = city;
  if (report) {
    form.elements.kind.value = 'correction';
    form.elements.title.value = 'Update to: ' + report;
  } else if (type && form.querySelector('input[name="kind"][value="' + type + '"]')) {
    form.elements.kind.value = type;
  }

  var result = document.getElementById('form-result');
  form.addEventListener('submit', function(event) {
    if (!form.getAttribute('action') || !window.fetch) return;
    event.preventDefault();
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    result.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        result.innerHTML = '<div class="notice"><p><strong>Thanks, that’s with the editors.</strong> We read everything and will be in touch by email.</p></div>';
      })
      .catch(function() {
        result.innerHTML = '<div class="notice notice--warning"><p>That didn’t send. Please try again in a moment.</p></div>';
      })
      .then(function() { button.disabled = false; });
  });
})();
