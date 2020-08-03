const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const img = document.getElementById("img");
const spinner = document.getElementById("spinner");
const submitBtn = document.getElementById("submit-btn");
const output = document.getElementById("output");

document.getElementById("output-path").innerText = path.join(os.homedir(), "imageshrink");

// On upload image
img.addEventListener("change", (e) => {
  e.preventDefault();
  if (img.files[0]) {
    submitBtn.classList.remove("disabled");
  }
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
