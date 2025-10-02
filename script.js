// League Data Lookup - Calls Riot API via Lambda
const RIOT_API_URL = 'https://hzjr6pvwl3grlacd4wsudgyaja0mehty.lambda-url.ap-south-1.on.aws/'; // Replace with your Function URL

document.addEventListener('DOMContentLoaded', function() {
    const lookupBtn = document.getElementById('lookup-btn');
    const summonerNameInput = document.getElementById('summoner-name');
    const regionSelect = document.getElementById('region');
    const messageDiv = document.getElementById('lookup-message');
    const resultsDiv = document.getElementById('summoner-results');

    if (!lookupBtn || !summonerNameInput || !regionSelect || !messageDiv || !resultsDiv) {
        console.error('One or more required elements are missing in the HTML.');
        return;
    }

    lookupBtn.addEventListener('click', async function() {
        const summonerName = summonerNameInput.value.trim();
        const region = regionSelect.value;

        if (!summonerName) {
            showMessage('Please enter a summoner name', 'error');
            return;
        }

        // Show loading state
        lookupBtn.textContent = 'Looking up...';
        lookupBtn.disabled = true;
        messageDiv.style.display = 'none';
        resultsDiv.style.display = 'none';

        try {
            const response = await fetch(RIOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summonerName: summonerName,
                    region: region
                })
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                showMessage('Invalid response from server.', 'error');
                return;
            }

            if (response.ok) {
                displaySummonerData(data);
                showMessage('Summoner found!', 'success');
            } else {
                showMessage(data.error || 'Failed to fetch summoner data', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }

        // Reset button
        lookupBtn.textContent = 'Look Up Summoner';
        lookupBtn.disabled = false;
    });

    // Enter key support
    summonerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupBtn.click();
        }
    });
});

function displaySummonerData(data) {
    const resultsDiv = document.getElementById('summoner-results');
    const summonerInfo = document.getElementById('summoner-info');
    const championMastery = document.getElementById('champion-mastery');

    if (!resultsDiv || !summonerInfo || !championMastery) {
        console.error('Result elements missing in HTML.');
        return;
    }

    // Display summoner info
    if (data.summoner) {
        summonerInfo.innerHTML = `
            <div class="summoner-card">
                <h5>${data.summoner.name}</h5>
                <p>Level: ${data.summoner.level}</p>
            </div>
        `;
    } else {
        summonerInfo.innerHTML = '<p>No summoner info found.</p>';
    }

    // Display top champions
    if (Array.isArray(data.topChampions) && data.topChampions.length > 0) {
        const championsHtml = data.topChampions.map(champ => `
            <div class="champion-card">
                <p><strong>Champion ID:</strong> ${champ.championId}</p>
                <p><strong>Mastery Level:</strong> ${champ.championLevel}</p>
                <p><strong>Mastery Points:</strong> ${champ.championPoints.toLocaleString()}</p>
            </div>
        `).join('');

        championMastery.innerHTML = `
            <h5>Top Champions</h5>
            <div class="champions-grid">
                ${championsHtml}
            </div>
        `;
    } else {
        championMastery.innerHTML = '<p>No champion mastery data found.</p>';
    }

    resultsDiv.style.display = 'block';
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('lookup-message');
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `lookup-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide after 10 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 10000);
}
