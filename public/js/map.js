// Draws every .map element on the page with Leaflet and OpenStreetMap.
// data-pins holds the places; data-mode is one of:
//   pins    - a few places, fitted to view
//   single  - one place, zoomed in
//   walk    - numbered stops joined in order
//   explore - the city map, with category filters and "Near me"
(function() {
  if (!window.L) return;

  function pinIcon(colour, label) {
    return L.divIcon({
      className: '',
      html: '<span class="map-pin" style="background:' + colour + '">' + (label || '') + '</span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function popup(pin) {
    return '<div class="map-popup"><a href="' + pin.href + '">' + escapeHtml(pin.title) + '</a>' +
      (pin.summary ? '<p>' + escapeHtml(pin.summary) + '</p>' : '') + '</div>';
  }

  document.querySelectorAll('.map').forEach(function(el) {
    var pins = JSON.parse(el.getAttribute('data-pins') || '[]');
    var mode = el.getAttribute('data-mode');
    if (!pins.length) { el.hidden = true; return; }

    var map = L.map(el, { scrollWheelZoom: mode === 'explore' });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = pins.map(function(pin, i) {
      var label = mode === 'walk' ? String(i + 1) : '';
      var colour = mode === 'walk' ? 'rgb(106,20,0)' : pin.colour;
      var marker = L.marker([pin.lat, pin.lng], { icon: pinIcon(colour, label), title: pin.title })
        .bindPopup(popup(pin))
        .addTo(map);
      marker.pin = pin;
      return marker;
    });

    if (mode === 'walk') {
      L.polyline(pins.map(function(p) { return [p.lat, p.lng]; }), {
        color: 'rgb(106,20,0)', weight: 3, opacity: 0.7, dashArray: '6 8'
      }).addTo(map);
    }

    function fit(list) {
      if (list.length === 1) map.setView(list[0].getLatLng(), 16);
      else if (list.length) map.fitBounds(L.featureGroup(list).getBounds(), { padding: [36, 36], maxZoom: 16 });
    }
    fit(markers);

    if (mode === 'explore') explore(map, markers, fit);
  });

  // Category filters and "Near me" for the city map page.
  function explore(map, markers, fit) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.explore__list .story-row'));
    var list = document.querySelector('.explore__list .story-list');
    var chips = document.querySelectorAll('[data-filter]');
    var filter = 'all';

    function apply() {
      var shown = markers.filter(function(m) {
        var match = filter === 'all' || m.pin.category === filter;
        if (match) m.addTo(map); else m.remove();
        return match;
      });
      rows.forEach(function(row) {
        row.hidden = !(filter === 'all' || row.getAttribute('data-category') === filter);
      });
      return shown;
    }

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        filter = chip.getAttribute('data-filter');
        chips.forEach(function(c) { c.setAttribute('aria-pressed', String(c === chip)); });
        fit(apply());
      });
    });

    var button = document.getElementById('near-me');
    var status = document.getElementById('near-me-status');
    var you;
    if (!button) return;
    if (!navigator.geolocation) { button.hidden = true; return; }

    button.addEventListener('click', function() {
      status.textContent = 'Finding you…';
      navigator.geolocation.getCurrentPosition(function(pos) {
        var here = L.latLng(pos.coords.latitude, pos.coords.longitude);
        if (you) you.remove();
        you = L.marker(here, {
          icon: L.divIcon({ className: '', html: '<span class="you-are-here"></span>', iconSize: [16, 16] }),
          title: 'You are here', keyboard: false
        }).addTo(map);

        // Sort the list by distance and label each place with how far it is.
        rows.forEach(function(row) {
          var d = here.distanceTo([Number(row.getAttribute('data-lat')), Number(row.getAttribute('data-lng'))]);
          row.distance = d;
          row.querySelector('.explore__distance').textContent =
            ' · ' + (d < 1000 ? Math.round(d / 10) * 10 + ' m' : (d / 1000).toFixed(1) + ' km') + ' away';
        });
        rows.sort(function(a, b) { return a.distance - b.distance; }).forEach(function(row) { list.appendChild(row); });

        var nearest = rows.filter(function(r) { return !r.hidden; })[0];
        if (nearest && nearest.distance > 30000) {
          status.textContent = 'You’re a long way from here, so the map stays put. The list is sorted by distance.';
          return;
        }
        status.textContent = 'Sorted by distance from you.';
        var closest = markers.filter(function(m) { return map.hasLayer(m); })
          .sort(function(a, b) { return here.distanceTo(a.getLatLng()) - here.distanceTo(b.getLatLng()); })
          .slice(0, 3);
        map.fitBounds(L.featureGroup(closest.concat(you)).getBounds(), { padding: [48, 48], maxZoom: 16 });
      }, function() {
        status.textContent = 'We couldn’t get your location. Check your browser’s location permission.';
      }, { enableHighAccuracy: true, timeout: 10000 });
    });
  }
})();
