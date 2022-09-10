function addToggleButtonStyles() {
  const mainStylesheet = document.createElement("link")
  mainStylesheet.rel = "stylesheet"
  mainStylesheet.type = "text/css"
  mainStylesheet.href = chrome.runtime.getURL("content/main.css")
  document.querySelector("head").appendChild(mainStylesheet)
}

function injectToggleButton() {
  const parent = document.querySelector("#ak-side-navigation")
  const button = document.createElement("a")
  button.className = "float"
  button.id = "jirapp-tgl-btn-container"
  button.setAttribute("role", "button")
  button.style.backgroundColor = getThemeColor()
  button.style.cursor = "pointer"

  button.appendChild(getReadOnlyImg())

  button.addEventListener("click", toggleReadOnlyMode)
  parent.appendChild(button)
}

function getThemeColor() {
  let header = document.querySelector("header")
  if (!header) {
    return "#85CCFF"
  }
  return window
    .getComputedStyle(header, null)
    .getPropertyValue("background-color")
}

function generateContrastColor() {
  try {
    let [r, g, b] = getThemeColor()
      .replace("rgb(", "")
      .replace(")", "")
      .split(", ")
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white"
  } catch (err) {
    return "black"
  }
}

function getReadOnlyImg() {
  return getImgForToggleButton(
    "read-only",
    `icons/read_${generateContrastColor()}.svg`,
  )
}

function getEditImg() {
  return getImgForToggleButton(
    "editable",
    `icons/edit_${generateContrastColor()}.svg`,
  )
}

function getImgForToggleButton(id, src) {
  let icon = document.createElement("img")
  icon.id = id
  icon.className = "jirapp-tgl-btn-42"
  icon.src = chrome.runtime.getURL(src)
  icon.style.height = "30px"
  icon.style.margin = "10px"

  return icon
}

function toggleReadOnlyMode() {
  let currentStateImg = document.querySelector(".jirapp-tgl-btn-42")
  let button = document.querySelector("#jirapp-tgl-btn-container")
  if (currentStateImg.id === "read-only") {
    configureReadOnly(false, true)
    button.replaceChild(getEditImg(), button.childNodes[0])
  } else {
    configureReadOnly(true, true)
    button.replaceChild(getReadOnlyImg(), button.childNodes[0])
  }
}
