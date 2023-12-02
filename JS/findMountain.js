$(document).ready(function () {

  // 사용자 위치 가져오기
  function getUserLocation() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        resolve({ latitude: latitude, longitude: longitude });
      }, function (error) {
        reject(error);
      });
    });
  }

  // 산 검색 함수
  function searchMountains(latitude, longitude) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        method: "GET",
        url: "https://dapi.kakao.com/v2/local/search/keyword.json",
        data: {
          y: latitude,
          x: longitude,
          radius: 20000,
          query: "산",
          category_group_code: 'AT4'
        },
        headers: {
          Authorization: "KakaoAK cbf18629496639b728ece4b1fcbb27f2"
        }
      })
        .done(function (data) {
          resolve(data.documents);
        })
        .fail(function (error) {
          reject(error);
        });
    });
  }

  // 산 정보 표시 함수
  function displayMountains(mountains) {
    mountainList = $("#mountain-list");
    mountains.forEach(function (mountain, index) {
      var mountainDiv = $("<div>").attr("id", "mountain-" + index);
      mountainDiv.append("<p><strong>산 이름: </strong><span class='mountain-name' data-lat='" + mountain.y + "' data-lng='" + mountain.x + "'>" + mountain.place_name + "</span></p>");
      mountainDiv.append("<p><strong>주소: </strong>" + mountain.address_name + "</p>");
      var mapContainer = $("<div>").addClass("map-container").attr("id", "map-" + index);
      mountainDiv.append(mapContainer);
      mountainList.append(mountainDiv);
    });
  }
  // 지도 표시 함수
  function displayMap(latitude, longitude, mapContainerId) {
    var mapOptions = {
      center: new kakao.maps.LatLng(latitude, longitude),
      level: 7
    };

    var map = new kakao.maps.Map(document.getElementById(mapContainerId), mapOptions);

    var markerPosition = new kakao.maps.LatLng(latitude, longitude);
    var marker = new kakao.maps.Marker({
      position: markerPosition
    });
    marker.setMap(map);
  }
  // 사용자 위치 가져오기 및 산 검색 및 표시
  getUserLocation()
    .then(function (location) {
      return searchMountains(location.latitude, location.longitude);
    })
    .then(function (mountains) {
      displayMountains(mountains);
      mountains.forEach(function (mountain, index) {
        displayMap(mountain.y, mountain.x, "map-" + index);
      });
      // applyTrail();
    })
    .catch(function (error) {
      console.error("에러 발생:", error);
    });
});