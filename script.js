const sidebarElements = document.querySelectorAll(".element-item");
const canvas = document.getElementById("canvas");
const editForm = document.getElementById("editForm");

// Inputs
const inputText = document.getElementById("inputText");
const inputFontSize = document.getElementById("inputFontSize");
const inputFontColor = document.getElementById("inputFontColor");
const inputBgColor = document.getElementById("inputBgColor");
const inputHoverBgColor = document.getElementById("inputHoverBgColor");
const inputPosition = document.getElementById("inputPosition");
const inputTop = document.getElementById("inputTop");
const inputLeft = document.getElementById("inputLeft");
const inputWidth = document.getElementById("inputWidth");
const inputHeight = document.getElementById("inputHeight");

const inputImageSrc = document.getElementById("inputImageSrc");
const inputLinkHref = document.getElementById("inputLinkHref");
const inputLinkText = document.getElementById("inputLinkText");

const imageSrcGroup = document.getElementById("imageSrcGroup");
const linkHrefGroup = document.getElementById("linkHrefGroup");
const linkTextGroup = document.getElementById("linkTextGroup");

let selectedElement = null;

// Add dragstart listeners on sidebar items
sidebarElements.forEach((el) => {
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("element-type", el.dataset.type);
  });
});

// Handle dropping elements into canvas
function handleDrop(event) {
  event.preventDefault();

  // Remove placeholder if any
  const placeholder = canvas.querySelector(".placeholder");
  if (placeholder) placeholder.remove();

  const type = event.dataTransfer.getData("element-type");
  if (!type) return;

  const newEl = createElementByType(type);

  canvas.appendChild(newEl);

  makeElementDraggable(newEl);

  selectElement(newEl);
}

// Create element by type
function createElementByType(type) {
  let el;
  switch (type) {
    case "h1":
      el = document.createElement("h1");
      el.textContent = "Heading 1";
      break;
    case "p":
      el = document.createElement("p");
      el.textContent = "Sample paragraph text.";
      break;
    case "button":
      el = document.createElement("button");
      el.textContent = "Click Me";
      break;
    case "image":
      el = document.createElement("img");
      el.src = "https://via.placeholder.com/150";
      el.style.width = "150px";
      el.style.height = "auto";
      break;
    case "link":
      el = document.createElement("a");
      el.href = "#";
      el.textContent = "Example Link";
      el.target = "_blank";
      el.style.color = "#3498db";
      break;
    case "div":
      el = document.createElement("div");
      el.textContent = "Container";
      el.style.border = "1px solid #ccc";
      el.style.padding = "10px";
      el.style.background = "#f0f0f0";
      break;
    default:
      el = document.createElement("div");
      el.textContent = "Element";
  }

  el.classList.add("canvas-element");
  el.style.position = "relative";

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    selectElement(el);
  });

  return el;
}

// Select element and fill form
function selectElement(el) {
  if (selectedElement) selectedElement.classList.remove("selected");
  selectedElement = el;
  selectedElement.classList.add("selected");

  fillEditForm(selectedElement);
}

// Fill edit form inputs with selected element's properties
function fillEditForm(el) {
  // Show/hide image and link inputs depending on element type
  if (el.tagName === "IMG") {
    imageSrcGroup.style.display = "block";
  } else {
    imageSrcGroup.style.display = "none";
  }

  if (el.tagName === "A") {
    linkHrefGroup.style.display = "block";
    linkTextGroup.style.display = "block";
  } else {
    linkHrefGroup.style.display = "none";
    linkTextGroup.style.display = "none";
  }

  // Text content (for elements that support text)
  if ("textContent" in el && el.tagName !== "IMG") {
    inputText.value = el.textContent || "";
    inputText.disabled = false;
  } else if (el.tagName === "IMG") {
    inputText.value = "";
    inputText.disabled = true;
  } else {
    inputText.value = "";
    inputText.disabled = true;
  }

  // Font size
  const fontSize = window.getComputedStyle(el).fontSize;
  inputFontSize.value = parseInt(fontSize) || "";

  // Font color
  const fontColor = window.getComputedStyle(el).color;
  inputFontColor.value = rgbToHex(fontColor);

  // Background color
  const bgColor = window.getComputedStyle(el).backgroundColor;
  inputBgColor.value = rgbToHex(bgColor);

  // Hover background color - no direct way to get, leave as default
  inputHoverBgColor.value = "#ffffff";

  // Position
  inputPosition.value = el.style.position || "static";

  // Top & Left
  inputTop.value = parseInt(el.style.top) || 0;
  inputLeft.value = parseInt(el.style.left) || 0;

  // Width & Height
  inputWidth.value = parseInt(el.style.width) || el.offsetWidth || "";
  inputHeight.value = parseInt(el.style.height) || el.offsetHeight || "";

  // Image src
  if (el.tagName === "IMG") {
    inputImageSrc.value = el.src || "";
  } else {
    inputImageSrc.value = "";
  }

  // Link href and text
  if (el.tagName === "A") {
    inputLinkHref.value = el.href || "";
    inputLinkText.value = el.textContent || "";
  } else {
    inputLinkHref.value = "";
    inputLinkText.value = "";
  }
}

// Apply changes button click handler
document.getElementById("applyBtn").addEventListener("click", () => {
  if (!selectedElement) return;

  // Text content
  if (!inputText.disabled) {
    if (selectedElement.tagName !== "IMG") {
      selectedElement.textContent = inputText.value;
    }
  }

  // Font size
  if (inputFontSize.value) {
    selectedElement.style.fontSize = inputFontSize.value + "px";
  } else {
    selectedElement.style.fontSize = "";
  }

  // Font color
  if (inputFontColor.value) {
    selectedElement.style.color = inputFontColor.value;
  } else {
    selectedElement.style.color = "";
  }

  // Background color
  if (inputBgColor.value) {
    selectedElement.style.backgroundColor = inputBgColor.value;
  } else {
    selectedElement.style.backgroundColor = "";
  }

  // Hover background color - set via a custom data attribute and CSS class
  if (inputHoverBgColor.value) {
    selectedElement.dataset.hoverBgColor = inputHoverBgColor.value;
    addHoverStyle(selectedElement);
  } else {
    delete selectedElement.dataset.hoverBgColor;
    removeHoverStyle(selectedElement);
  }

  // Position
  selectedElement.style.position = inputPosition.value;

  // Top & Left (only if position != static)
  if (inputPosition.value !== "static") {
    selectedElement.style.top = inputTop.value + "px";
    selectedElement.style.left = inputLeft.value + "px";
  } else {
    selectedElement.style.top = "";
    selectedElement.style.left = "";
  }

  // Width & Height
  if (inputWidth.value) {
    selectedElement.style.width = inputWidth.value + "px";
  } else {
    selectedElement.style.width = "";
  }
  if (inputHeight.value) {
    selectedElement.style.height = inputHeight.value + "px";
  } else {
    selectedElement.style.height = "";
  }

  // Image src
  if (selectedElement.tagName === "IMG") {
    selectedElement.src = inputImageSrc.value || selectedElement.src;
  }

  // Link href and text
  if (selectedElement.tagName === "A") {
    selectedElement.href = inputLinkHref.value || "#";
    selectedElement.textContent = inputLinkText.value || "";
  }
});

// Delete element button
document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!selectedElement) return;
  selectedElement.remove();
  selectedElement = null;
  resetForm();
  showPlaceholderIfEmpty();
});

// Deselect element if click outside
canvas.addEventListener("click", () => {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement = null;
    resetForm();
  }
});

function resetForm() {
  editForm.reset();
  imageSrcGroup.style.display = "none";
  linkHrefGroup.style.display = "none";
  linkTextGroup.style.display = "none";
  inputText.disabled = false;
}

function showPlaceholderIfEmpty() {
  if (canvas.children.length === 0) {
    const p = document.createElement("p");
    p.className = "placeholder";
    p.textContent = "Drag elements here";
    canvas.appendChild(p);
  }
}

// Convert rgb() to hex color string
function rgbToHex(rgb) {
  if (!rgb) return "#000000";

  const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(rgb);
  if (!result) return "#000000";

  const r = parseInt(result[1]);
  const g = parseInt(result[2]);
  const b = parseInt(result[3]);

  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Add hover background color style dynamically for element
function addHoverStyle(el) {
  if (!el.dataset.hoverBgColor) return;

  // Create a style tag for this element if not exists
  let styleTag = el._hoverStyleTag;
  if (!styleTag) {
    styleTag = document.createElement("style");
    document.head.appendChild(styleTag);
    el._hoverStyleTag = styleTag;
  }

  const id =
    el.dataset.hoverStyleId ||
    `hover-bg-${Math.random().toString(36).slice(2)}`;
  el.dataset.hoverStyleId = id;
  el.classList.add(id);

  styleTag.textContent = `
    .${id}:hover {
      background-color: ${el.dataset.hoverBgColor} !important;
    }
  `;
}

function removeHoverStyle(el) {
  if (el._hoverStyleTag) {
    el._hoverStyleTag.remove();
    el._hoverStyleTag = null;
  }
  if (el.dataset.hoverStyleId) {
    el.classList.remove(el.dataset.hoverStyleId);
    delete el.dataset.hoverStyleId;
  }
}

// Make element draggable inside canvas by mouse dragging
function makeElementDraggable(el) {
  let isDragging = false;
  let startX, startY, origX, origY;

  el.style.position = el.style.position || "absolute";

  el.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    origX = parseInt(el.style.left) || el.offsetLeft;
    origY = parseInt(el.style.top) || el.offsetTop;

    selectElement(el);
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newX = origX + dx;
    let newY = origY + dy;

    // Boundaries inside canvas
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + elRect.width > canvasRect.width)
      newX = canvasRect.width - elRect.width;
    if (newY + elRect.height > canvasRect.height)
      newY = canvasRect.height - elRect.height;

    el.style.left = newX + "px";
    el.style.top = newY + "px";

    inputTop.value = newY;
    inputLeft.value = newX;
    inputPosition.value = "absolute";
    selectedElement.style.position = "absolute";
  });
}
