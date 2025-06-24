import { openTradePopup, merchantManager } from "../main.js";

function createMarkers(cities) {
    console.log('Creating markers for cities:', cities);
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
            document.getElementById('city-name').textContent = city.name;
            document.getElementById('city-info').textContent = `Population: ${city.population}`;

            const sellingElement = document.getElementById('selling-items');
            sellingElement.innerHTML = '';
            city.selling.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.item} : ${item.price} gold`;
                sellingElement.appendChild(li);
            });

            const wantingElement = document.getElementById('wanting-items');
            wantingElement.innerHTML = '';
            city.wanting.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.item} : ${item.price} gold`;
                wantingElement.appendChild(li);
            });

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

            const merchantsInCity = merchantManager.getMerchantsInCity(city.name);
            console.log('Merchants in city:', merchantsInCity);
            const merchantList = document.getElementById('your-merchants');
            merchantList.innerHTML = '';
            merchantsInCity.filter(m => m.city === city.name).forEach(m => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.innerHTML = `<strong>${m.name}</strong> (city: ${m.city})`;
                link.href = '#';
                link.onclick = (e) => {
                    e.preventDefault();
                    openTradePopup(m, city.name);
                };
                li.appendChild(link);
                merchantList.appendChild(li);
            });
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
}

export { createMarkers };