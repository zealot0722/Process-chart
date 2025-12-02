const { layoutOptions, processData } = window;

const app = document.querySelector("#app");
const nodeTemplate = document.querySelector("#node-template");

const layoutLabels = layoutOptions.reduce((map, option) => {
  map[option.value] = option.label;
  return map;
}, {});

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

function createBadge(text) {
  const badge = document.createElement("span");
  badge.className = "tag";
  badge.textContent = text;
  return badge;
}

function renderForm(node, onSubmit, onCancel) {
  const form = document.createElement("form");
  form.className = "form";

  const helper = document.createElement("p");
  helper.className = "helper-text";
  helper.textContent = "按 Enter 會留下換行，預覽時會依版面配置正確分行。";

  const grid = document.createElement("div");
  grid.className = "form__grid";

  const titleField = createInputField("標題", "title", node.title, "text");
  const typeField = createInputField("類型", "type", node.type || "", "text");
  const layoutField = createLayoutField(node.layout);
  const descField = createTextAreaField("說明", "description", node.description || "");
  const notesField = createTextAreaField("注意事項", "notes", node.notes || "");

  grid.append(titleField, typeField, layoutField, descField, notesField);

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
  form.append(helper, grid, actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    onSubmit({
      title: data.get("title"),
      type: data.get("type"),
      description: data.get("description"),
      notes: data.get("notes"),
      layout: data.get("layout"),
    });
  });

  return form;
}

function createInputField(label, name, value, type = "text") {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;

  const input = document.createElement("input");
  input.name = name;
  input.type = type;
  input.value = value ?? "";

  wrapper.append(input);
  return wrapper;
}

function createTextAreaField(label, name, value) {
  const wrapper = document.createElement("label");
  const textarea = document.createElement("textarea");
  textarea.name = name;
  textarea.value = value ?? "";
  textarea.rows = 3;
  wrapper.append(label, textarea);
  return wrapper;
}

function createLayoutField(value) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "layout-picker";

  const legend = document.createElement("legend");
  legend.textContent = "欄位版面配置";

  const helper = document.createElement("p");
  helper.className = "layout-picker__hint";
  helper.textContent = "標題固定置頂，僅調整「說明」「注意事項」的呈現方式。";

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

    content.append(title, desc);
    label.append(input, content);
    list.append(label);
  });

  wrapper.append(legend, helper, list);
  return wrapper;
}

function renderNode(node, container, parent) {
  const element = nodeTemplate.content.firstElementChild.cloneNode(true);
  element.classList.add(`layout-${node.layout}`);

  const titleEl = element.querySelector(".node__title");
  titleEl.textContent = node.title;

  const typeEl = element.querySelector(".node__type");
  typeEl.textContent = node.type;

  const toggleBtn = element.querySelector('[data-action="toggle"]');
  toggleBtn.textContent = node.isOpen ? "收合" : "展開";

  const content = element.querySelector(".node__content");

  const badgeRow = document.createElement("div");
  badgeRow.className = "badge-row";
  badgeRow.append(createBadge(layoutLabels[node.layout] || "自訂版面"));
  content.append(badgeRow);

  const fieldsWrap = document.createElement("div");
  fieldsWrap.className = `field-group fields-${node.layout}`;

  const titleField = createField("標題", node.title, "field--stacked field--title");
  const descriptionField = createField("說明", node.description, "field--description");
  const notesField = createField("注意事項", node.notes, "notes field--notes");

  if (titleField) fieldsWrap.append(titleField);
  if (descriptionField) fieldsWrap.append(descriptionField);
  if (notesField) fieldsWrap.append(notesField);

  content.append(fieldsWrap);

  const childrenContainer = element.querySelector(".node__children");
  const formContainer = element.querySelector(".node__form");

  toggleBtn.addEventListener("click", () => {
    node.isOpen = !node.isOpen;
    render();
  });

  const editBtn = element.querySelector('[data-action="edit"]');
  let isEditing = false;

  const cancelForm = () => {
    isEditing = false;
    formContainer.innerHTML = "";
  };

  const submitForm = (updates) => {
    Object.assign(node, updates);
    isEditing = false;
    render();
  };

  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    if (isEditing) {
      const form = renderForm(node, submitForm, cancelForm);
      formContainer.innerHTML = "";
      formContainer.append(form);
    } else {
      cancelForm();
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
    node.children.forEach((child) => renderNode(child, childrenContainer, node));
  }

  container.append(element);
}

function render() {
  app.innerHTML = "";
  renderNode(processState, app, null);
}

const processState = cloneDeep(processData);
applyLayoutDefaults(processState);
render();
