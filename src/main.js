const { layoutOptions, processData } = window;

const app = document.querySelector("#app");
const nodeTemplate = document.querySelector("#node-template");

const accentPalette = ["#2563eb", "#0ea5e9", "#22c55e", "#a855f7", "#f97316", "#ec4899"];

function cloneDeep(node) {
  return JSON.parse(JSON.stringify(node));
}

function applyLayoutDefaults(node) {
  if (!node.layout) node.layout = "vertical";
  if (!node.images) node.images = [];
  if (!node.links) node.links = [];
  node.children?.forEach(applyLayoutDefaults);
}

function getAccent(depth) {
  return accentPalette[depth % accentPalette.length];
}

function createEditableText(label, value, onChange, options = {}) {
  const { multiline = false, placeholder = "" } = options;
  const wrapper = document.createElement("div");
  wrapper.className = "field field--editable";

  const header = document.createElement("div");
  header.className = "field__header";
  const lbl = document.createElement("div");
  lbl.className = "field__label";
  lbl.textContent = label;
  const hint = document.createElement("span");
  hint.className = "field__hint";
  hint.textContent = "可直接編輯";
  header.append(lbl, hint);

  const inputEl = multiline ? document.createElement("textarea") : document.createElement("input");
  inputEl.value = value || "";
  inputEl.placeholder = placeholder;
  inputEl.className = "inline-input";
  if (multiline) {
    inputEl.rows = 3;
  }

  inputEl.addEventListener("input", (event) => {
    onChange(event.target.value);
  });

  wrapper.append(header, inputEl);
  return wrapper;
}

function createLayoutSelector(node) {
  const wrapper = document.createElement("div");
  wrapper.className = "field field--layout";

  const header = document.createElement("div");
  header.className = "field__header";
  const label = document.createElement("div");
  label.className = "field__label";
  label.textContent = "欄位版面配置";
  header.append(label);

  const select = document.createElement("select");
  select.className = "inline-select";

  layoutOptions.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = `${option.label} — ${option.description}`;
    if (node.layout === option.value) opt.selected = true;
    select.append(opt);
  });

  select.addEventListener("change", (event) => {
    node.layout = event.target.value;
    render();
  });

  wrapper.append(header, select);
  return wrapper;
}

function createListField(label, items, onAdd, onUpdate, onRemove, options = {}) {
  const { type = "link" } = options;
  const wrapper = document.createElement("div");
  wrapper.className = `field field--editable field--list field--${type}`;

  const header = document.createElement("div");
  header.className = "field__header";
  const lbl = document.createElement("div");
  lbl.className = "field__label";
  lbl.textContent = label;

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "icon-button icon-button--add";
  addBtn.title = `新增${label}`;
  addBtn.textContent = "+";
  addBtn.addEventListener("click", onAdd);

  header.append(lbl, addBtn);
  wrapper.append(header);

  const list = document.createElement("div");
  list.className = "field-list";

  items.forEach((value, index) => {
    const itemRow = document.createElement("div");
    itemRow.className = "field-list__item";

    const input = document.createElement("input");
    input.type = "url";
    input.value = value || "";
    input.placeholder = type === "image" ? "https://... (圖片網址)" : "https://... (參考網址)";
    input.className = "inline-input";

    input.addEventListener("input", (event) => {
      onUpdate(index, event.target.value);
    });

    const controls = document.createElement("div");
    controls.className = "field-list__controls";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-button icon-button--remove";
    removeBtn.title = "刪除欄位";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => onRemove(index));

    controls.append(removeBtn);
    itemRow.append(input, controls);

    if (type === "image" && value) {
      const preview = document.createElement("div");
      preview.className = "media-preview";
      const img = document.createElement("img");
      img.src = value;
      img.alt = "圖片預覽";
      preview.append(img);
      itemRow.append(preview);
    }

    if (type === "link" && value) {
      const previewLink = document.createElement("a");
      previewLink.href = value;
      previewLink.target = "_blank";
      previewLink.rel = "noreferrer";
      previewLink.className = "link-preview";
      previewLink.textContent = value;
      itemRow.append(previewLink);
    }

    list.append(itemRow);
  });

  wrapper.append(list);
  return wrapper;
}

function renderNode(node, container, parent, depth = 0) {
  const element = nodeTemplate.content.firstElementChild.cloneNode(true);
  element.classList.add(`layout-${node.layout}`);
  element.style.setProperty("--accent", getAccent(depth));
  element.style.setProperty("--indent", `${depth * 18}px`);
  element.dataset.depth = depth;

  const titleEl = element.querySelector(".node__title");
  titleEl.textContent = node.title;
  titleEl.contentEditable = true;
  titleEl.spellcheck = false;
  titleEl.addEventListener("input", (event) => {
    node.title = event.target.textContent;
  });

  const typeEl = element.querySelector(".node__type");
  typeEl.textContent = node.type || "";
  typeEl.contentEditable = true;
  typeEl.spellcheck = false;
  typeEl.addEventListener("input", (event) => {
    node.type = event.target.textContent;
  });

  const toggleBtn = element.querySelector('[data-action="toggle"]');
  toggleBtn.textContent = node.isOpen ? "收合" : "展開";

  const content = element.querySelector(".node__content");
  const childrenContainer = element.querySelector(".node__children");

  const metaRow = document.createElement("div");
  metaRow.className = "meta-row";
  metaRow.append(createLayoutSelector(node));
  content.append(metaRow);

  const fieldsWrap = document.createElement("div");
  fieldsWrap.className = `field-group fields-${node.layout}`;

  const descriptionField = createEditableText("說明", node.description, (value) => {
    node.description = value;
  }, { multiline: true, placeholder: "輸入說明..." });

  const notesField = createEditableText("注意事項", node.notes, (value) => {
    node.notes = value;
  }, { multiline: true, placeholder: "輸入注意事項..." });

  fieldsWrap.append(descriptionField, notesField);
  content.append(fieldsWrap);

  const mediaWrap = document.createElement("div");
  mediaWrap.className = `field-group fields-${node.layout}`;

  const imageField = createListField(
    "圖片網址",
    node.images,
    () => {
      node.images.push("");
      render();
    },
    (index, value) => {
      node.images[index] = value;
    },
    (index) => {
      node.images.splice(index, 1);
      render();
    },
    { type: "image" }
  );

  const linkField = createListField(
    "參考網址",
    node.links,
    () => {
      node.links.push("");
      render();
    },
    (index, value) => {
      node.links[index] = value;
    },
    (index) => {
      node.links.splice(index, 1);
      render();
    },
    { type: "link" }
  );

  mediaWrap.append(imageField, linkField);
  content.append(mediaWrap);

  toggleBtn.addEventListener("click", () => {
    node.isOpen = !node.isOpen;
    render();
  });

  const deleteBtn = element.querySelector('[data-action="delete"]');
  if (!parent) {
    deleteBtn.disabled = true;
    deleteBtn.title = "根節點無法刪除";
  }

  deleteBtn.addEventListener("click", () => {
    if (!parent) return;
    const confirmed = window.confirm(`確定要刪除「${node.title}」嗎？`);
    if (!confirmed) return;
    parent.children = parent.children.filter((child) => child !== node);
    render();
  });

  if (!node.isOpen) {
    element.querySelector(".node__content").style.display = "none";
    element.querySelector(".node__children").style.display = "none";
  }

  if (node.children && node.children.length) {
    node.children.forEach((child) => renderNode(child, childrenContainer, node, depth + 1));
  }

  container.append(element);
}

function render() {
  app.innerHTML = "";
  renderNode(processState, app, null, 0);
}

const processState = cloneDeep(processData);
applyLayoutDefaults(processState);
render();
