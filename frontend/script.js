async function startOSINTScan() {
    const inputField = document.getElementById('usernameInput');
    const username = inputField.value.trim();

    if (!username) {
        alert("Please enter a valid username first!");
        return;
    }

    const loader = document.getElementById('loadingStatus');
    const dashboard = document.getElementById('resultsDashboard');
    const cardsGrid = document.getElementById('platformCardsGrid');
    const targetBadge = document.getElementById('targetBadge');

    loader.classList.remove('hidden');
    dashboard.classList.add('hidden');
    cardsGrid.innerHTML = ''; 

    try {
        const response = await fetch('http://localhost:5000/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: username,
                type: 'username'
            })
        });

        if (!response.ok) {
            throw new Error("Server communication failure.");
        }

        const data = await response.json();
        targetBadge.innerText = `Target: @${data.target}`;

        for (const [platform, info] of Object.entries(data.results)) {
            const isFound = info.status === "Found";
            
            // 🌟 ૧૦૦% સુપર ફિક્સ લોજિક: અહીં આપણે કન્ફ્યુઝન વગર ડાયરેક્ટ જ પરફેક્ટ લિંક બનાવી દીધી છે!
            let finalProfileURL = "";
            if (platform === "GitHub") {
                finalProfileURL = "https://github.com" + data.target;
            } else if (platform === "Instagram") {
                finalProfileURL = "https://instagram.com" + data.target;
            } else if (platform === "Twitter/X") {
                finalProfileURL = "https://x.com" + data.target;
            }

            const cardHTML = `
                <div class="card">
                    <div>
                        <div class="card-header">
                            <span>${platform}</span>
                        </div>
                        <span class="status-badge ${isFound ? 'status-found' : 'status-notfound'}">
                            ${info.status}
                        </span>
                    </div>
                    ${isFound ? `
                        <div class="card-link">
                            <a href="${finalProfileURL}" target="_blank" rel="noopener noreferrer">View Profile ↗</a>
                        </div>
                    ` : ''}
                </div>
            `;
            cardsGrid.innerHTML += cardHTML;
        }

        loader.classList.add('hidden');
        dashboard.classList.remove('hidden');

    } catch (error) {
        loader.classList.add('hidden');
        alert("Could not connect to Python Backend!");
        console.error(error);
    }
}