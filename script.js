// Chave parra identificar os dados salvos pela nossa aplicação no navegador.
const STORAGE_KEY = "prompts-storage"

// Estado carregar os prompts salvos e exibir.
const state = {
  prompts: [],
  selectedId: null
}

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapperr conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });

  elements.promptContent.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
}

// Funções para abrir e fechar a sidebar
function openSiderbar () {
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")
}

function closeSidebar () {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios.")
    return
  }

  if (state.selectedId) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Criar um novo prompt
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content
    }

    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }

  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist () {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar no localStorage", error)
  }
}

function load () {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carrgar do localStorage:", error)
  }
}

function createPromptItem (prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content

  return `
  <li class="prompt-item" data-id="${prompt.id}" data-action="select" >
    <div class="prompt-item-content">
      <span class="prompt-item-title">${prompt.title}</span>
      <span class="prompt-item-description">${tmp.textContent}</span>
    </div>

    <button class="btn-icon" title="Remove" data-action="remove" >
      <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
    </button>
  </li>
  `
}

function renderList (filterText = "") {
  const filteredPrompts = state.prompts.filter((prompt) => 
    prompt.title.toLowerCase().includes(filterText.toLocaleLowerCase().trim())
  ).map((p) => createPromptItem(p)).join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt () {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected () {
  try {
    const content = elements.promptContent

    if (!navigator.clipboard) {
      console.error("Clipboard API não suportada neste ambiente.")
      return
    }

    navigator.clipboard.writeText(content.innerText)
    alert("Conteúdo copiado para área de tranferência!")
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", (event) => {
  renderList(event.target.value)
})

elements.list.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")
  
  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    // Remover prompt.
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  } 

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Inicialização
function init() {
  load()
  renderList("")
  attachAllEditableHandlers();
  updateAllEditableStates(); // Initial update on load

  // Estado inicial sidebar aberta (desktop) ou fechada (mobile)
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.remove("collapsed")

  // Eventos para abrir/fechar sidebar
  elements.btnOpen.addEventListener("click", openSiderbar)
  elements.btnCollapse.addEventListener("click", closeSidebar)
}

init()