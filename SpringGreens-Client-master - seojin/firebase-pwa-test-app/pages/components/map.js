import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import Navbar from './Navbar';
import OverlayContent from './alart';
import ImageSlider from './ImageSlider';

const Popup = ({ name, onSetDestination, storeData, error }) => {
  const baseUrl = "http://ec2-3-37-50-217.ap-northeast-2.compute.amazonaws.com:9090";

  const imagesWithNames = storeData?.data.shop_list.flatMap(shop =>
    shop.product.map(product => ({
      url: `${baseUrl}${product.product_image_url}`,
      name: product.product_name
    }))
  ) || [];

  const getTotalViewCount = (products) => {
    return products.reduce((sum, product) => sum + product.product_view_count, 0);
  };

  const handleSetDestination = async () => {
    try {
      const response = await fetch(`/api/map/set/destination/${encodeURIComponent(name)}`, {
        method: 'GET',
      });

      const data = await response.json();

      console.log('API 응답 status_code:', data.status_code);

      if (data.status_code === 200) {
        onSetDestination(data.data.latitude, data.data.longitude);
        console.log('목적지 설정:', data.data.latitude, data.data.longitude);
      } else {
        throw new Error(`목적지 설정 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('목적지 설정 오류:', error);
    }
  };

  return (
    <div className="pop-up-container">
      <div className="slider-container">
        {storeData ? <ImageSlider images={imagesWithNames} /> : <p>이미지 로딩 중...</p>}
      </div>
      <p className="title">{name}</p>

      {error && <p className="error">{error}</p>}

      {storeData ? (
        storeData.data.shop_list.map((shop, index) => (
          <div key={index} className="store-container">
            <div className="store-title">
              <span className="shop-name">{shop.shop_name}</span>
              <span className="view-count">{`${getTotalViewCount(shop.product)}`}</span>
            </div>
            <p className="store-info">{`${shop.shop_address_details} ${shop.shop_contact}`}</p>
          </div>
        ))
      ) : (
        <p>상점 정보 로딩 중...</p>
      )}

      <button
        className="enpoint-btn"
        onClick={handleSetDestination}
      >
        목적지 설정
      </button>

      <style jsx>{`
        .pop-up-container {
          display: flex;
          flex-direction: column;
          width: 253px;
          padding-top: 20px;
          border-radius: 10px;
          background: rgba(34, 34, 34, 0.99);
          align-items: center;
        }
        .slider-container {
          width: 205px;
          height: 132px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
        }
        .title {
          width: 200px;
          color: #FFF;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 1px;
        }
        .store-container {
          width: 207px;
          border-radius: 2px;
          background: #4C4C4C;
          margin-bottom: 8px;
          padding-bottom: 8px;
        }
        .store-title {
          width: 207px;
          padding: 4px 0;
          background: #304FFE;
          color: #FFF;
          font-family: NanumSquare_ac;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .shop-name {
          flex-grow: 1;
          text-align: left;
          padding-left: 10px;
        }
        .view-count {
          flex-shrink: 0;
          padding-right: 10px;
        }
        .store-info, .product-info {
          color: #FFF;
          font-family: NanumSquare_ac;
          font-size: 12px;
          text-align: center;
          margin: 4px 0;
        }
        .enpoint-btn {
          display: flex;
          padding: 10px;
          justify-content: center;
          align-items: center;
          border-radius: 6px;
          background: #304FFE;
          color: #FFF;
          border: none;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .error {
          color: red;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};


function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 1) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = useCallback(debounce((value) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(value, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const uniqueSuggestions = [...new Set(result.map(item => item.place_name))];
          setSuggestions(uniqueSuggestions.slice(0, 5));
          setShowSuggestions(true);
        }
      });
    }
  }, 300), []);

  return (
    <div style={{
      position: 'absolute',
      top: '3.5rem',
      left: '10px',
      right: '10px',
      zIndex: 11
    }}>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="장소를 검색하세요"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '20px',
            border: '0px solid #222222',
            fontSize: '14px'
          }}
        />
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          backgroundColor: 'white',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 11
        }}>
          {suggestions.map((suggestion, index) => (
            <li 
              key={index}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
                setShowSuggestions(false);
              }}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Map = () => {
  const [map, setMap] = useState(null);
  const [kakao, setKakao] = useState(null);
  const [stores, setStores] = useState([]);
  const markersRef = useRef({});
  const activeInfoWindowRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);
  const [userCircle, setUserCircle] = useState(null);
  const [destinationCircle, setDestinationCircle] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [distanceOverlay, setDistanceOverlay] = useState(null);
  const [isCirclesOverlapping, setIsCirclesOverlapping] = useState(false);
  const [overlapOverlay, setOverlapOverlay] = useState(null);
  const [showIcon, setShowIcon] = useState(false);
  const [distanceWorker, setDistanceWorker] = useState(null);

  const R = 30;
  const r = 30;

  useEffect(() => {
    const worker = new Worker('distanceWorker.js');
    setDistanceWorker(worker);
    return () => worker.terminate();
  }, []);

  const calculateDistanceAsync = useCallback((lat1, lon1, lat2, lon2) => {
    return new Promise((resolve) => {
      distanceWorker.onmessage = (e) => resolve(e.data);
      distanceWorker.postMessage({ lat1, lon1, lat2, lon2 });
    });
  }, [distanceWorker]);

  const fetchStoreData = async (storeName) => {
    try {
      const response = await fetch(`/api/store/${encodeURIComponent(storeName)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching store data:", error);
      throw error;
    }
  };

const fetchMallStreetData = async () => {
  try {
    const response = await fetch('/api/map/get/mall/street');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching mall street data:", error);
    throw error;
  }
};

  const removeAllMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach(({ marker }) => marker.setMap(null));
    markersRef.current = {};
    if (userMarker) userMarker.setMap(null);
    if (destinationMarker) destinationMarker.setMap(null);
  }, [userMarker, destinationMarker]);

  const updateCircleColors = useCallback(async (userPosition, destPosition) => {
  if (!userCircle || !destinationCircle) {
    console.error('User circle or destination circle is not initialized');
    return;
  }

  const d = await calculateDistanceAsync(
    userPosition.getLat(), userPosition.getLng(),
    destPosition.getLat(), destPosition.getLng()
  ) * 1000;

  const isOverlapping = d <= R + r;
  const strokeColor = isOverlapping ? '#FF0000' : '#304FFE';
  const fillColor = isOverlapping ? '#FF0000' : '#304FFE';

  userCircle.setOptions({ 
    strokeColor: strokeColor, 
    fillColor: fillColor,
    strokeOpacity: 0.8,
    fillOpacity: 0.3
  });
  destinationCircle.setOptions({ 
    strokeColor: strokeColor, 
    fillColor: fillColor,
    strokeOpacity: 0.8,
    fillOpacity: 0.3
  });

  setIsCirclesOverlapping(isOverlapping);

  if (isOverlapping) {
    // 모든 마커 제거
    Object.values(markersRef.current).forEach(({ marker, infowindow }) => {
      if (marker) marker.setMap(null);
      if (infowindow) infowindow.close();
    });
    markersRef.current = {};

    // 사용자 마커와 목적지 마커 제거
    if (userMarker) userMarker.setMap(null);
    if (destinationMarker) destinationMarker.setMap(null);

    if (overlapOverlay) {
      overlapOverlay.setMap(null);
    }

    const overlayContainer = document.createElement('div');
    Object.assign(overlayContainer.style, {
      width: '18rem',
      height: '12.3125rem',
      borderRadius: '0.9375rem',
      backgroundColor: '#FFF',
      position: 'relative',
      zIndex: '10'
    });
    const newOverlay = new kakao.maps.CustomOverlay({
      content: overlayContainer,
      map: map,
      position: userPosition,
      zIndex: 10000 // 높은 zIndex 값 설정
    });

    ReactDOM.render(
      <OverlayContent 
        onClose={() => {
          newOverlay.setMap(null);
          setShowIcon(true);
        }}
        onMove={() => {
          console.log("Move button clicked");
        }}
      />,
      overlayContainer
    );

    setOverlapOverlay(newOverlay);
  } else if (overlapOverlay) {
    overlapOverlay.setMap(null);
  }
}, [map, kakao, userCircle, destinationCircle, R, r, overlapOverlay, userMarker, destinationMarker, calculateDistanceAsync]);
  
  useEffect(() => {
    if (isCirclesOverlapping && overlapOverlay) {
      overlapOverlay.setMap(map);
    } else if (overlapOverlay) {
      overlapOverlay.setMap(null);
    }
  }, [isCirclesOverlapping, overlapOverlay, map]);

  useEffect(() => {
    return () => {
      if (overlapOverlay) {
        overlapOverlay.setMap(null);
      }
    };
  }, [overlapOverlay]);

  const setDestination = useCallback(async (destLat, destLng) => {
  if (map && kakao) {
    Object.values(markersRef.current).forEach(({ marker }) => marker.setMap(null));
    markersRef.current = {};

    [destinationCircle, polyline].forEach(item => item && item.setMap(null));

    const destPosition = new kakao.maps.LatLng(destLat, destLng);
    if (destinationMarker) {
      destinationMarker.setPosition(destPosition);
    } else {
      const newDestMarker = new kakao.maps.Marker({
        position: destPosition,
        map: map
      });
      setDestinationMarker(newDestMarker);
    }

    const newDestCircle = new kakao.maps.Circle({
      center: destPosition,
      radius: R,
      strokeWeight: 2,
      strokeColor: '#304FFE',  // 원의 테두리 색상
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      fillColor: '#304FFE',    // 원의 내부 색상
      fillOpacity: 0.3,        // 투명도 조정
      map: map
    });
    setDestinationCircle(newDestCircle);

    const userPosition = userMarker ? userMarker.getPosition() : map.getCenter();
    const userLat = userPosition.getLat();
    const userLng = userPosition.getLng();

    const distance = await calculateDistanceAsync(userLat, userLng, destLat, destLng);
    if (distanceOverlay) distanceOverlay.setMap(null);
    const newDistanceOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng((userLat + destLat) / 2, (userLng + destLng) / 2),
      content: `<div style="padding:5px;background:rgba(255,255,255,0.7);border-radius:5px;color:black;">${(distance * 1000).toFixed(0)}m</div>`,
      map: map
    });
    setDistanceOverlay(newDistanceOverlay);

    const newPolyline = new kakao.maps.Polyline({
      path: [userPosition, destPosition],
      strokeWeight: 3,
      strokeColor: '#686D76',
      strokeOpacity: 0.7,
      strokeStyle: 'solid'
    });
    newPolyline.setMap(map);
    setPolyline(newPolyline);

    const bounds = new kakao.maps.LatLngBounds();
    bounds.extend(userPosition);
    bounds.extend(destPosition);
    map.setBounds(bounds);

    updateCircleColors(userPosition, destPosition);

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const newWatchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newUserLat = position.coords.latitude;
        const newUserLng = position.coords.longitude;
        const newUserPosition = new kakao.maps.LatLng(newUserLat, newUserLng);
        
        userMarker.setPosition(newUserPosition);
        userCircle.setPosition(newUserPosition);
        
        updateCircleColors(newUserPosition, destPosition);
        
        newPolyline.setPath([newUserPosition, destPosition]);
        
        const newDistance = await calculateDistanceAsync(newUserLat, newUserLng, destLat, destLng);
        newDistanceOverlay.setPosition(new kakao.maps.LatLng((newUserLat + destLat) / 2, (newUserLng + destLng) / 2));
        newDistanceOverlay.setContent(`<div style="padding:5px;background:white;border-radius:5px;color: black;">${(newDistance * 1000).toFixed(0)}m</div>`);
      },
      (error) => {
        console.error("Error watching user location:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    setWatchId(newWatchId);

    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    setStores([{ name: "목적지", lat: destLat, lng: destLng }]);
  }
}, [map, kakao, userMarker, userCircle, destinationCircle, destinationMarker, polyline, watchId, distanceOverlay, updateCircleColors, R, calculateDistanceAsync]);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (distanceOverlay) {
        distanceOverlay.setMap(null);
      }
    };
  }, [watchId, distanceOverlay]);

const addStoreMarker = useCallback((lat, lng, name, id) => {
  if (!map || !kakao) {
    console.error('Map or Kakao object is not initialized');
    return null;
  }

  const position = new kakao.maps.LatLng(lat, lng);
  const marker = new kakao.maps.Marker({
    position: position,
    map: map,
    zIndex: 1
  });

  const content = document.createElement('div');
  const infowindow = new kakao.maps.InfoWindow({
    content: content,
    zIndex: 2
  });

  kakao.maps.event.addListener(marker, 'click', function() {
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
    }
    
    ReactDOM.render(
      <Popup 
        name={name} 
        lat={lat} 
        lng={lng} 
        onSetDestination={setDestination}
        storeData={null}
      />,
      content
    );

    infowindow.open(map, marker);
    activeInfoWindowRef.current = infowindow;

    // 마커 클릭 후 짧은 시간 동안 지도 클릭 이벤트를 무시
    const clickTimeout = setTimeout(() => {
      kakao.maps.event.addListener(map, 'click', closeInfoWindow);
    }, 100);

    fetch(`/api/map/get/products/map/${encodeURIComponent(name)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        ReactDOM.render(
          <Popup 
            name={name} 
            lat={lat} 
            lng={lng} 
            onSetDestination={setDestination}
            storeData={data}
          />,
          content
        );
      })
      .catch(error => {
        console.error("Error fetching store data:", error);
        ReactDOM.render(
          <Popup 
            name={name} 
            lat={lat} 
            lng={lng} 
            onSetDestination={setDestination}
            storeData={null}
            error="데이터를 불러오는 데 실패했습니다."
          />,
          content
        );
      });

    function closeInfoWindow() {
      infowindow.close();
      activeInfoWindowRef.current = null;
      kakao.maps.event.removeListener(map, 'click', closeInfoWindow);
      clearTimeout(clickTimeout);
    }
  });

  return { marker, infowindow };
}, [map, kakao, setDestination]);  

  const initializeMap = useCallback(() => {
  if (window.kakao && window.kakao.maps) {
    const mapContainer = document.getElementById('map');
    const mapOptions = {
      center: new window.kakao.maps.LatLng(36.9692, 127.8717),
      level: 3
    };
    const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOptions);
    setMap(kakaoMap);
    setKakao(window.kakao);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const userPosition = new window.kakao.maps.LatLng(userLat, userLng);

          kakaoMap.setCenter(userPosition);

          const marker = new window.kakao.maps.Marker({
            position: userPosition,
            map: kakaoMap
          });
          setUserMarker(marker);

          const circle = new window.kakao.maps.Circle({
            center: userPosition,
            radius: 30,
            strokeWeight: 2,
            strokeColor: '#304FFE',  // 원의 테두리 색상
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#304FFE',    // 원의 내부 색상
            fillOpacity: 0.3,        // 투명도 조정
            map: kakaoMap
          });
          setUserCircle(circle);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // 지도 클릭 이벤트 리스너 제거
    // kakaoMap.addListener('click', function(mouseEvent) { ... }); 부분 삭제
  }
}, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=카카오앱키&libraries=services&autoloafd=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(initializeMap);
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [initializeMap]);

  useEffect(() => {
    if (map && kakao) {
      Object.values(markersRef.current).forEach(({ marker, infowindow }) => {
        if (marker) marker.setMap(null);
        if (infowindow) infowindow.close();
      });
      markersRef.current = {};

      stores.forEach(store => {
        const markerInfo = addStoreMarker(store.lat, store.lng, store.name, store.id);
        if (markerInfo) {
          markersRef.current[store.id] = markerInfo;
        }
      });

      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
        activeInfoWindowRef.current = null;
      }
    }
  }, [map, kakao, stores, addStoreMarker]);

  const moveUserLocation = useCallback(async (lat, lng) => {
  if (map && kakao && userMarker && userCircle) {
    const newPosition = new kakao.maps.LatLng(lat, lng);

    // 사용자 마커와 원 이동
    userMarker.setPosition(newPosition);
    userCircle.setPosition(newPosition);  // setCenter 대신 setPosition 사용

    // 지도 중심 이동
    map.setCenter(newPosition);

    if (destinationCircle && destinationMarker) {
      const destPosition = destinationCircle.getPosition();
      
      // 원 색상 업데이트
      await updateCircleColors(newPosition, destPosition);
      
      // 폴리라인 업데이트
      if (polyline) {
        polyline.setPath([newPosition, destPosition]);
      } 

      // 거리 오버레이 업데이트
      const distance = await calculateDistanceAsync(lat, lng, destPosition.getLat(), destPosition.getLng());
      if (distanceOverlay) {
        distanceOverlay.setPosition(new kakao.maps.LatLng((lat + destPosition.getLat()) / 2, (lng + destPosition.getLng()) / 2));
        distanceOverlay.setContent(`<div style="padding:5px;background:rgba(255,255,255,0.7);border-radius:5px;color:black;">${(distance * 1000).toFixed(0)}m</div>`);
      }

      // 지도 범위 재설정
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(newPosition);
      bounds.extend(destPosition);
      map.setBounds(bounds);
    }
  }
}, [map, kakao, userMarker, userCircle, destinationCircle, destinationMarker, polyline, distanceOverlay, updateCircleColors, calculateDistanceAsync]);
  
  const handleSearch = useCallback((query) => {
    if (map && kakao && kakao.maps.services) {
      const ps = new kakao.maps.services.Places();
      ps.keywordSearch(query, (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds();
          let newStores = [];

          Object.values(markersRef.current).forEach(({ marker, infowindow }) => {
            marker.setMap(null);
            infowindow.close();
          });
          markersRef.current = {};

          for (let i = 0; i < data.length; i++) {
            const markerPosition = new kakao.maps.LatLng(data[i].y, data[i].x);
            const newStore = {
              id: data[i].id,
              name: data[i].place_name,
              lat: data[i].y,
              lng: data[i].x,
              address: data[i].address_name,
              phone: data[i].phone
            };
            newStores.push(newStore);
            bounds.extend(markerPosition);

            const markerInfo = addStoreMarker(newStore.lat, newStore.lng, newStore.name, newStore.id);
            markersRef.current[newStore.id] = markerInfo;
          }

          map.setBounds(bounds);
          setStores(newStores);
        }
      });
    }
  }, [map, kakao, setStores, addStoreMarker]);
  
  const addMarkersByStoreNameList = useCallback(async () => {
    if (map && kakao && kakao.maps.services) {
      try {
        const mallStreetData = await fetchMallStreetData();
        
        Object.values(markersRef.current).forEach(({ marker, infowindow }) => {
          marker.setMap(null);
          infowindow.close();
        });
        markersRef.current = {};

        const bounds = new kakao.maps.LatLngBounds();
        const ps = new kakao.maps.services.Places();
        
        const searchAndAddMarker = async (storeName, index) => {
          return new Promise((resolve) => {
            ps.keywordSearch(storeName, (data, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const place = data[0];
                const lat = place.y;
                const lng = place.x;
                const position = new kakao.maps.LatLng(lat, lng);

                const markerInfo = addStoreMarker(lat, lng, storeName, index.toString());
                markersRef.current[index.toString()] = markerInfo;

                bounds.extend(position);
              } else {
                console.log(`No results found for ${storeName}`);
              }
              resolve();
            }, {
              location: new kakao.maps.LatLng(mallStreetData.data.standard_position.Latitude, mallStreetData.data.standard_position.longitude),
              radius: 5000
            });
          });
        };

        const chunks = chunkArray(mallStreetData.data.mall_name_list, 5);
        for (const chunk of chunks) {
          await Promise.all(chunk.map((storeName, index) => searchAndAddMarker(storeName, index)));
        }

        map.setBounds(bounds);
      } catch (error) {
        console.error("Error in addMarkersByStoreNameList:", error);
      }
    }
  }, [map, kakao, addStoreMarker, fetchMallStreetData]);
  
  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const updateUI = useCallback(() => {
    requestAnimationFrame(updateUI);
  }, []);

  useEffect(() => {
    requestAnimationFrame(updateUI);
  }, [updateUI]);

  const handleMallStreetButtonClick = () => {
    addMarkersByStoreNameList();
  };  

  return (
    <div style={{ position: 'relative', width: '360px', height: '640px' }}>
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
      <SearchBar onSearch={handleSearch} />
      <button 
        onClick={handleMallStreetButtonClick}
        style={{
          width: '6rem',
          height: '1.5rem',
          position: 'absolute',
          top: '6.5rem',
          padding: '0.38rem, 0.44rem',
          left: '20px',
          backgroundColor: '#304FFE',
          color: 'white',
          border: '1px solid rgba(0, 0, 0, 0.25)',
          borderRadius: '0.3125rem',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        상가거리이동
      </button>
      <Navbar />
      <button onClick={() => moveUserLocation(37.5678,127.014)} style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '10px',
        backgroundColor: '#304FFE',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 10
      }}>
        사용자 위치 이동
      </button>
      {showIcon && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          cursor: 'pointer',
          zIndex: 10
        }} onClick={() => {
          setShowIcon(false);
          if (overlapOverlay) {
            overlapOverlay.setMap(map);
          }
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group 232">
              <path id="Vector" d="M19 27H21.6667V19H19V27ZM20.3333 16.3333C20.7111 16.3333 21.028 16.2053 21.284 15.9493C21.54 15.6933 21.6676 15.3769 21.6667 15C21.6658 14.6231 21.5378 14.3067 21.2827 14.0507C21.0276 13.7947 20.7111 13.6667 20.3333 13.6667C19.9556 13.6667 19.6391 13.7947 19.384 14.0507C19.1289 14.3067 19.0009 14.6231 19 15C18.9991 15.3769 19.1271 15.6938 19.384 15.9507C19.6409 16.2076 19.9573 16.3351 20.3333 16.3333ZM20.3333 33.6667C18.4889 33.6667 16.7556 33.3164 15.1333 32.616C13.5111 31.9156 12.1 30.9658 10.9 29.7667C9.7 28.5676 8.75022 27.1564 8.05067 25.5333C7.35111 23.9102 7.00089 22.1769 7 20.3333C6.99911 18.4898 7.34934 16.7564 8.05067 15.1333C8.752 13.5102 9.70178 12.0991 10.9 10.9C12.0982 9.70089 13.5093 8.75111 15.1333 8.05067C16.7573 7.35022 18.4907 7 20.3333 7C22.176 7 23.9093 7.35022 25.5333 8.05067C27.1573 8.75111 28.5684 9.70089 29.7667 10.9C30.9649 12.0991 31.9151 13.5102 32.6173 15.1333C33.3196 16.7564 33.6693 18.4898 33.6667 20.3333C33.664 22.1769 33.3138 23.9102 32.616 25.5333C31.9182 27.1564 30.9684 28.5676 29.7667 29.7667C28.5649 30.9658 27.1538 31.916 25.5333 32.6173C23.9129 33.3187 22.1796 33.6684 20.3333 33.6667Z" fill="#3554FE"/>
              <circle id="Ellipse 14" cx="20" cy="20" r="20" fill="#3554FE" fillOpacity="0.25"/>
              <circle id="Ellipse 15" cx="20" cy="20" r="16" fill="#3554FE" fillOpacity="0.25"/>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Map;