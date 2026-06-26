// ==UserScript==
// @name         PokéLike Hunter
// @namespace    https://github.com/ortizmolinaisrael-lgtm/pokelike-hunter
// @version		 1.2
// @description  Auto hunter PokéLike
// @author       Israfix
// @match        *://pokelike.xyz/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ortizmolinaisrael-lgtm/Pokelike-hunter/main/pokelike-hunter.user.js
// @downloadURL  https://raw.githubusercontent.com/ortizmolinaisrael-lgtm/Pokelike-hunter/main/pokelike-hunter.user.js
// ==/UserScript==

(() => {

    let running = false;
    let attempt = 0;
    let interval = null;

    // =========================
    // UI
    // =========================

    const panel = document.createElement("div");
	panel.style.cssText = `
		position: fixed;
		top: 100px;
		right: 20px;
		width: 260px;
		background: #111;
		color: #fff;
		padding: 10px;
		z-index: 999999;
		font-family: Arial;
		border-radius: 10px;
		font-size: 12px;
		cursor: move;
		user-select: none;
`;

    panel.innerHTML = `
        <b>🎯 PokéLike Hunter V1.2</b>

        <textarea id="pk_list" style="width:100%;height:80px;"
		placeholder="Ejemplo:
		Squirtel
		Bulbasur
		Charmander"></textarea>

        <label>
            <input type="checkbox" id="pk_shiny">
            Solo shiny
        </label>

        <div>
            Intentos: <span id="pk_attempt">0</span>
        </div>

        <button id="pk_start">▶ Iniciar</button>
        <button id="pk_stop">⏸ Parar</button>
    `;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

panel.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.getBoundingClientRect().left;
    offsetY = e.clientY - panel.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top = (e.clientY - offsetY) + "px";
    panel.style.right = "auto";
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

    document.body.appendChild(panel);

    // =========================
    // UTILS
    // =========================

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    function pressR() {
        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: "r",
            code: "KeyR",
            keyCode: 82,
            which: 82,
            bubbles: true
        }));
    }

    function clickTarget() {
        const el = document.querySelector('image[href="img/sprites/g1/pokeball.png"]');
        if (!el) return false;

        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return true;
    }

    function getList() {
        return document.getElementById("pk_list")
            .value
            .split(/\n|,/)
            .map(x => x.trim())
            .filter(Boolean);
    }

    function isShiny(wrap) {
        return !!wrap.querySelector("img.poke-sprite.shiny");
    }

    function getName(wrap) {
        return wrap.querySelector("div.poke-name")
            ?.firstChild?.data
            ?.trim() || "";
    }

    function shouldStop(name, shiny, list, shinyOnly) {

        if (list.length === 0) {
            return shiny;
        }

        const inList = list.includes(name);
        if (!inList) return false;

        if (shinyOnly && !shiny) return false;

        return true;
    }

    function stop() {
        running = false;
        clearInterval(interval);
        interval = null;
    }

    function checkAll(wraps) {

        const list = getList();
        const shinyOnly = document.getElementById("pk_shiny").checked;

        for (const w of wraps) {

            const name = getName(w);
            const shiny = isShiny(w);

            if (shouldStop(name, shiny, list, shinyOnly)) {

                const msg = list.length === 0
                    ? `✨ SHINY ENCONTRADO: ${name}`
                    : `🎯 ENCONTRADO: ${name}${shiny ? " ✨SHINY✨" : ""}`;

                console.log(msg);
                alert(msg);

                stop();

                // ⏳ tiempo para capturarlo antes de que el juego cambie
                setTimeout(() => {
                    console.log("🟢 Pausa de captura activa (10s)");
                }, 100);

                return true;
            }
        }

        return false;
    }

    async function loop() {

        if (!clickTarget()) {
            stop();
            return;
        }

        await sleep(800);

        const wraps = document.querySelectorAll("div.poke-choice-wrap");

        if (checkAll(wraps)) return;

        wraps.forEach(w => {
            const btn = w.querySelector(".btn-secondary.btn-md");
            if (btn) btn.click();
        });

        await sleep(1200);

        const wraps2 = document.querySelectorAll("div.poke-choice-wrap");

        if (checkAll(wraps2)) return;

        pressR();

        attempt++;
        document.getElementById("pk_attempt").textContent = attempt;
    }

    function start() {
        if (running) return;
        running = true;

        // 🐌 MÁS LENTO para evitar perder el Pokémon
        interval = setInterval(loop, 3000);
    }

    document.getElementById("pk_start").onclick = start;
    document.getElementById("pk_stop").onclick = stop;

})();
