const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const img = document.getElementById("img");
const spinner = document.getElementById("spinner");
const submitBtn = document.getElementById("submit-btn");
const output = document.getElementById("output");
const editIcon = document.getElementById("edit-icon");

let outputPath = path.join(os.homedir(), "imageshrink");

document.getElementById("output-path").innerText = outputPath;

// On upload image
img.addEventListener("change", (e) => {
  e.preventDefault();
  if (img.files[0]) {
    submitBtn.classList.remove("disabled");
  } else {
    submitBtn.classList.add("disabled");
  }
});

// On change output path
editIcon.addEventListener("click", () => {
  ipcRenderer.send("image:choose-path");
});

// On file submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  spinner.classList.remove("hidden");
  output.classList.remove("output");
  output.classList.add("output-loading");

  const imgPath = img.files[0].path;
  const quality = slider.value;

  ipcRenderer.send("image:minimize", {
    imgPath,
    quality,
    dest: outputPath,
  });
});

// On image minimized
ipcRenderer.on("image:optimised", () => {
  spinner.classList.add("hidden");
  output.classList.remove("output-loading");
  output.classList.add("output");

  M.toast({
    html: `Image resized to ${slider.value}% quality.`,
  });
});

// On chosen output path
ipcRenderer.on("image:selected-output", (e, path) => {
  outputPath = path;
  const displayOutputPath = formatOutputPath(path);
  document.getElementById("output-path").innerText = displayOutputPath;
});

function formatOutputPath(path) {
  const splitPath = path.split("/");
  if (splitPath.length <= 4) {
    return path;
  } else {
    return `${splitPath[0]}/${splitPath[1]}/${splitPath[2]}/.../${splitPath[splitPath.length - 1]}`;
  }
}
