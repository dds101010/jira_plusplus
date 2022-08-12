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

function setReadOnlyForSelector(selector, value) {
  let nodes = document.querySelectorAll(selector)
  if (nodes) {
    nodes.forEach((node) => {
      if (value) {
        // value passed, so set it
        node.style.pointerEvents = value
      } else {
        // toggle otherwise
        let current = node.style.pointerEvents
        node.style.pointerEvents =
          !current || current === "auto" ? "none" : "auto"
      }
    })
  }
}

function configureReadOnly() {
  // TODO: Current behavior is to make fields read-only. configuration and toggle features planned
  Object.values(JIRA_SECTION_SELECTORS).forEach((selector) =>
    setReadOnlyForSelector(selector, "none"),
  )
}

const JIRA_SECTION_SELECTORS = {
  title: `div[data-testid="issue-field-summary.ui.issue-field-summary-inline-edit--container"]`,
  status: `div[data-test-id="issue.views.issue-base.context.status-and-approvals-wrapper.status-and-approval"]`,
  description: `div[data-test-id="issue.views.field.rich-text.description"]`,
  assignee: `div[data-test-id="issue.views.field.user.assignee"]`,
  issueType: `div[data-testid="issue.views.issue-base.foundation.change-issue-type.tooltip--container"]`,
  linkedIssues: `div[data-test-id="issue.views.issue-base.content.issue-links.group-container"]`,
  commentBox: `div[data-test-id="issue.activity.comment"]`,
  commentActions: `div[data-testid*="issue-comment-base.ui.comment.ak-comment.*-footer"]`, //FIXME: doesn't work
  subtasks: `div[data-testid="issue.issue-view.views.common.child-issues-panel.issues-container"]`,
}

function observe() {
  const observer = new MutationObserver((mutationsList) => {
    if (mutationsList.length) {
      updateHistoryAsDiff()
      configureReadOnly()
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
