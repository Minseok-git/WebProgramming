
var code_x;
var code_y;
var latitude = 37.566826, longitude = 126.9786567
var latlng;
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 1 // 지도의 확대 레벨
    };

// 지도를 생성합니다    
var map = new kakao.maps.Map(mapContainer, mapOption);

// 검색 값에 따라 지도 중심 위치 이동
function searchPlace() {
    var keyword = document.getElementById('search').value;
    // 카카오 장소 검색 서비스 초기화
    var places = new kakao.maps.services.Places();

    // 키워드로 장소 검색
    places.keywordSearch(keyword, function (results, status) {
        if (status === kakao.maps.services.Status.OK) {
            var place = results[0]; // 첫 번째 검색 결과 사용
            latlng = new kakao.maps.LatLng(place.y, place.x); // 검색 결과의 좌표
            map.setCenter(latlng); // 지도 중심 위치 변경

            var rs = dfs_xy_conv("toXY", latitude, longitude);
            var x = rs.x; // 변환된 x 좌표값
            var y = rs.y; // 변환된 y 좌표값
            var nx = x; // 변환된 x 좌표값
            code_x = nx;
            var ny = y; // 변환된 y 좌표값
            code_y = ny;

            // 행정동 주소 정보 표시
            searchAddrFromCoords(latlng, displayCenterInfo);
            console.log(initDate);
            weather(initDate);
        }
    });
}

function searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function displayCenterInfo(result, status) {
    if (status === kakao.maps.services.Status.OK) {
        var infoDiv = document.getElementById('searchResult');

        for (var i = 0; i < result.length; i++) {
            // 행정동의 region_type 값은 'H' 이므로
            if (result[i].region_type === 'H') {
                var address = result[i].address_name;
                console.log(address);
                infoDiv.innerHTML = address;
                // address 변수에 주소 정보가 들어있습니다.
                // 이후 필요한 작업을 수행하면 됩니다.
                break;
            }
        }

    }
}//지도


function searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function displayCenterInfo(result, status) {
    if (status === kakao.maps.services.Status.OK) {
        var infoDiv = document.getElementById('searchResult');

        for (var i = 0; i < result.length; i++) {
            // 행정동의 region_type 값은 'H' 이므로
            if (result[i].region_type === 'H') {
                var address = result[i].address_name;
                console.log(address);
                infoDiv.innerHTML = address;
                // address 변수에 주소 정보가 들어있습니다.
                // 이후 필요한 작업을 수행하면 됩니다.
                break;
            }
        }
    }
}

//좌표변환 함수
function dfs_xy_conv(code, v1, v2) {
    var RE = 6371.00877; // 지구 반경(km)
    var GRID = 5.0; // 격자 간격(km)
    var SLAT1 = 30.0; // 투영 위도1(degree)
    var SLAT2 = 60.0; // 투영 위도2(degree)
    var OLON = 126.0; // 기준점 경도(degree)
    var OLAT = 38.0; // 기준점 위도(degree)
    var XO = 43; // 기준점 X좌표(GRID)
    var YO = 136; // 기1준점 Y좌표(GRID)

    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code == "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        var theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    } else {
        rs['x'] = v1;
        rs['y'] = v2;
        var xn = v1 - XO;
        var yn = ro - v2 + YO;
        ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) - ra;
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        } else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) - theta;
            } else theta = Math.atan2(xn, yn);
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;
}

let time = new Date();
let year = time.getFullYear();
let hour = time.getHours();
let date = time.getDate();
let month = time.getMonth() + 1;
date = String(date).padStart(2, "0");
month = String(month).padStart(2, "0");
var initDate = year + month + date;
var minute = time.getMinutes();
hour = hour.toString();
hour = hour.padStart(2, "0");
if (minute <= 30) {
    minute = '00';
} else if (minute > 30) {
    minute = 30;
}
var current = hour + minute.toString();
// if (minute === '00') {
//     current -= 70;
// } else {
//     current -= 30;
// }
console.log(current);
function weather(initDate) {
    $.ajax({
        url: `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=bVOtrbHSQn25yctAurf54tQzh8L4pOxJk8cwYn6enkB/d2vGg9VybbOg3sEghdcqGRZuTUbpt5vBqXXWazAP1g==&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${initDate}&base_time=${current}&nx=${code_x}&ny=${code_y}`,
        success: function (result) {
            console.log(result);
            let items = result.response.body.items.item;
            let filteredItems = items.filter(item => item.category === 'RN1');
            console.log(filteredItems);
            makeTable(filteredItems);
        },
    });
}

function makeTable(src) {
    let tableHTML = "";
    src.forEach(item => {
        tableHTML += `
        <tr>
            <td>${item.fcstDate}</td>
            <td>${item.fcstTime}</td>
            <td>${item.fcstValue}</td>
        // </tr>`; date = String(date).padStart(2, "0");
    });

    $("table tbody").html(tableHTML);
}