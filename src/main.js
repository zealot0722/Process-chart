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
  const wrapper = document.createElement("label");
  wrapper.textContent = "欄位版面配置";

  const select = document.createElement("select");
  select.name = "layout";

  layoutOptions.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === value) opt.selected = true;
    select.append(opt);
  });

  wrapper.append(select);
  return wrapper;
}

function renderNode(node, container) {
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

  const titleField = createField("標題", node.title, "field--stacked");
  const descriptionField = createField("說明", node.description);
  const notesField = createField("注意事項", node.notes, "notes");
  if (titleField) content.append(titleField);
  if (descriptionField) content.append(descriptionField);
  if (notesField) content.append(notesField);

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

  if (!node.isOpen) {
    element.querySelector(".node__content").style.display = "none";
    element.querySelector(".node__children").style.display = "none";
  }

  if (node.children && node.children.length) {
    node.children.forEach((child) => renderNode(child, childrenContainer));
  }

  container.append(element);
}

function render() {
  app.innerHTML = "";
  renderNode(processState, app);
}

const processState = cloneDeep(processData);
applyLayoutDefaults(processState);
render();
