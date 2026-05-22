// Todo App - Local Storage Functionality
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterSelect = document.getElementById('filterSelect');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');

        this.init();
    }

    // Initialize the app
    init() {
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.render();
    }

    // Attach all event listeners
    attachEventListeners() {
        // Add todo on button click or Enter key
        this.addBtn.addEventListener('click', () => this.handleAddTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTodo();
        });

        // Filter todos
        this.filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });

        // Clear buttons
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // Focus input on load
        this.todoInput.focus();
    }

    // Handle adding a new todo
    handleAddTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            alert('Please enter a task');
            this.todoInput.focus();
            return;
        }

        if (text.length > 500) {
            alert('Task is too long (max 500 characters)');
            return;
        }

        this.addTodo(text);
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // Add a new todo
    addTodo(text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            priority: 'low' // Default priority
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Delete a todo
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Start editing a todo
    startEdit(id) {
        this.editingId = id;
        this.render();
        const input = document.querySelector(`#edit-input-${id}`);
        if (input) {
            input.focus();
            input.select();
        }
    }

    // Save edited todo
    saveEdit(id, newText) {
        const text = newText.trim();
        
        if (text === '') {
            alert('Task cannot be empty');
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            this.editingId = null;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Cancel editing
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // Clear completed todos
    clearCompleted() {
        const completed = this.todos.filter(t => t.completed);
        if (completed.length === 0) {
            alert('No completed tasks to clear');
            return;
        }

        if (confirm(`Delete ${completed.length} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Clear all todos
    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear');
            return;
        }

        if (confirm('Are you sure? This will delete ALL tasks. This action cannot be undone.')) {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Filter todos based on current filter
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;

        // Show/hide action buttons
        this.clearCompletedBtn.style.display = completed > 0 ? 'block' : 'none';
        this.clearAllBtn.style.display = total > 0 ? 'block' : 'none';
    }

    // Render the todo list
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear existing items
        this.todoList.innerHTML = '';

        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.todoList.style.display = 'block';

            // Render each todo
            filteredTodos.forEach(todo => {
                const li = this.createTodoElement(todo);
                this.todoList.appendChild(li);
            });
        }

        // Update statistics
        this.updateStats();
    }

    // Create a todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        if (this.editingId === todo.id) {
            // Edit mode
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    disabled
                >
                <input 
                    type="text" 
                    id="edit-input-${todo.id}" 
                    class="edit-input" 
                    value="${this.escapeHtml(todo.text)}"
                >
                <button class="btn-save" onclick="app.saveEdit(${todo.id}, document.getElementById('edit-input-${todo.id}').value)">✓ Save</button>
                <button class="btn-cancel" onclick="app.cancelEdit()">✕ Cancel</button>
            `;
        } else {
            // View mode
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="btn-icon btn-edit" title="Edit" onclick="app.startEdit(${todo.id})">✏️</button>
                    <button class="btn-icon btn-delete" title="Delete" onclick="app.deleteTodo(${todo.id})">🗑️</button>
                </div>
            `;
        }

        return li;
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Save todos to local storage
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
            localStorage.setItem('lastSaved', new Date().toLocaleString());
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    // Load todos from local storage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('todos');
            this.todos = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from local storage:', error);
            this.todos = [];
        }
    }

    // Export todos as JSON
    exportTodos() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import todos from JSON
    importTodos(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm('This will replace all your current tasks. Continue?')) {
                        this.todos = imported;
                        this.saveToLocalStorage();
                        this.render();
                        alert('Tasks imported successfully!');
                    }
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Get statistics
    getStats() {
        return {
            total: this.todos.length,
            completed: this.todos.filter(t => t.completed).length,
            active: this.todos.filter(t => !t.completed).length,
            completionRate: this.todos.length > 0 
                ? Math.round((this.todos.filter(t => t.completed).length / this.todos.length) * 100)
                : 0
        };
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Z to undo (not implemented, but shown as example)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        console.log('Undo functionality can be implemented here');
    }
});
