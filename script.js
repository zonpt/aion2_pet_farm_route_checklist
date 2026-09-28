const STORAGE_KEY = "aion2-checklist-state";
const FACTION_KEY = "aion2-checklist-faction";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let faction = localStorage.getItem(FACTION_KEY) || "asmodians";

function mobId(groupIndex, mobIndex) {
  return `${faction}-g${groupIndex}-m${mobIndex}`;
}

function render() {
  const container = document.getElementById("groups");
  container.innerHTML = "";

  document.querySelectorAll(".faction-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.faction === faction);
  });

  const spawnGroups = spawnData[faction];

  spawnGroups.forEach((group, groupIndex) => {
    const groupEl = document.createElement("section");
    groupEl.className = "group";

    const header = document.createElement("div");
    header.className = "group-header";

    const direction = document.createElement("span");
    direction.className = "direction";
    direction.textContent = group.direction;
    header.appendChild(direction);

    const groupLabel = document.createElement("label");
    const groupCheckbox = document.createElement("input");
    groupCheckbox.type = "checkbox";
    groupCheckbox.addEventListener("change", () => {
      group.mobs.forEach((_, mobIndex) => {
        state[mobId(groupIndex, mobIndex)] = groupCheckbox.checked;
      });
      saveState(state);
      render();
    });
    groupLabel.appendChild(groupCheckbox);
    groupLabel.appendChild(document.createTextNode("Mark all"));
    header.appendChild(groupLabel);

    groupEl.appendChild(header);

    const list = document.createElement("ul");
    list.className = "mob-list";

    let checkedCount = 0;
    group.mobs.forEach((mob, mobIndex) => {
      const id = mobId(groupIndex, mobIndex);
      const checked = !!state[id];
      if (checked) checkedCount++;

      const li = document.createElement("li");
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = checked;
      checkbox.addEventListener("change", () => {
        state[id] = checkbox.checked;
        saveState(state);
        render();
      });

      const level = document.createElement("span");
      level.className = "level";
      level.textContent = `Lv${mob.level}`;

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = mob.name;

      label.appendChild(checkbox);
      label.appendChild(level);
      label.appendChild(name);
      li.appendChild(label);
      list.appendChild(li);
    });

    groupCheckbox.checked = checkedCount === group.mobs.length;
    if (checkedCount === group.mobs.length) {
      groupEl.classList.add("complete");
    }

    groupEl.appendChild(list);
    container.appendChild(groupEl);
  });

  updateProgress();
}

function updateProgress() {
  const spawnGroups = spawnData[faction];
  const totalMobs = spawnGroups.reduce((sum, group) => sum + group.mobs.length, 0);
  const doneMobs = Object.keys(state).filter((id) => id.startsWith(`${faction}-`) && state[id]).length;

  document.getElementById("progress-text").textContent = `${doneMobs} / ${totalMobs} done`;
  document.getElementById("progress-fill").style.width =
    totalMobs === 0 ? "0%" : `${(doneMobs / totalMobs) * 100}%`;
}

document.querySelectorAll(".faction-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    faction = btn.dataset.faction;
    localStorage.setItem(FACTION_KEY, faction);
    render();
  });
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("Clear the checklist for the current faction?")) return;
  Object.keys(state)
    .filter((id) => id.startsWith(`${faction}-`))
    .forEach((id) => delete state[id]);
  saveState(state);
  render();
});

render();
