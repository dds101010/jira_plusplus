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

const JIRA_SECTION_SELECTORS = {
  title: {
    tag: 'div',
    attribute: {
      name: 'data-testid'
      mode: 'eq'
      value: 'issue-field-summary.ui.issue-field-summary-inline-edit--container'
    },
  },
  status: {
    tag: 'div',
    attribute: {
      name: 'data-test-id'
      mode: 'eq'
      value: 'issue.views.issue-base.context.status-and-approvals-wrapper.status-and-approval'
    },
  },
  description: {
    tag: 'div',
    attribute: {
      name: 'data-test-id'
      mode: 'eq'
      value: 'issue.views.field.rich-text.description'
    },
  },
  assignee: {
    tag: 'div',
    attribute: {
      name: 'data-test-id'
      mode: 'eq'
      value: 'issue.views.field.user.assignee'
    },
  },
  issueType: {
    tag: 'div',
    attribute: {
      name: 'data-testid'
      mode: 'eq'
      value: 'issue.views.issue-base.foundation.change-issue-type.tooltip--container'
    },
  },
  linkedIssues: {
    tag: 'div',
    attribute:{
      name: 'data-test-id'
      mode: 'eq'
      value: 'issue.views.issue-base.content.issue-links.group-container'
    },
    multiple: true
  },
  commentBox: {
    tag: 'div',
    attribute: {
      name: 'data-test-id'
      mode: 'eq'
      value: 'issue.activity.comment'
    },
  },
  commentActions: {
    tag: 'div',
    attribute: {
      name: 'data-testid'
      mode: 'reg'
      value: 'issue-comment-base.ui.comment.ak-comment.*-footer'
    },
    multiple: true
  },
  subtasks: {
    tag: 'div',
    attribute: {
      name: 'data-testid'
      mode: 'eq'
      value: 'issue.issue-view.views.common.child-issues-panel.issues-container'
    }
  },
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
