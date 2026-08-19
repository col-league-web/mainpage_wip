const TWITCH_URL = 'https://www.twitch.tv/col_official';

const teams = [
    { name: 'Arcana', code: 'ARC', logo: 'Arcana.png' },
    { name: 'Bandle City', code: 'BAN', logo: 'BandleCity.png' },
    { name: 'Bilgewater', code: 'BIL', logo: 'Bilgewater.png' },
    { name: 'Black Roses', code: 'BLA', logo: 'BlackRoses.png' },
    { name: 'Camavor', code: 'CAM', logo: 'Camavor.png' },
    { name: 'Celestials', code: 'CEL', logo: 'Celestials.png' },
    { name: 'Darkins', code: 'DAR', logo: 'Darkins.png' },
    { name: 'Demacia', code: 'DEM', logo: 'Demacia.png' },
    { name: 'Demons', code: 'DMN', logo: 'Demons.png' },
    { name: 'Freljord', code: 'FRE', logo: 'Freljord.png' },
    { name: 'Ionia', code: 'ION', logo: 'Ionia.png' },
    { name: 'Ixtal', code: 'IXT', logo: 'Ixtal.png' },
    { name: 'Ninjas', code: 'NIN', logo: 'Ninjas.png' },
    { name: 'Noxus', code: 'NOX', logo: 'Noxus.png' },
    { name: 'Piltover', code: 'PIL', logo: 'Piltover.png' },
    { name: 'Shadow Isles', code: 'SHI', logo: 'ShadowIsles.png' },
    { name: 'Shurima', code: 'SHU', logo: 'Shurima.png' },
    { name: 'Targon', code: 'TAR', logo: 'Targon.png' },
    { name: 'Void', code: 'VOI', logo: 'Void.png' },
    { name: 'Zaun', code: 'ZAU', logo: 'Zaun.png' }
];

const form = document.querySelector('#matchGeneratorForm');
const team1Select = document.querySelector('#team1');
const team2Select = document.querySelector('#team2');
const preview = document.querySelector('#matchPreview');
const codeOutput = document.querySelector('#generatedCode');
const errorBox = document.querySelector('#generatorError');
const copyButton = document.querySelector('#copyCode');
const copyStatus = document.querySelector('#copyStatus');
const resetButton = document.querySelector('#resetGenerator');

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function logoPath(team) {
    return `assets/team-logos/${team.logo}`;
}

function populateTeams() {
    const options = teams.map((team, index) =>
        `<option value="${index}">${escapeHtml(team.name)}</option>`
    ).join('');

    team1Select.innerHTML = options;
    team2Select.innerHTML = options;
    team1Select.value = '0';
    team2Select.value = '1';
}

function setDefaultDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(19, 0, 0, 0);
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.querySelector('#startAt').value = localIso;
}

function selectedTeam(select) {
    return teams[Number(select.value)] || teams[0];
}

function formatRecord(wins, losses) {
    return `${Math.max(0, Number(wins) || 0)} VÝHER / ${Math.max(0, Number(losses) || 0)} PROHER`;
}

function formatDate(value) {
    if (!value) return { display: 'DOPLŇ DATUM', iso: '' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { display: 'DOPLŇ DATUM', iso: '' };

    const datePart = new Intl.DateTimeFormat('cs-CZ', {
        day: 'numeric',
        month: 'numeric'
    }).format(date);
    const timePart = new Intl.DateTimeFormat('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);

    return { display: `${datePart} · ${timePart}`, iso: value };
}

function updateTeamChoicePreview(targetId, team) {
    const target = document.querySelector(targetId);
    target.innerHTML = `
        <img src="${logoPath(team)}" alt="Logo týmu ${escapeHtml(team.name)}">
        <div><strong>${escapeHtml(team.name)}</strong><span>${escapeHtml(team.logo)}</span></div>
    `;
}

function readValues() {
    return {
        team1: selectedTeam(team1Select),
        team2: selectedTeam(team2Select),
        team1Record: formatRecord(form.team1Wins.value, form.team1Losses.value),
        team2Record: formatRecord(form.team2Wins.value, form.team2Losses.value),
        phase: form.phase.value,
        round: String(Math.max(1, Number(form.round.value) || 1)).padStart(2, '0'),
        date: formatDate(form.startAt.value),
        format: form.format.value,
        broadcast: form.broadcast.checked
    };
}

function createSnippet(values) {
    const team1Name = escapeHtml(values.team1.name);
    const team2Name = escapeHtml(values.team2.name);
    const broadcastBadge = values.broadcast
        ? `\n                <a class="match-badge match-badge--live" href="${TWITCH_URL}" target="_blank" rel="noopener">Twitch broadcast</a>`
        : '';

    return `<article class="match-card-new">
    <div class="match-team">
        <div class="team-mark"><img src="${logoPath(values.team1)}" alt="Logo týmu ${team1Name}"></div>
        <div>
            <div class="match-team__name">${team1Name}</div>
            <div class="match-team__record">${values.team1Record}</div>
        </div>
    </div>
    <div class="match-center">
        <div class="match-meta">${escapeHtml(values.phase)} · KOLO ${values.round}</div>
        <time class="match-time" datetime="${escapeHtml(values.date.iso)}">${escapeHtml(values.date.display)}</time>
        <div class="match-badges">
            <span class="match-badge">${escapeHtml(values.format)}</span>${broadcastBadge}
        </div>
    </div>
    <div class="match-team match-team--right">
        <div class="team-mark"><img src="${logoPath(values.team2)}" alt="Logo týmu ${team2Name}"></div>
        <div>
            <div class="match-team__name">${team2Name}</div>
            <div class="match-team__record">${values.team2Record}</div>
        </div>
    </div>
</article>`;
}

function validate(values, showMessage = true) {
    let message = '';
    if (values.team1.name === values.team2.name) {
        message = 'Vyber dva rozdílné týmy.';
    } else if (!form.startAt.value) {
        message = 'Doplň datum a čas zápasu.';
    }

    errorBox.hidden = !message || !showMessage;
    errorBox.textContent = message;
    return !message;
}

function render(showErrors = false) {
    const values = readValues();
    updateTeamChoicePreview('#team1Preview', values.team1);
    updateTeamChoicePreview('#team2Preview', values.team2);

    if (!validate(values, showErrors)) {
        if (showErrors) return false;
    }

    const snippet = createSnippet(values);
    preview.innerHTML = snippet;
    codeOutput.value = snippet;
    copyStatus.textContent = '';
    copyStatus.classList.remove('is-success');
    return true;
}

async function copyCode() {
    if (!render(true)) return;

    try {
        await navigator.clipboard.writeText(codeOutput.value);
    } catch {
        codeOutput.focus();
        codeOutput.select();
        document.execCommand('copy');
    }

    copyStatus.textContent = 'Kód je zkopírovaný. Teď ho vlož do zapasy.html.';
    copyStatus.classList.add('is-success');
}

form.addEventListener('input', () => render(false));
form.addEventListener('change', () => render(false));
form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!render(true)) return;
    codeOutput.focus();
});

copyButton.addEventListener('click', copyCode);
resetButton.addEventListener('click', () => {
    form.reset();
    team1Select.value = '0';
    team2Select.value = '1';
    setDefaultDate();
    errorBox.hidden = true;
    render(false);
});

populateTeams();
setDefaultDate();
render(false);
