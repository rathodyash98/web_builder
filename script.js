const sidebarElements = document.querySelectorAll(".element-item");
const canvas = document.getElementById("canvas");
const editForm = document.getElementById("editForm");

let selectedElement = null;
let hoverStyleTag = null;

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

  // Append to canvas
  canvas.appendChild(newEl);

  // Make it draggable inside canvas (for reposition)
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
  // Text content (if text-based)
  const textInputs = ["H1", "P", "BUTTON", "A", "DIV"];
  document.getElementById("inputText").value = textInputs.includes(el.tagName)
    ? el.textContent
    : "";

  // Font size
  document.getElementById("inputFontSize").value =
    parseInt(window.getComputedStyle(el).fontSize) || "";

  // Font color
  document.getElementById("inputFontColor").value = rgbToHex(
    window.getComputedStyle(el).color
  );

  // Background color
  document.getElementById("inputBgColor").value = rgbToHex(
    window.getComputedStyle(el).backgroundColor
  );

  // Hover background color stored in dataset
  document.getElementById("inputHoverBgColor").value =
    el.dataset.hoverBgColor || "#ffffff";

  // Position
  document.getElementById("inputPosition").value =
    el.style.position || "static";

  // Top and left (for positioned elements)
  document.getElementById("inputTop").value = el.style.top
    ? parseInt(el.style.top)
    : 0;
  document.getElementById("inputLeft").value = el.style.left
    ? parseInt(el.style.left)
    : 0;
}

// Utility to convert rgb() to hex
function rgbToHex(rgb) {
  if (!rgb || rgb === "transparent") return "#ffffff";
  const rgbArr = rgb.match(/\d+/g);
  if (!rgbArr) return "#ffffff";
  return (
    "#" +
    rgbArr
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Apply changes from form to selected element
document.getElementById("applyBtn").addEventListener("click", () => {
  if (!selectedElement) return alert("Select an element first.");

  // Text content
  const text = document.getElementById("inputText").value;
  if (["H1", "P", "BUTTON", "A", "DIV"].includes(selectedElement.tagName)) {
    selectedElement.textContent = text;
  }

  // Font size
  const fontSize = document.getElementById("inputFontSize").value;
  if (fontSize) selectedElement.style.fontSize = fontSize + "px";

  // Font color
  const fontColor = document.getElementById("inputFontColor").value;
  selectedElement.style.color = fontColor;

  // Background color
  const bgColor = document.getElementById("inputBgColor").value;
  selectedElement.style.backgroundColor = bgColor;

  // Position
  const position = document.getElementById("inputPosition").value;
  selectedElement.style.position = position;

  // Top & Left offsets
  const top = document.getElementById("inputTop").value;
  const left = document.getElementById("inputLeft").value;
  if (position !== "static") {
    selectedElement.style.top = top ? top + "px" : "0";
    selectedElement.style.left = left ? left + "px" : "0";
  } else {
    selectedElement.style.top = "";
    selectedElement.style.left = "";
  }

  // Hover background color: store in data attribute and update style
  const hoverColor = document.getElementById("inputHoverBgColor").value;
  selectedElement.dataset.hoverBgColor = hoverColor;
  updateHoverStyle(selectedElement, hoverColor);
});

// Delete selected element
document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!selectedElement) return alert("Select an element to delete.");
  selectedElement.remove();
  selectedElement = null;
  editForm.reset();
});

// Update hover style for element
function updateHoverStyle(el, hoverColor) {
  // Remove old style if any
  if (el._hoverStyleTag) {
    el._hoverStyleTag.remove();
  }

  // Create new style tag
  const style = document.createElement("style");
  style.innerHTML = `
    .canvas-element[data-id="${el.dataset.id}"]:hover {
      background-color: ${hoverColor} !important;
    }
  `;
  document.head.appendChild(style);

  el._hoverStyleTag = style;
}

// Make element draggable inside canvas for repositioning
function makeElementDraggable(el) {
  el.style.position = "relative";

  el.setAttribute("draggable", true);

  el.addEventListener("dragstart", dragStartInsideCanvas);
  el.addEventListener("dragend", dragEndInsideCanvas);
}

// Variables to track drag position inside canvas
let dragTarget = null;
let startX, startY, origX, origY;

function dragStartInsideCanvas(e) {
  dragTarget = e.target;
  startX = e.clientX;
  startY = e.clientY;
  origX = parseInt(dragTarget.style.left) || 0;
  origY = parseInt(dragTarget.style.top) || 0;

  // For repositioning, element must be positioned absolutely or relative
  if (!["absolute", "relative", "fixed"].includes(dragTarget.style.position)) {
    dragTarget.style.position = "relative";
    dragTarget.style.left = "0px";
    dragTarget.style.top = "0px";
  }

  // To allow drop outside of canvas default behavior
  e.dataTransfer.setDragImage(new Image(), 0, 0);
}

function dragEndInsideCanvas(e) {
  if (!dragTarget) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  let newLeft = origX + dx;
  let newTop = origY + dy;

  // Boundaries inside canvas
  const rect = canvas.getBoundingClientRect();
  const elRect = dragTarget.getBoundingClientRect();

  // Clamp left & top inside canvas
  if (newLeft < 0) newLeft = 0;
  if (newTop < 0) newTop = 0;
  if (newLeft + elRect.width > rect.width) newLeft = rect.width - elRect.width;
  if (newTop + elRect.height > rect.height)
    newTop = rect.height - elRect.height;

  dragTarget.style.left = newLeft + "px";
  dragTarget.style.top = newTop + "px";

  dragTarget = null;

  // Update form values if dragged selected element
  if (selectedElement) fillEditForm(selectedElement);
}

// Deselect element on canvas click outside
canvas.addEventListener("click", () => {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
    selectedElement = null;
    editForm.reset();
  }
});
