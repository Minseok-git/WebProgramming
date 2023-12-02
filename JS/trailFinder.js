var latlng;
var latitude;
var longitude;
var keyword;
var inputValue;
function saveKeyword() {
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
    inputValue = document.getElementById("inputMountain").value;
    const requestUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        inputValue
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
            } else {
                resultContainer.textContent = "산을 찾을 수 없습니다.";
            }
            setCenter(latitude, longitude);
        })
        .catch((error) => {
            console.error("API 요청 중 오류가 발생했습니다.", error);
        });
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
                    offset: new kakao.maps.Point(15, 30),   //마커의 중심위치를 설정한다.
                }
            );
            marker = new kakao.maps.Marker({
                position: latlng,
                image: markerImage,
                map: map,
            });
            const infowindowContent = `<div style="padding:10px;">
                    <a id="road" href="#" onclick="getPosition(latlng)">길찾기</a></div>`;
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
    function setCenter(latitude, longitude) {   //지도의 중심좌표를 변경하는 함수
        var moveLatLon = new kakao.maps.LatLng(
            latitude,
            longitude
        );
        map.setCenter(moveLatLon);
    }

    function requestAPI() {
        // API 요청을 위한 코드
        const baseURL = "http://api.vworld.kr/req/data";
        const key = "2B89CE68-2FE2-39FE-8559-3CACFCCAE6B3";
        const domain = "http://127.0.0.1:5500/";
        const resultContainer = document.getElementById("result");

        const mountainName = inputValue;
        if (mountainName.trim() === "") {
            return;
        }
        const geomFilter = "BOX(124,29,132,43)";

        const specialCharsRegex = /[%\s]/g;
        const sanitizedMountainName = mountainName.replace(specialCharsRegex, '');
        const encodedMountainName = encodeURIComponent(sanitizedMountainName);
        const modifiedAttrFilter = `mntn_nm:LIKE:${encodedMountainName.replace('%08', '')}`;

        const size = 1000;
        const requestUrl = `${baseURL}?service=data&request=GetFeature&data=LT_L_FRSTCLIMB&key=${key}&domain=${domain}&size=${size}&geomFilter=${geomFilter}&attrFilter=${modifiedAttrFilter}`;

        fetch(requestUrl)
            .then(response => response.json())
            .then(data => {
                displayTrails(data);
            })
            .catch(error => {
                console.error("Error:", error);
                resultContainer.innerHTML = "등산로 정보를 불러오는 중 오류가 발생했습니다.";
            });
    }

    function displayTrails(data) {
        const resultContainer = document.getElementById("result");

        if (data.response.status === "NOT_FOUND") {
            resultContainer.innerHTML = "일치하는 등산로 정보가 없습니다.";
            return;
        }

        const features = data.response.result.featureCollection.features;

        if (features.length === 0) {
            resultContainer.innerHTML = "일치하는 등산로 정보가 없습니다.";
            return;
        }
        const altitude = []; // 고도 정보를 가져오는 altitude를 담을 배열
        const positions = []; // 마커 위치와 내용을 담을 배열

        for (const feature of features) {
            const coordinates = feature.geometry.coordinates[0];
            const path = [];

            for (const coordinate of coordinates) {
                const lng = coordinate[0];
                const lat = coordinate[1];
                path.push(new kakao.maps.LatLng(lat, lng));
            }

            const difficulty = feature.properties.cat_nam;
            let strokeColor = "#db4040";// 기본 색상
            if (difficulty === "하") {
                strokeColor = "#00FF00";
            } else if (difficulty === "중") {
                strokeColor = "#FFFF00";
            } else if (difficulty === "상") {
                strokeColor = "#FF0000";
            }

            const polyline = new kakao.maps.Polyline({
                map: map,
                path: path,
                strokeWeight: 3,
                strokeColor: strokeColor,
                strokeOpacity: 1,
                strokeStyle: 'solid'
            });
            const pos = Math.floor(feature.geometry.coordinates[0].length / 2);
            const lat = feature.geometry.coordinates[0][pos][1];
            const lng = feature.geometry.coordinates[0][pos][0];

            const marker = {
                content: `
                <div class="customOverlay" style="font-size: 1px;">
                <div>고도:</div>
                <div>상행 시간: ${feature.properties.up_min}분</div>
                <div>하행 시간: ${feature.properties.down_min}분</div>
                <div>난이도: ${feature.properties.cat_nam}</div>
                </div>`,
                latlng: new kakao.maps.LatLng(lat, lng),
            };
            positions.push(marker);
            // 고도 정보를 가져오는 Promise를 생성하고 배열에 추가
            altitude.push(requestElevationData(lat, lng));
        }

        // 고도 정보를 모두 가져온 후에 마커를 생성하고 오버레이에 고도 정보를 포함하여 표시
        Promise.all(altitude)
            .then((elevations) => {
                for (let i = 0; i < positions.length; i++) {
                    const elevation = elevations[i];
                    const marker = new kakao.maps.Marker({
                        map: map,
                        position: positions[i].latlng,
                    });

                    const infowindow = new kakao.maps.InfoWindow({
                        content: positions[i].content.replace("<div>고도:</div>", `<div>고도: ${elevation}m</div>`),
                    });

                    kakao.maps.event.addListener(marker, "click", function () {
                        // 이미 열려있는 인포윈도우가 있을 경우 닫기
                        if (infowindow.getMap()) {
                            infowindow.close();
                        } else {
                            infowindow.open(map, marker);
                        }
                    });
                }
            })
            .catch((error) => {
                console.log("Failed to fetch elevation data:", error);
            });
    }
    requestAPI();
}
function getPosition(latlng) {
    // 인포윈도우 내에 있는 위도와 경도 값을 가져옵니다
    var latitude = latlng.Ma;
    var longitude = latlng.La;
    // 로컬스토리지에서 latitude, longitude 값이 존재하는 경우에는 삭제합니다.
    if (localStorage.getItem('latitude') && localStorage.getItem('longitude')) {
        localStorage.removeItem('latitude');
        localStorage.removeItem('longitude');
    }
    localStorage.setItem('latitude', latitude);
    localStorage.setItem('longitude', longitude);
    window.location.href = 'findRoad.html';
}
function requestElevationData(lat, lon) {   //고도정보를 받아오는 API 요청 함수 (구글 Maps)
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lon}&key=AIzaSyD-LQdZFFfqgPQtaXQEA9tVDtbQjipxSLs`;
    return fetch(url)
        .then((response) => response.json())
        .then((data) => Math.round(data.results[0].elevation))
        .catch((error) => {
            console.log("Elevation data request failed:", error);
            return null;
        });
}