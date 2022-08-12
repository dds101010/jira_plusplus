function updateHistoryAsDiff() {
  Array.from(
    document.querySelectorAll(
      'div[data-test-id="issue-history.ui.history-items.generic-history-item.history-item"]',
    ),
  )
    .filter((node) => !node.textContent.includes("DIFF_PROCESSED"))
    .filter((node) => node.textContent.includes("updated the Description"))
    .forEach((node) => {
      let diffDiv = node?.childNodes[1]?.childNodes[1]
      if (diffDiv && diffDiv.childNodes.length === 3) {
        let beforeText = diffDiv.childNodes[0].textContent
        let afterText = diffDiv.childNodes[2].textContent
        let diffHTML = generateDiffHTML(beforeText, afterText)
        if (diffHTML) {
          diffDiv.innerHTML = `<div>${diffHTML}</div><div style="display:none;">DIFF_PROCESSED</div>`
        }
      }
    })
}

function generateDiffHTML(beforeText, afterText) {
  try {
    let lines = patienceDiff(beforeText, afterText, false).lines

    let text = []
    let previousState = "white"
    let html = []

    for (let line of lines) {
      let currentState =
        line.aIndex == -1 ? "#C8F0BA" : line.bIndex == -1 ? "#FFCBBD" : "white"
      if (previousState === currentState) {
        text.push(line.line)
      } else {
        html.push(
          `<span style="background-color: ${previousState}">${text.join(
            "",
          )}</span>`,
        )
        text = [line.line]
        previousState = currentState
      }
    }
    html.push(
      `<span style="background-color: ${previousState}">${text.join(
        "",
      )}</span>`,
    )
    return html.join("")
  } catch (error) {
    console.error("JIRA++", `${error.name}: ${error.message}`)
    return undefined
  }
}

function observe() {
  const observer = new MutationObserver((mutationsList) => {
    if (mutationsList.length) {
      updateHistoryAsDiff()
    }
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
  })
}

function init() {
  observe()
}

init()
