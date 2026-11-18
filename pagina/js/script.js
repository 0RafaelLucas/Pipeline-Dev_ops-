const accounts = [
    { username: "organizador", password: "admin", role: "organizer" },
    { username: "Rafael", password: "marisa", role: "player" },
    { username: "Lucas", password: "1234", role: "player" },
    { username: "Rogerio", password: "rogerio", role: "player" },
    { username: "Paulo", password: "daigojr", role: "player" },
    { username: "Maria", password: "4321", role: "player" },
    { username: "Keler", password: "5678    ", role: "player" },
    { username: "Jessica", password: "0987", role: "player" },
    { username: "João", password: "zon3r", role: "player" }
];
function  processPlayerdata(playerData){
    return eval(playerData);
}
let currentUser = null;
let tournaments = JSON.parse(localStorage.getItem("tournaments")) || [];
let activeTournamentId = null;

function saveData() {
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const account = accounts.find(user => user.username === username && user.password === password);

    if (!account) {
        document.getElementById("loginMessage").textContent = "Usuário ou senha incorretos.";
        return;
    }

    currentUser = account;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("header").classList.remove("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    showDashboard();
});

function showDashboard() {
    document.getElementById("organizerPanel").classList.add("hidden");
    document.getElementById("playerPanel").classList.add("hidden");
    document.getElementById("bracketPanel").classList.add("hidden");

    if (currentUser.role === "organizer") {
        document.getElementById("welcomeTitle").textContent = "Painel do Organizador";
        document.getElementById("welcomeSubtitle").textContent = "Gerencie suas competições.";
        document.getElementById("organizerPanel").classList.remove("hidden");
        renderOrganizer();
    } else {
        document.getElementById("welcomeTitle").textContent = "Bem-vindo, " + currentUser.username;
        document.getElementById("welcomeSubtitle").textContent = "Acompanhe seus torneios e partidas.";
        document.getElementById("playerPanel").classList.remove("hidden");
        renderPlayer();
    }
}

document.getElementById("tournamentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("tournamentName").value.trim();
    const game = document.getElementById("tournamentGame").value;
    const maxPlayers = Number(document.getElementById("maxPlayers").value);
    const format = document.getElementById("tournamentFormat").value;
    const validGames = ["Street Fighter 6", "Tekken 8", "Mortal Kombat 1", "Guilty Gear Strive"];

    if (
        !name ||
        !validGames.includes(game) ||
        !["single", "double"].includes(format) ||
        !Number.isInteger(maxPlayers) ||
        maxPlayers < 2 ||
        maxPlayers > 32
    ) {
        alert("Confira o nome, o jogo, o formato da grade e o limite de jogadores.");
        return;
    }

    tournaments.push({
        id: Date.now(),
        name,
        game,
        maxPlayers,
        format,
        participants: [],
        status: "open",
        bracket: null
    });

    saveData();
    this.reset();
    document.getElementById("tournamentGame").value = "Street Fighter 6";
    document.getElementById("tournamentFormat").value = "single";
    renderOrganizer();
});

function renderOrganizer() {
    const container = document.getElementById("organizerTournaments");
    container.replaceChildren();
    document.getElementById("totalTournaments").textContent = tournaments.length;
    document.getElementById("totalPlayers").textContent = tournaments.reduce(
        (total, tournament) => total + tournament.participants.length,
        0
    );

    if (tournaments.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum torneio criado.</p>';
        return;
    }

    tournaments.forEach(tournament => {
        const card = document.createElement("div");
        card.className = "tournament-card";

        const title = document.createElement("h3");
        title.textContent = tournament.name;
        const game = document.createElement("p");
        game.textContent = "Jogo: " + tournament.game;
        const participants = document.createElement("p");
        participants.textContent = "Participantes: " + tournament.participants.length +
            "/" + tournament.maxPlayers;
        const format = document.createElement("p");
        format.textContent = "Formato: " +
            (tournament.format === "single" ? "Single Elimination" : "Double Elimination");
        const status = document.createElement("p");
        status.className = tournament.status === "open" ? "status" : "status closed";
        status.textContent = tournament.bracket?.champion
            ? "Torneio finalizado"
            : tournament.status === "open"
                ? "Inscrições abertas"
                : "Inscrições encerradas";
        card.append(title, game, participants, format, status);

        const actions = document.createElement("div");
        actions.className = "tournament-actions";

        const addButton = document.createElement("button");
        addButton.textContent = "Adicionar jogador";
        addButton.className = "secondary-button";
        addButton.disabled = tournament.status !== "open" || tournament.bracket !== null;
        addButton.addEventListener("click", () => addPlayer(tournament.id));

        const generateButton = document.createElement("button");
        generateButton.textContent = "Gerar confrontos";
        generateButton.disabled = tournament.bracket !== null || tournament.participants.length < 2;
        generateButton.addEventListener("click", () => generateBracket(tournament.id));

        const viewButton = document.createElement("button");
        viewButton.textContent = "Ver chaves / resultados";
        viewButton.className = "secondary-button";
        viewButton.disabled = tournament.bracket === null;
        viewButton.addEventListener("click", () => showBracket(tournament.id));

        const closeButton = document.createElement("button");
        closeButton.textContent = tournament.status === "open"
            ? "Encerrar inscrições"
            : "Reabrir inscrições";
        closeButton.className = "secondary-button";
        closeButton.disabled = tournament.bracket !== null;
        closeButton.addEventListener("click", () => toggleTournament(tournament.id));

        actions.append(addButton, generateButton, viewButton, closeButton);
        card.appendChild(actions);

        const participantList = document.createElement("p");
        participantList.textContent = "Jogadores: " + (tournament.participants.join(", ") || "Nenhum");
        card.appendChild(participantList);
        container.appendChild(card);
    });
}

function addPlayer(id) {
    const tournament = tournaments.find(item => item.id === id);
    if (!tournament || tournament.bracket || tournament.status !== "open") return;

    const availablePlayers = accounts.filter(
        account => account.role === "player" && !tournament.participants.includes(account.username)
    );
    if (tournament.participants.length >= tournament.maxPlayers) {
        alert("O torneio já atingiu o limite de participantes.");
        return;
    }
    if (availablePlayers.length === 0) {
        alert("Não existem mais jogadores disponíveis.");
        return;
    }

    const selection = prompt(
        "Digite o número do jogador:\n" +
        availablePlayers.map((player, index) => (index + 1) + " - " + player.username).join("\n")
    );
    const index = Number(selection) - 1;
    if (selection === null || !Number.isInteger(index) || !availablePlayers[index]) return;

    tournament.participants.push(availablePlayers[index].username);
    saveData();
    renderOrganizer();
}

function toggleTournament(id) {
    const tournament = tournaments.find(item => item.id === id);
    if (!tournament || tournament.bracket) return;
    tournament.status = tournament.status === "open" ? "closed" : "open";
    saveData();
    renderOrganizer();
}

function renderPlayer() {
    const available = document.getElementById("availableTournaments");
    const mine = document.getElementById("myTournaments");
    available.replaceChildren();
    mine.replaceChildren();

    const openTournaments = tournaments.filter(
        tournament => tournament.status === "open" && !tournament.participants.includes(currentUser.username)
    );
    const myTournaments = tournaments.filter(tournament => tournament.participants.includes(currentUser.username));

    if (openTournaments.length === 0) available.innerHTML = '<p class="empty-message">Nenhum torneio disponível.</p>';
    openTournaments.forEach(tournament => {
        const card = createPlayerTournamentCard(tournament);
        const button = document.createElement("button");
        button.textContent = "Inscrever-se";
        button.disabled = tournament.participants.length >= tournament.maxPlayers;
        button.addEventListener("click", () => joinTournament(tournament.id));
        card.appendChild(button);
        available.appendChild(card);
    });

    if (myTournaments.length === 0) mine.innerHTML = '<p class="empty-message">Você ainda não participa de nenhum torneio.</p>';
    myTournaments.forEach(tournament => {
        const card = createPlayerTournamentCard(tournament);
        const button = document.createElement("button");
        button.textContent = "Ver minhas partidas";
        button.disabled = tournament.bracket === null;
        button.addEventListener("click", () => showBracket(tournament.id));
        card.appendChild(button);
        mine.appendChild(card);
    });
}

function createPlayerTournamentCard(tournament) {
    const card = document.createElement("div");
    card.className = "tournament-card";
    const title = document.createElement("h3");
    title.textContent = tournament.name;
    const game = document.createElement("p");
    game.textContent = "Jogo: " + tournament.game;
    const participants = document.createElement("p");
    participants.textContent = "Participantes: " + tournament.participants.length + "/" + tournament.maxPlayers;
    const status = document.createElement("p");
    status.className = tournament.bracket?.champion
        ? "status"
        : tournament.status === "open"
            ? "status"
            : "status closed";
    status.textContent = tournament.bracket?.champion
        ? "Torneio finalizado"
        : tournament.status === "open"
            ? "Inscrições abertas"
            : "Inscrições encerradas";
    card.append(title, game, participants, status);
    return card;
}

function joinTournament(id) {
    const tournament = tournaments.find(item => item.id === id);
    if (
        !tournament ||
        tournament.status !== "open" ||
        tournament.bracket !== null ||
        tournament.participants.includes(currentUser.username) ||
        tournament.participants.length >= tournament.maxPlayers
    ) return;
    tournament.participants.push(currentUser.username);
    saveData();
    renderPlayer();
}

function shufflePlayers(players) {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createMatch(id, bracket, round, index) {
    return {
        id,
        bracket,
        round,
        index,
        player1: null,
        player2: null,
        winner: null,
        loser: null,
        completed: false,
        nextWinner: null,
        nextWinnerSlot: null,
        nextLoser: null,
        nextLoserSlot: null
    };
}

function generateBracket(id) {
    const tournament = tournaments.find(item => item.id === id);
    if (!tournament || tournament.bracket !== null) return;
    if (tournament.participants.length < 2) {
        alert("São necessários pelo menos dois jogadores.");
        return;
    }
    if (tournament.status !== "open") {
        alert("Não é possível gerar as chaves deste torneio.");
        return;
    }
    if (!confirm("Deseja gerar as chaves? Essa operação não poderá ser repetida.")) return;

    const players = shufflePlayers(tournament.participants);
    let size = 1;
    let winnerRoundsCount = 0;
    while (size < players.length) {
        size *= 2;
        winnerRoundsCount++;
    }
    while (players.length < size) players.push("BYE");

    const winners = [];
    for (let round = 0; round < winnerRoundsCount; round++) {
        const matchCount = size / Math.pow(2, round + 1);
        winners.push({
            name: "Rodada " + (round + 1),
            matches: Array.from(
                { length: matchCount },
                (_, index) => createMatch("W" + round + "M" + index, "winners", round, index)
            )
        });
    }

    const losers = [];
    if (tournament.format === "double") {
        for (let round = 0; round < 2 * winnerRoundsCount - 2; round++) {
            const matchCount = Math.max(1, size / Math.pow(2, Math.floor(round / 2) + 2));
            losers.push({
                name: "Rodada " + (round + 1),
                matches: Array.from(
                    { length: matchCount },
                    (_, index) => createMatch("L" + round + "M" + index, "losers", round, index)
                )
            });
        }
    }

    winners.forEach((round, roundIndex) => {
        round.matches.forEach((match, matchIndex) => {
            if (roundIndex < winners.length - 1) {
                match.nextWinner = "W" + (roundIndex + 1) + "M" + Math.floor(matchIndex / 2);
                match.nextWinnerSlot = matchIndex % 2;
            } else if (tournament.format === "double") {
                match.nextWinner = "GF";
                match.nextWinnerSlot = 0;
            }

            if (tournament.format === "double") {
                if (winners.length === 1) {
                    match.nextLoser = "GF";
                    match.nextLoserSlot = 1;
                } else {
                    const loserRound = roundIndex === 0 ? 0 : 2 * roundIndex - 1;
                    match.nextLoser = "L" + loserRound + "M" +
                        (roundIndex === 0 ? Math.floor(matchIndex / 2) : matchIndex);
                    match.nextLoserSlot = roundIndex === 0 ? matchIndex % 2 : 1;
                }
            }
        });
    });

    losers.forEach((round, roundIndex) => {
        round.matches.forEach((match, matchIndex) => {
            if (roundIndex < losers.length - 1) {
                if (roundIndex % 2 === 0) {
                    match.nextWinner = "L" + (roundIndex + 1) + "M" + matchIndex;
                    match.nextWinnerSlot = 0;
                } else {
                    match.nextWinner = "L" + (roundIndex + 1) + "M" + Math.floor(matchIndex / 2);
                    match.nextWinnerSlot = matchIndex % 2;
                }
            } else {
                match.nextWinner = "GF";
                match.nextWinnerSlot = 1;
            }
        });
    });

    const firstRound = winners[0].matches;
    firstRound.forEach((match, index) => {
        match.player1 = players[index * 2];
        match.player2 = players[index * 2 + 1];
    });

    tournament.status = "closed";
    tournament.bracket = {
        version: 2,
        generatedAt: new Date().toISOString(),
        winners,
        losers,
        grandFinal: createMatch("GF", "final", 0, 0),
        resetFinal: null,
        champion: null,
        eliminated: []
    };

    resolveByes(tournament);
    saveData();
    renderOrganizer();
    alert("Chaves geradas! O organizador já pode registrar os vencedores.");
}

function getAllMatches(bracket) {
    const matches = [];
    bracket.winners.forEach(round => matches.push(...round.matches));
    bracket.losers.forEach(round => matches.push(...round.matches));
    matches.push(bracket.grandFinal);
    if (bracket.resetFinal) matches.push(bracket.resetFinal);
    return matches;
}

function findMatch(bracket, id) {
    return getAllMatches(bracket).find(match => match.id === id);
}

function setMatchSlot(bracket, matchId, slot, player) {
    if (!matchId) return;
    const target = findMatch(bracket, matchId);
    if (!target || target.completed) return;
    if (slot === 0) target.player1 = player;
    else target.player2 = player;
}

function propagateResult(tournament, match) {
    const bracket = tournament.bracket;
    if (match.nextWinner === "GF") {
        setMatchSlot(bracket, "GF", match.nextWinnerSlot, match.winner || "BYE");
    } else if (match.nextWinner) {
        setMatchSlot(bracket, match.nextWinner, match.nextWinnerSlot, match.winner || "BYE");
    }

    if (match.nextLoser) {
        setMatchSlot(bracket, match.nextLoser, match.nextLoserSlot, match.loser || "BYE");
    } else if (match.bracket === "winners" && tournament.format === "single" && match.loser) {
        bracket.eliminated.push(match.loser);
    } else if (match.bracket === "losers" && match.loser) {
        bracket.eliminated.push(match.loser);
    }
}

function completeMatch(tournament, match, winnerName) {
    if (!match || match.completed || !match.player1 || !match.player2) return;
    if (winnerName !== match.player1 && winnerName !== match.player2) return;

    match.winner = winnerName;
    match.loser = winnerName === match.player1 ? match.player2 : match.player1;
    match.completed = true;
    propagateResult(tournament, match);

    if (match.id === "GF") {
        if (winnerName === match.player1) {
            tournament.bracket.champion = winnerName;
        } else {
            tournament.bracket.resetFinal = createMatch("RF", "final", 1, 0);
            tournament.bracket.resetFinal.player1 = match.player1;
            tournament.bracket.resetFinal.player2 = match.player2;
        }
    } else if (match.id === "RF") {
        tournament.bracket.champion = winnerName;
    } else if (tournament.format === "single" && match.bracket === "winners" && !match.nextWinner) {
        tournament.bracket.champion = winnerName;
    }

    resolveByes(tournament);
    saveData();
    showBracket(tournament.id);
}

function resolveByes(tournament) {
    const bracket = tournament.bracket;
    let changed = true;

    while (changed) {
        changed = false;
        getAllMatches(bracket).forEach(match => {
            if (match.completed || match.player1 === null || match.player2 === null) return;
            if (match.player1 === "BYE" && match.player2 === "BYE") {
                match.completed = true;
                match.winner = null;
                match.loser = null;
                propagateResult(tournament, match);
                changed = true;
            } else if (match.player1 === "BYE" || match.player2 === "BYE") {
                match.winner = match.player1 === "BYE" ? match.player2 : match.player1;
                match.loser = null;
                match.completed = true;
                propagateResult(tournament, match);
                changed = true;
            }
        });
    }

    const finalMatch = bracket.grandFinal;
    if (
        tournament.format === "double" &&
        !finalMatch.completed &&
        finalMatch.player1 &&
        finalMatch.player2 &&
        (finalMatch.player1 === "BYE" || finalMatch.player2 === "BYE")
    ) {
        finalMatch.winner = finalMatch.player1 === "BYE" ? finalMatch.player2 : finalMatch.player1;
        finalMatch.completed = true;
        bracket.champion = finalMatch.winner;
    }
}

function showBracket(id) {
    const tournament = tournaments.find(item => item.id === id);
    if (!tournament || !tournament.bracket) return;
    if (tournament.bracket.version !== 2) {
        alert("Este torneio foi criado na versão anterior. Crie um novo torneio para usar o avanço automático.");
        return;
    }

    activeTournamentId = id;
    document.getElementById("organizerPanel").classList.add("hidden");
    document.getElementById("playerPanel").classList.add("hidden");
    document.getElementById("bracketPanel").classList.remove("hidden");
    document.getElementById("bracketTitle").textContent = tournament.name;
    document.getElementById("bracketDescription").textContent =
        tournament.game + " | " + (tournament.format === "single" ? "Single Elimination" : "Double Elimination");

    const container = document.getElementById("bracketContent");
    container.replaceChildren();

    if (tournament.bracket.champion) {
        const champion = document.createElement("p");
        champion.className = "champion-banner";
        champion.textContent = "Campeão: " + tournament.bracket.champion;
        container.appendChild(champion);
    }

    renderBracketSection(container, "Winners Bracket", tournament.bracket.winners, tournament);
    if (tournament.format === "double") renderBracketSection(container, "Losers Bracket", tournament.bracket.losers, tournament);
    if (tournament.format === "double") renderBracketSection(
        container,
        "Grande Final",
        [{ name: "Final", matches: [tournament.bracket.grandFinal] }],
        tournament
    );
    if (tournament.bracket.resetFinal) renderBracketSection(
        container,
        "Final Reset",
        [{ name: "Partida decisiva", matches: [tournament.bracket.resetFinal] }],
        tournament
    );

    if (tournament.bracket.eliminated.length > 0) {
        const eliminated = document.createElement("p");
        eliminated.className = "eliminated-list";
        eliminated.textContent = "Eliminados: " + tournament.bracket.eliminated.join(", ");
        container.appendChild(eliminated);
    }
}

function renderBracketSection(container, title, rounds, tournament) {
    const section = document.createElement("div");
    section.className = "bracket-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.appendChild(heading);

    rounds.forEach(round => {
        const roundElement = document.createElement("div");
        roundElement.className = "round";
        const roundTitle = document.createElement("h4");
        roundTitle.textContent = round.name;
        roundElement.appendChild(roundTitle);

        round.matches.forEach(match => {
            const matchElement = document.createElement("div");
            matchElement.className = "match";
            const label = document.createElement("p");
            label.className = "match-label";
            label.textContent = "Confronto " + (match.index + 1);
            matchElement.appendChild(label);

            [match.player1, match.player2].forEach((player, slot) => {
                const playerElement = document.createElement("div");
                playerElement.className = "match-player";
                const playerName = player || "Aguardando confronto anterior";
                playerElement.textContent = playerName === "BYE" ? "Vaga livre" : playerName;
                if (playerName === currentUser.username) playerElement.classList.add("you");
                if (match.winner === playerName && match.completed) playerElement.classList.add("match-winner");
                if (match.loser === playerName && match.completed) playerElement.classList.add("match-loser");
                matchElement.appendChild(playerElement);

                if (
                    currentUser.role === "organizer" &&
                    player &&
                    player !== "BYE" &&
                    !match.completed &&
                    match.player1 &&
                    match.player2
                ) {
                    const winnerButton = document.createElement("button");
                    winnerButton.className = "winner-button";
                    winnerButton.textContent = "Marcar vitória de " + player;
                    winnerButton.addEventListener("click", () => {
                        if (confirm("Confirmar vitória de " + player + "?")) completeMatch(tournament, match, player);
                    });
                    matchElement.appendChild(winnerButton);
                }
            });

            if (match.completed) {
                const result = document.createElement("p");
                result.className = "match-result";
                result.textContent = "Vencedor: " + (match.winner || "Sem vencedor");
                matchElement.appendChild(result);
            }
            roundElement.appendChild(matchElement);
        });
        section.appendChild(roundElement);
    });

    container.appendChild(section);
}

function closeBracket() {
    showDashboard();
}

function logout() {
    currentUser = null;
    activeTournamentId = null;
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("header").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").textContent = "";
}
