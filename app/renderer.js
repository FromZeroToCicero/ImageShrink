const { ipcRenderer } = require("electron");

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const img = document.getElementById("img");
const spinner = document.getElementById("spinner");
const outputSpinner = document.getElementById("output-spinner");
const compressType = document.getElementById("compress-type");
const switchContainer = document.getElementById("switch-container");
const qualityContainer = document.getElementById("quality-container");
const submitBtn = document.getElementById("submit-btn");
const output = document.getElementById("output");
const editIcon = document.getElementById("edit-icon");

let outputPath;

compressType.addEventListener("change", (e) => {
  e.preventDefault();

  if (compressType.checked) {
    qualityContainer.classList.remove("hidden");
    switchContainer.classList.remove("switch-container");
  } else {
    qualityContainer.classList.add("hidden");
    switchContainer.classList.add("switch-container");
  }

  ipcRenderer.send("image:compress-type", compressType.checked);
});

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

  let alertText;
  if (compressType.checked) {
    alertText = `Image resized to ${slider.value}% quality.`;
  } else {
    alertText = "Image resized successfully.";
  }

  M.toast({
    html: alertText,
  });
});

// On image failed optimise
ipcRenderer.on("image:not-optimised", () => {
  spinner.classList.add("hidden");
  output.classList.remove("output-loading");
  output.classList.add("output");

  M.toast({
    html: `Failed to resize image.`,
  });
});

// On select output path for image
ipcRenderer.on("image:select-output-pending", () => {
  outputSpinner.classList.remove("hidden");
});

// On finish select output path
ipcRenderer.on("image:select-output-finished", () => {
  outputSpinner.classList.add("hidden");
});

// Get settings
ipcRenderer.on("settings:get", (e, settings) => {
  outputPath = settings.outputPath;
  const displayOutputPath = formatOutputPath(outputPath);
  document.getElementById("output-path").innerText = displayOutputPath;
});

// On receiving chosen output path
ipcRenderer.on("image:selected-output", (e, path) => {
  outputPath = path;
  const displayOutputPath = formatOutputPath(path);
  document.getElementById("output-path").innerText = displayOutputPath;

  outputSpinner.classList.add("hidden");

  ipcRenderer.send("settings:set", {
    outputPath: path,
  });
});

function formatOutputPath(path) {
  const splitPath = path.split("/");
  if (splitPath.length <= 4) {
    return path;
  } else {
    return `${splitPath[0]}/${splitPath[1]}/${splitPath[2]}/.../${splitPath[splitPath.length - 1]}`;
  }
}
