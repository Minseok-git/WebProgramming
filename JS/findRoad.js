function fetchTransitRoutes() {

    navigator.geolocation.getCurrentPosition(
        function (position) {
            start_latitude = position.coords.latitude;
            start_longitude = position.coords.longitude;
            end_latitude = localStorage.getItem('latitude');
            end_longitude = localStorage.getItem('longitude');
            var mapContainer = document.getElementById('map'); // 지도를 표시할 div 
            var mapOption = {
                center: new kakao.maps.LatLng(start_latitude, start_longitude), // 지도의 중심좌표
                level: 8 // 지도의 확대 레벨
            };
            var map = new kakao.maps.Map(mapContainer, mapOption);

            var imageSrc = '../Image/StartMarker.png', // 마커이미지의 주소입니다    
                imageSize = new kakao.maps.Size(30, 30), // 마커이미지의 크기입니다
                imageOption = { offset: new kakao.maps.Point(15, 15) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

            // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
                markerPosition = [
                    {
                        title: '출발지',
                        latlng: new kakao.maps.LatLng(start_latitude, start_longitude)
                    },
                    {
                        title: '도착지',
                        latlng: new kakao.maps.LatLng(end_latitude, end_longitude)
                    }
                ]; // 마커가 표시될 위치입니다

            // 마커를 생성합니다
            for (var y = 0; y < markerPosition.length; y++) {
                var marker = new kakao.maps.Marker({
                    map: map,
                    title: markerPosition[y].title, // 마커의 타이틀 설정
                    position: markerPosition[y].latlng,
                    image: markerImage // 마커이미지 설정 
                });

                // 마커에 마우스를 올렸을 때 타이틀 표시
                kakao.maps.event.addListener(marker, 'mouseover', function () {
                    var content = '<div class="custom-infowindow">' + this.getTitle() + '</div>';
                    var infoWindow = new kakao.maps.InfoWindow({
                        content: content, // 커스텀 인포윈도우의 내용 설정
                        removable: true // 인포윈도우 닫기 버튼 표시
                    });
                    infoWindow.open(map, this);
                    this.infoWindow = infoWindow; // marker에 infoWindow를 저장합니다.
                });

                // 마커에서 마우스를 멀리 했을 때 타이틀 숨김
                kakao.maps.event.addListener(marker, 'mouseout', function () {
                    this.infoWindow.close(); // 저장된 infoWindow를 닫습니다.
                });
            }

            // 마커가 지도 위에 표시되도록 설정합니다
            marker.setMap(map);


            // TMAP API 요청 옵션
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    appKey: 'IeyFGfo7Cr9GsKJCrozfd75sJNDjv2tm9rufZS28'
                },
                body: JSON.stringify({
                    startX: start_longitude.toString(),
                    startY: start_latitude.toString(),
                    endX: localStorage.getItem('longitude'),
                    endY: localStorage.getItem('latitude'),
                    lang: 0,
                    format: 'json',
                    count: 10,
                })
            };

            // TMAP API 정보 요청
            fetch('https://apis.openapi.sk.com/transit/routes', options)
                .then(response => response.json())
                .then(response => {
                    if (response.hasOwnProperty('result')) {
                        var ErrorCode = document.createElement('div');
                        ErrorCode.className = 'error-code';
                        var status = response.result.status;
                        if (status == 11) {
                            ErrorCode.innerHTML = "출발지/도착지 간 거리가 가까워서서 탐색된 경로 없음"
                        } else if (status == 12) {
                            ErrorCode.innerHTML = "출발지에서 검색된 정류장 없어서 탐색된 경로 없음"
                        } else if (status == 13) {
                            ErrorCode.innerHTML = "도착지에서 검색된 정류장 없어서 탐색된 경로 없음"
                        } else if (status == 14) {
                            ErrorCode.innerHTML = "출발지/도착지 간 탐색된 대중교통경로가 없음"
                        }
                        document.body.appendChild(ErrorCode);
                        return;
                    }
                    var divElement = document.createElement('div');
                    divElement.className = 'route-result';
                    var itineraries = document.createElement('ul'); // 갈 수 있는 경로를 나타내는 ul 태그 생성
                    var plan = response.metaData.plan.itineraries; // 갈 수 있는 경로 종류를 나타내는 plan 변수
                    for (var i = 0; i < plan.length; i++) {
                        var time = plan[i].totalTime;
                        time = Math.round(time / 60);
                        var planLiElement = document.createElement('li');
                        planLiElement.textContent = (i + 1) + "번째 경로 " + "(" + (time) + "분 소요)";
                        var transport = plan[i].legs; // 교통 수단을 나타내는 transport 변수
                        var planOlElement = document.createElement('ol');
                        for (var j = 0; j < transport.length; j++) {
                            var transportLiElement = document.createElement('li');
                            if (transport[j].mode == "WALK") {
                                transportLiElement.textContent = "도보";
                                transportLiElement.dataset.type = "walk";
                            }
                            else if (transport[j].mode == "BUS") {
                                transportLiElement.textContent = "버스";
                                transportLiElement.dataset.type = "bus";
                            }
                            else if (transport[j].mode == "SUBWAY") {
                                transportLiElement.textContent = "지하철";
                                transportLiElement.dataset.type = "subway";
                            }
                            else if (transport[j].mode == "EXPRESSBUS") {
                                transportLiElement.textContent = "고속/시외버스";
                                transportLiElement.dataset.type = "expressbus";
                            }
                            else if (transport[j].mode == "TRAIN") {
                                transportLiElement.textContent = "기차";
                                transportLiElement.dataset.type = "train";
                            }
                            else if (transport[j].mode == "AIRPLANE") {
                                transportLiElement.textContent = "항공";
                                transportLiElement.dataset.type = "airplane";
                            }
                            else if (transport[j].mode == "FERRY") {
                                transportLiElement.textContent = "페리";
                                transportLiElement.dataset.type = "ferry";
                            }
                            else if (transport[j].mode == "TRANSFER") {
                                transportLiElement.textContent = "환승";
                                transportLiElement.dataset.type = "transfer";
                            }
                            planOlElement.appendChild(transportLiElement);

                            var routeDetailsOlElement = document.createElement('ol');
                            if (transport[j].mode == "WALK") {
                                if (transport[j].hasOwnProperty('steps')) {
                                    for (var x = 0; x < transport[j].steps.length; x++) {
                                        var routeDetailsLiElement = document.createElement('li');
                                        routeDetailsLiElement.textContent = transport[j].steps[x].description;
                                        routeDetailsLiElement.dataset.type = "exclude";
                                        routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                    }
                                }
                            }
                            else if (transport[j].mode == "BUS") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName;
                                    routeDetailsLiElement.dataset.type = "exclude";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }
                            else if (transport[j].mode == "SUBWAY") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName + "역";
                                    routeDetailsLiElement.dataset.type = "exclude";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }
                            else if (transport[j].mode == "EXPRESSBUS") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName + "역";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }
                            else if (transport[j].mode == "TRAIN") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName + "역";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }
                            else if (transport[j].mode == "AIRPLANE") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName + "공항";
                                    routeDetailsLiElement.dataset.type = "exclude";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }
                            else if (transport[j].mode == "FERRY") {
                                for (var x = 0; x < transport[j].passStopList.stationList.length; x++) {
                                    var routeDetailsLiElement = document.createElement('li');
                                    routeDetailsLiElement.textContent = transport[j].passStopList.stationList[x].stationName + "승강장";
                                    routeDetailsLiElement.dataset.type = "exclude";
                                    routeDetailsOlElement.appendChild(routeDetailsLiElement);
                                }
                            }

                            else if (transport[j].mode == "TRANSFER") {
                                var routeDetailsLiElement = document.createElement('li');
                                routeDetailsLiElement.textContent = transport[j].start.name + "에서 " + transport[j].end.name + "으로 환승";
                                routeDetailsLiElement.dataset.type = "exclude";
                                routeDetailsOlElement.appendChild(routeDetailsLiElement);
                            }
                            transportLiElement.appendChild(routeDetailsOlElement);
                        }
                        planLiElement.appendChild(planOlElement);
                        itineraries.appendChild(planLiElement);
                    }
                    divElement.appendChild(itineraries);
                    document.body.appendChild(divElement);
                })
                .catch(err => console.error(err));

        },
        function (error) {
            console.error('Error getting current location:', error);
        }
    );
}
