const { layoutOptions, processData } = window;

const app = document.querySelector("#app");
const nodeTemplate = document.querySelector("#node-template");

const accentPalette = ["#2563eb", "#0ea5e9", "#22c55e", "#a855f7", "#f97316", "#ec4899"];

function cloneDeep(node) {
  return JSON.parse(JSON.stringify(node));
}

function applyLayoutDefaults(node) {
  if (!node.layout) node.layout = "vertical";
  node.children?.forEach(applyLayoutDefaults);
}

function createField(label, value, extraClass = "") {
  if (!value) return null;
  const wrapper = document.createElement("div");
  wrapper.className = `field ${extraClass}`;

  const title = document.createElement("div");
  title.className = "field__label";
  title.textContent = label;

  const content = document.createElement("p");
  content.className = "field__value";
  content.textContent = value;

  wrapper.append(title, content);
  return wrapper;
}

function createImageField(value) {
  if (!value) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "field field--media";

  const label = document.createElement("div");
  label.className = "field__label";
  label.textContent = "圖片";

  const preview = document.createElement("div");
  preview.className = "media-preview";
  const img = document.createElement("img");
  img.src = value;
  img.alt = "節點圖片";
  preview.append(img);

  wrapper.append(label, preview);
  return wrapper;
}

function createLinkField(value) {
  if (!value) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "field field--link";

  const label = document.createElement("div");
  label.className = "field__label";
  label.textContent = "參考網址";

  const anchor = document.createElement("a");
  anchor.className = "field__value link";
  anchor.href = value;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.textContent = value;

  wrapper.append(label, anchor);
  return wrapper;
}

function renderForm(node, onSubmit, onCancel) {
  const form = document.createElement("form");
  form.className = "form inline-form";

  const helper = document.createElement("p");
  helper.className = "helper-text";
  helper.textContent = "直接在欄位內更新內容，Enter 會保留換行。";

  const headerRow = document.createElement("div");
  headerRow.className = "form__row";
  headerRow.append(
    createEditInput("標題", "title", node.title, "text"),
    createEditInput("類型", "type", node.type || "", "text"),
    createLayoutField(node.layout)
  );

  const fieldsWrap = document.createElement("div");
  fieldsWrap.className = `field-group fields-${node.layout} edit-fields`;

  fieldsWrap.append(
    createEditTextArea("說明", "description", node.description || ""),
    createEditTextArea("注意事項", "notes", node.notes || ""),
    createEditInput("圖片網址", "image", node.image || "", "url"),
    createEditInput("參考網址", "link", node.link || "", "url")
  );

  const actions = document.createElement("div");
  actions.className = "form__actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "button button--secondary";
  cancelButton.textContent = "取消";
  cancelButton.addEventListener("click", onCancel);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "button button--primary";
  saveButton.textContent = "儲存";

  actions.append(cancelButton, saveButton);
  form.append(helper, headerRow, fieldsWrap, actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    onSubmit({
      title: data.get("title"),
      type: data.get("type"),
      image: data.get("image"),
      link: data.get("link"),
      description: data.get("description"),
      notes: data.get("notes"),
      layout: data.get("layout"),
    });
  });

  return form;
}

function createEditInput(label, name, value, type = "text") {
  const wrapper = document.createElement("label");
  wrapper.className = "form-field form-field--inline";

  const title = document.createElement("div");
  title.className = "field__label";
  title.textContent = label;

  const input = document.createElement("input");
  input.name = name;
  input.type = type;
  input.value = value ?? "";

  wrapper.append(title, input);
  return wrapper;
}

function createEditTextArea(label, name, value) {
  const wrapper = document.createElement("label");
  wrapper.className = "form-field form-field--inline";

  const title = document.createElement("div");
  title.className = "field__label";
  title.textContent = label;

  const textarea = document.createElement("textarea");
  textarea.name = name;
  textarea.value = value ?? "";
  textarea.rows = 3;

  wrapper.append(title, textarea);
  return wrapper;
}

function createLayoutField(value) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "layout-picker";

  const legend = document.createElement("legend");
  legend.textContent = "欄位版面配置";

  const helper = document.createElement("p");
  helper.className = "layout-picker__hint";
  helper.textContent = "固定順序：標題 → 說明 → 注意事項，調整呈現比例即可。";

  const list = document.createElement("div");
  list.className = "layout-picker__list";

  layoutOptions.forEach((option) => {
    const label = document.createElement("label");
    label.className = "layout-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "layout";
    input.value = option.value;
    input.checked = option.value === value;

    const content = document.createElement("div");
    content.className = "layout-option__body";

    const title = document.createElement("div");
    title.className = "layout-option__title";
    title.textContent = option.label;

    const desc = document.createElement("div");
    desc.className = "layout-option__desc";
    desc.textContent = option.description;

    const preview = document.createElement("div");
    preview.className = `layout-option__preview preview-${option.value}`;
    const descBlock = document.createElement("span");
    descBlock.className = "preview__desc";
    descBlock.textContent = "說明";
    const noteBlock = document.createElement("span");
    noteBlock.className = "preview__note";
    noteBlock.textContent = "注意";
    preview.append(descBlock, noteBlock);

    content.append(title, desc, preview);
    label.append(input, content);
    list.append(label);
  });

  wrapper.append(legend, helper, list);
  return wrapper;
}

function getAccent(depth) {
  return accentPalette[depth % accentPalette.length];
}

function renderNode(node, container, parent, depth = 0) {
  const element = nodeTemplate.content.firstElementChild.cloneNode(true);
  element.classList.add(`layout-${node.layout}`);
  element.style.setProperty("--accent", getAccent(depth));
  element.style.setProperty("--indent", `${depth * 18}px`);
  element.dataset.depth = depth;

  const titleEl = element.querySelector(".node__title");
  titleEl.textContent = node.title;

  const typeEl = element.querySelector(".node__type");
  typeEl.textContent = node.type;

  const toggleBtn = element.querySelector('[data-action="toggle"]');
  toggleBtn.textContent = node.isOpen ? "收合" : "展開";

  const content = element.querySelector(".node__content");
  const childrenContainer = element.querySelector(".node__children");

  let isEditing = false;

  const renderDisplayContent = () => {
    content.innerHTML = "";
    const fieldsWrap = document.createElement("div");
    fieldsWrap.className = `field-group fields-${node.layout}`;

    const descriptionField = createField("說明", node.description, "field--description");
    const notesField = createField("注意事項", node.notes, "notes field--notes");
    const imageField = createImageField(node.image);
    const linkField = createLinkField(node.link);

    if (descriptionField) fieldsWrap.append(descriptionField);
    if (notesField) fieldsWrap.append(notesField);
    if (imageField) fieldsWrap.append(imageField);
    if (linkField) fieldsWrap.append(linkField);

    content.append(fieldsWrap);
  };

  const cancelForm = () => {
    isEditing = false;
    render();
  };

  const submitForm = (updates) => {
    Object.assign(node, updates);
    isEditing = false;
    render();
  };

  const renderEditContent = () => {
    content.innerHTML = "";
    const form = renderForm(node, submitForm, cancelForm);
    content.append(form);
  };

  renderDisplayContent();

  toggleBtn.addEventListener("click", () => {
    node.isOpen = !node.isOpen;
    render();
  });

  const editBtn = element.querySelector('[data-action="edit"]');

  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    if (isEditing) {
      renderEditContent();
    } else {
      renderDisplayContent();
    }
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
