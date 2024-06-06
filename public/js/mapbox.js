document.addEventListener('DOMContentLoaded', function() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const locationsData = mapElement.getAttribute('data-locations');
      try {
        const locations = JSON.parse(locationsData);
        // console.log(locations); 
      } catch (error) {
        console.error('Error parsing locations data:', error);
      }
    }
  });

  // mapboxgl.accessToken = 'pk.eyJ1IjoiZGFrcHJhbmF5IiwiYSI6ImNsd2R1d2ozcDE4ZGMycXBwenh1d2g1MGEifQ.w-yGk4Hl5vTs_5II7Jnfzg';
  // var map = new mapboxgl.Map({
  //   container: 'map',
  //   style: 'mapbox://styles/mapbox/streets-v11'
  // });




