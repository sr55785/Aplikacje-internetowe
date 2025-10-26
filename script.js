class Todo {
  constructor(listSelector, searchSelector) {
    this.listEl = document.querySelector(listSelector);
    this.searchEl = document.querySelector(searchSelector);
    this.tasks = [];
    this.term = '';
    this.currentlyEditing = null;

    this.loadFromLocalStorage();
    this.draw();

    this.searchEl.addEventListener('input', (e) => {
      this.term = e.target.value.trim().toLowerCase();
      this.draw();
    });

    document.addEventListener('click', (e) => {
      if (this.currentlyEditing && !e.target.closest('.editing')) {
        this.saveEdit();
      }
    });
  }

  addTask(text, date = '') {
    if (text.length < 3 || text.length > 255) {
      alert('Zadanie musi mieć od 3 do 255 znaków!');
      return;
    }
    const now = new Date();
    if (date && new Date(date) < now) {
      alert('Data musi być pusta lub w przyszłości!');
      return;
    }

    this.tasks.push({
      id: Date.now(),
      text,
      date,
    });
    this.saveToLocalStorage();
    this.draw();
  }

  removeTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToLocalStorage();
    this.draw();
  }

  editTask(id, newText, newDate) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    task.text = newText;
    task.date = newDate;
    this.saveToLocalStorage();
    this.draw();
  }

  get filteredTasks() {
    if (this.term.length < 2) return this.tasks;
    return this.tasks.filter(t => t.text.toLowerCase().includes(this.term));
  }

  draw() {
    this.listEl.innerHTML = '';
    const tasksToDisplay = this.filteredTasks;

    tasksToDisplay.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task';
      taskDiv.dataset.id = task.id;

      if (this.currentlyEditing === task.id) {
        taskDiv.classList.add('editing');
        taskDiv.innerHTML = `
          <input type="text" class="edit-text" value="${task.text}">
          <input type="date" class="edit-date" value="${task.date}">
        `;
      } else {
        const displayText = this.highlight(task.text);
        taskDiv.innerHTML = `
          <span class="task-text">${displayText} ${task.date ? '(' + task.date + ')' : ''}</span>
          <button class="del-btn">🗑️</button>
        `;

        taskDiv.querySelector('.task-text').addEventListener('click', (e) => {
          e.stopPropagation();
          this.startInlineEdit(task.id);
        });

        taskDiv.querySelector('.del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeTask(task.id);
        });
      }

      this.listEl.appendChild(taskDiv);
    });
  }

  highlight(text) {
    if (this.term.length < 2) return text;
    const regex = new RegExp(`(${this.term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  startInlineEdit(id) {
    this.currentlyEditing = id;
    this.draw();

    const input = this.listEl.querySelector('.edit-text');
    if (input) input.focus();
  }

  saveEdit() {
    const editContainer = this.listEl.querySelector('.editing');
    if (!editContainer) return;

    const id = parseInt(editContainer.dataset.id);
    const newText = editContainer.querySelector('.edit-text').value.trim();
    const newDate = editContainer.querySelector('.edit-date').value;

    if (newText.length < 3 || newText.length > 255) {
      alert('Zadanie musi mieć od 3 do 255 znaków!');
      return;
    }

    this.editTask(id, newText, newDate);
    this.currentlyEditing = null;
    this.draw();
  }

  saveToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('todoTasks');
    if (data) {
      this.tasks = JSON.parse(data);
    }
  }
}

const todo = new Todo('#results', '#search');

document.querySelector('#add-btn').addEventListener('click', () => {
  const text = document.querySelector('#task-text').value.trim();
  const date = document.querySelector('#task-date').value;
  todo.addTask(text, date);
  document.querySelector('#task-text').value = '';
  document.querySelector('#task-date').value = '';
});