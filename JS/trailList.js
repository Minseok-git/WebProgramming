var latlng;
var mountainName = localStorage.getItem('keyword');
var latitude;
var longitude;
const requestUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
    mountainName
)}`;

fetch(requestUrl, {
    headers: { Authorization: "KakaoAK cbf18629496639b728ece4b1fcbb27f2" },
})
    .then((response) => response.json())
    .then((data) => {
        const resultContainer = document.getElementById("result");
        resultContainer.innerHTML = "";

        if (data.documents.length > 0) {
            const mountain = data.documents[0];
            latitude = Number(mountain.y); // 산의 위도
            longitude = Number(mountain.x); // 산의 경도

            // const resultText = `산의 위치: 위도 ${latitude}, 경도 ${longitude}`;
            // resultContainer.textContent = resultText;
        } else {
            resultContainer.textContent = "산을 찾을 수 없습니다.";
        }
        setCenter(latitude, longitude);
    })
    .catch((error) => {
        console.error("API 요청 중 오류가 발생했습니다.", error);
    });
var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(37.56682, 126.97865), // 지도의 중심좌표
        level: 6, // 지도의 확대 레벨
        mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
        layerControl: {
            showRoadLayer: false,
        },
    };
// 지도를 생성한다
var map = new kakao.maps.Map(mapContainer, mapOption);
var marker;
kakao.maps.event.addListener(map, "click", function (mouseEvent) {
    latlng = mouseEvent.latLng;
    if (marker) {
        marker.setPosition(latlng);
    } else {
        const markerImage = new kakao.maps.MarkerImage(
            "../Image/startmarker.png",
            new kakao.maps.Size(30, 30),
            {
                offset: new kakao.maps.Point(15, 30),
            }
        );
        marker = new kakao.maps.Marker({
            position: latlng,
            image: markerImage,
            map: map,
        });
        const infowindowContent = `<div style="padding:10px;">
                    <div id="latitude" style = "display:none">${latlng.Ma}</div>
                    <div id="longitude" style = "display:none">${latlng.La}</div>
                    <a href="#" onclick="getPosition(latlng)">길찾기</a></div>`;
        const infowindow = new kakao.maps.InfoWindow({
            content: infowindowContent,
            position: latlng,
            removable: true
        });
        kakao.maps.event.addListener(marker, "click", function () {
            infowindow.open(map, marker);
        });
    }
});

function setCenter(latitude, longitude) {
    var moveLatLon = new kakao.maps.LatLng(
        latitude,
        longitude
    );
    map.setCenter(moveLatLon);
}