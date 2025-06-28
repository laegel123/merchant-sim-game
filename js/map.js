import { cities, openMerchantTradePopup, merchantManager } from "../main.js";

function createMarkers(cities) {
    const markersDiv = document.getElementById('markers');
    const mapImage = document.getElementById('mapImage');
    const mapWidth = mapImage.naturalWidth;
    const mapHeight = mapImage.naturalHeight;
    const svg = document.getElementById('mapLines');

    const drawnConnections = new Set();

    cities.forEach(city => {
        const marker = document.createElement('div');
        marker.className = 'city-marker';

        const hexWidth = 32;
        const hexHeight = 28;
        const offsetX = 16;
        const offsetY = 14;

        const x = city.q * hexWidth + offsetX;
        const y = city.r * hexHeight + offsetY;

        const xPercent = (x / mapWidth) * 200;
        const yPercent = (y / mapHeight) * 230;

        marker.style.left = `${xPercent}%`;
        marker.style.top = `${yPercent}%`;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = 'city: ' + city.name + '<br>population:' + city.population;
        document.body.appendChild(tooltip);

        marker.addEventListener('mouseover', (e) => {
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
        marker.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
        marker.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        marker.onclick = () => {
            document.querySelectorAll('.city-marker').forEach(m => {
                m.style.backgroundColor = 'red';
            });
            marker.style.backgroundColor = 'blue';

            const oldCircle = document.getElementById('city-highlight-circle');
            if (oldCircle) oldCircle.remove();

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("id", "city-highlight-circle");
            circle.setAttribute("cx", `${(x / mapWidth) * 200}%`);
            circle.setAttribute("cy", `${(y / mapHeight) * 230}%`);
            circle.setAttribute("r", "4%");
            circle.setAttribute("stroke", "blue");
            circle.setAttribute("stroke-width", "2");
            circle.setAttribute("fill", "none");
            svg.appendChild(circle);

            document.querySelectorAll('#mapLines line').forEach(line => line.setAttribute('stroke', 'black'));
            if (city.connections) {
                city.connections.forEach(targetName => {
                    const key = [city.name, targetName].sort().join('-');
                    document.querySelectorAll(`#mapLines line[data-key="${key}"]`).forEach(line => {
                        line.setAttribute('stroke', 'blue');
                    });
                });
            }

            let existingMoreBtn = document.getElementById('city-more-button');
            if (existingMoreBtn) existingMoreBtn.remove();

            const moreBtn = document.createElement('button');
            moreBtn.id = 'city-more-button';
            moreBtn.textContent = 'More';
            moreBtn.style.position = 'absolute';
            moreBtn.style.left = `${marker.offsetLeft + 71}px`;  // 마커 오른쪽으로 약간 떨어지게
            moreBtn.style.top = `${marker.offsetTop + 143}px`;  
            moreBtn.style.zIndex = '1000';
            document.body.appendChild(moreBtn);

            moreBtn.onclick = () => {
                const popup = document.createElement('div');

                popup.className = 'city-popup';
                popup.innerHTML = `
                    <div style="padding: 50px;">
                        <h2>${city.name}</h2>
                        <button id="popup-close-btn" class="popup-close-btn">Close</button>
                        <hr/>
                        <div style="display: flex; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><strong>Info:</strong> ${city.info}</p>
                                <p><strong>Population:</strong> ${city.population}</p>
                                <hr>
                                <div>
                                    <strong>Selling:</strong>
                                    <ul style="padding-left: 20px;">
                                        ${city.selling.map(item => `<li>${item.item} - ${item.price} gold</li>`).join('')}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Wanting:</strong>
                                    <ul style="padding-left: 20px;">
                                        ${city.wanting.map(item => `<li>${item.item} - ${item.price + city.profit} gold</li>`).join('')}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Merchants in City:</strong>
                                    <ul style="padding-left: 20px;">
                                        ${merchantManager.getMerchantsInCity(city.name).map(m => `<li><a href="#" class="merchant-link" data-merchant="${m.name}">${m.name} (${m.status})</a></li>`).join('') || '<li>None</li>'}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Available Merchants:</strong>
                                    <ul style="padding-left: 20px;">
                                        ${merchantManager.getMerchantsAvailableToMoveCity(city).map(m => `<li><a href="#" class="merchant-link" data-merchant="${m.name}">${m.name} (${m.city}) (${m.gold} gold)</a></li>`).join('') || '<li>None</li>'}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(popup);

                document.querySelectorAll('.merchant-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const merchantName = e.target.getAttribute('data-merchant');
                        const merchant = merchantManager.getMerchantsInCity(city.name).find(m => m.name === merchantName);
                        if (merchant) {
                            openMerchantTradePopup(merchant, city.name);
                        }
                    });
                });

                document.getElementById('popup-close-btn').onclick = () => {
                    popup.remove();
                };
            };

            let existingMoveBtn = document.getElementById('city-move-button');
            if (existingMoveBtn) existingMoreBtn.remove();

            const moveBtn = document.createElement('button');
            moveBtn.id = 'city-move-button';
            moveBtn.textContent = 'Move';
            moveBtn.style.position = 'absolute';
            moveBtn.style.left = `${marker.offsetLeft + 169}px`;
            moveBtn.style.top = `${marker.offsetTop + 143}px`;  
            moveBtn.style.zIndex = '1000';
            document.body.appendChild(moveBtn);

            // Add Move Popup logic
            moveBtn.onclick = () => {
                // Remove any existing move popup
                const existingMovePopup = document.getElementById('move-popup');
                if (existingMovePopup) existingMovePopup.remove();

                const movePopup = document.createElement('div');
                movePopup.id = 'move-popup';
                movePopup.className = 'move-popup';
                movePopup.style.position = 'absolute';
                movePopup.style.left = `${marker.offsetLeft + 169}px`;
                movePopup.style.top = `${marker.offsetTop + 180}px`;
                movePopup.style.zIndex = '1000';
                movePopup.style.backgroundColor = '#f9f3db';
                movePopup.style.border = '1px solid #333';
                movePopup.style.padding = '10px';
                movePopup.style.borderRadius = '5px';
                movePopup.style.maxWidth = '300px';

                const merchants = merchantManager.getMerchantsAvailableToMoveCity(city);
                if (merchants.length === 0) {
                    movePopup.innerHTML = '<strong>No available merchants to move.</strong>';
                } else {
                    movePopup.innerHTML = '<strong>Available Merchants:</strong><ul style="padding-left: 20px;">' +
                        merchants.map(m => `<li><a href="#" class="move-merchant-link" data-merchant="${m.name}">${m.name} (${m.city}) - ${m.gold} gold</a></li>`).join('') +
                        '</ul>';
                }

                document.body.appendChild(movePopup);
                document.querySelectorAll('.move-merchant-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const merchantName = e.target.getAttribute('data-merchant');
                        alert(`Movement started for ${merchantName}!`);
                        movePopup.remove();
                    });
                });
            };

        };

        markersDiv.appendChild(marker);
    });

    cities.forEach(city => {
        if (!city.connections) return;
        const startX = city.q * 32 + 16;
        const startY = city.r * 28 + 14;

        city.connections.forEach(targetName => {
            const targetCity = cities.find(c => c.name === targetName);
            const key = [city.name, targetName].sort().join('-');
            if (drawnConnections.has(key)) return;
            if (!targetCity) return;

            const endX = targetCity.q * 32 + 16;
            const endY = targetCity.r * 28 + 14;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", `${(startX / mapWidth) * 200}%`);
            line.setAttribute("y1", `${(startY / mapHeight) * 230}%`);
            line.setAttribute("x2", `${(endX / mapWidth) * 200}%`);
            line.setAttribute("y2", `${(endY / mapHeight) * 230}%`);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "1");
            line.setAttribute("stroke-dasharray", "4 2");
            line.setAttribute("data-key", key);
            svg.appendChild(line);
            drawnConnections.add(key);
        });
    });

    document.body.addEventListener('click', function (e) {
        const moreBtn = document.getElementById('city-more-button');
        const moveBtn = document.getElementById('city-move-button');
        const movePopup = document.getElementById('move-popup');
        const isClickOnMarker = e.target.closest('.city-marker');
        const isClickOnMoreBtn = e.target.id === 'city-more-button';
        const isClickOnMoveBtn = e.target.id === 'city-move-button';

        if (moreBtn && !isClickOnMarker && !isClickOnMoreBtn) {
            moreBtn.remove();
        }
        if (moveBtn && !isClickOnMarker && !isClickOnMoveBtn) {
            moveBtn.remove();
        }
        // Remove move popup if clicking elsewhere
        if (movePopup && !isClickOnMarker && !isClickOnMoveBtn && !e.target.closest('#move-popup')) {
            movePopup.remove();
        }
    });
}

export { createMarkers };