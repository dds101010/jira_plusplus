const JIRAPP_ATTR = "jirapp_processed"

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

function eventPropagationFunc(event) {
  event.stopImmediatePropagation()
}

function setPointerEvents(selector, readOnly, forced) {
  Array.from(document.querySelectorAll(selector))
    .filter((node) => forced || !node.getAttribute(JIRAPP_ATTR))
    .forEach((node) => {
      if (readOnly) {
        node.style.pointerEvents = "none"
      } else {
        node.style.pointerEvents = "auto"
      }
      node.setAttribute(JIRAPP_ATTR, true)
    })
}

function setEventPropagation(selector, readOnly, forced) {
  Array.from(document.querySelectorAll(selector))
    .filter((node) => forced || !node.getAttribute(JIRAPP_ATTR))
    .forEach((node) => {
      if (readOnly) {
        node.addEventListener("click", eventPropagationFunc, true)
      } else {
        node.removeEventListener("click", eventPropagationFunc, true)
      }
      node.setAttribute(JIRAPP_ATTR, true)
    })
}

function configureReadOnly(readOnly, forced) {
  // TODO: Current behavior is to make fields read-only. configuration and toggle features planned
  Object.values(JIRA_SELECTORS_EVENT_BLOCK).forEach((selector) => {
    setEventPropagation(selector, readOnly, forced)
  })

  Object.values(JIRA_SELECTORS_CLICK_BLOCK).forEach((selector) => {
    setPointerEvents(selector, readOnly, forced)
  })
}

const JIRA_SELECTORS_EVENT_BLOCK = {
  description: `div[data-test-id="issue.views.field.rich-text.description"]`,
  commentBox: `div[data-test-id="issue.activity.comment"]`,
}

const JIRA_SELECTORS_CLICK_BLOCK = {
  issueType: `div[data-testid="issue.views.issue-base.foundation.change-issue-type.tooltip--container"]`,
  title: `div[data-testid="issue-field-summary.ui.issue-field-summary-inline-edit--container"]`,
  contextFields: `[data-test-id="issue.views.issue-details.issue-layout.right-most-column"]`,
  commentActions: `div[data-testid^="issue-comment-base.ui.comment.ak-comment."][data-testid$="-footer"]`,
  linkedIssues: `div[data-test-id="issue.views.issue-base.content.issue-links.group-container"]`,
  customDescriptionFields: `[data-testid="issue.views.issue-details.issue-layout.container-left"] [data-testid^="issue.views.field"]`,
  subtasks: `div[data-testid="issue.issue-view.views.common.child-issues-panel.issues-container"]`,
}

function observe() {
  const observer = new MutationObserver((mutationsList) => {
    if (mutationsList.length) {
      updateHistoryAsDiff()
      configureReadOnly(true, false)
    }
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
  })
}

function init() {
  addToggleButtonStyles()
  injectToggleButton()
  observe()
}

init()
