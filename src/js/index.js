function todoApp(state){
  this.todos = state.todos;
  this.filters = state.filters;
  this.activeFilter = state.activeFilter || this.filters[0].value;
  this.isSorted = state.isSorted;
  this.edittingItem = state.edittingItem;
  this.noTasksMsg = state.noTasksMsg;
  this.errors = state.errors;
  this.taskForm = $("#form");
  this.taskList = $('#list-todo');
  this.filterSelect = $("#filter");
  this.newTaskBtn = $("#new-task");
  this.priorityInput = $("#priority");
  this.panel = $(".app-panel");
  this.formWrap = $(".app-form");
}
todoApp.prototype.init = function() {
  this.todos = this.todos.concat(this.storage('todos'));
  this.bindEvents();
  this.render();
};
todoApp.prototype.bindEvents = function() {
  this.newTaskBtn.on('click', this.getDataFromForm.bind(this));
  this.priorityInput.on('change', this.setSort.bind(this));
  this.filterSelect.on('change', this.setActiveFilter.bind(this));
  this.taskList
    .on('click', '#delete', this.deleteTask.bind(this))
    .on('click', '#update', this.getDataFromForm.bind(this))
    .on('click', '#toggleSlide', this.toggleSlideTask.bind(this));
  this.taskForm
    .on('submit', this.validateForm.bind(this))
    .on('click', "#cancel", this.closeForm.bind(this));
};
todoApp.prototype.storage = function (key, data) {
  if (arguments.length > 1) {
    return localStorage.setItem(key, JSON.stringify(data));
  } else {
    var store = localStorage.getItem(key);
    return JSON.parse(store) || [];
  }
};
todoApp.prototype.taskTemplate = function(todos) {
  var dynamicItems = '',
      i;

  for(i = 0; i < todos.length; i++) {

    var title = todos[i].title,
        projectName = todos[i].projectName,
        priority = todos[i].priority,
        description = todos[i].description,
        id = todos[i].id;

    dynamicItems += '<div class="task closed" data-id=' + id + '>' +
                    '<h3 class="task-title">' + title + '</h3>' +
                    '<div class="task-info is-flexed">' +
                      '<div class="task-project-name">' +
                        '<span>Проект: </span>' + projectName +
                      '</div>' +
                      '<div class="task-priority">'+
                        '<span>Приоритет: </span>' + priority +
                      '</div>' +
                      '<div class="task-description"><p>' + description + '</p></div>' +
                    '</div>' +
                    '<div class="task-buttons is-flexed">' +
                      '<button type="button" class="btn" id="update">Изменить</button>'+
                      '<button type="button" class="btn" id="delete">Закрыть</button>'+
                      '<button type="button" class="btn" id="toggleSlide" data-toggle-value="Свернуть">Развернуть</button>'+
                    '</div>' +
                  '</div>';
  }

  return dynamicItems;
};
todoApp.prototype.render = function() {
  var todos,
      dynamicItems;

  if(this.isSorted){

    todos = this.getFilteredTodos().sort(function(a,b){
      return a.priority - b.priority;
    });
  } else {

    todos = this.getFilteredTodos();
  }

  if(!todos.length){
    dynamicItems = '<div class="no-tasks is-flexed"><p>' + this.noTasksMsg + '</p></div>';
  } else {
    dynamicItems = this.taskTemplate(todos);
  }

  this.renderSelect(this.activeFilter);
  this.taskList.html(dynamicItems);
  this.storage("todos", this.todos);
};
todoApp.prototype.renderSelect = function(active) {
  var dynamicItems = '',
      i,
      filters = this.filters.concat(this.getUnicFilters());

  for (i = 0; i < filters.length; i++) {
    var value = filters[i].value,
        label = filters[i].label;
    
    dynamicItems += '<option value=' + value +'>' + label + '</option>';
  }

  this.filterSelect.html(dynamicItems).val(active);
};
todoApp.prototype.getUnicFilters = function() {
  var filters = {},
      i;

  for (i = 0; i < this.todos.length; i++) {
    filters[this.todos[i].projectName] = true;
  }

  return Object.keys(filters).map(function(filter){
    return {
      label:filter,
      value:filter
    }
  });
};
todoApp.prototype.getElementNumById = function(id) {
  for (var i = 0; i < this.todos.length; i++) {
    if(id === this.todos[i].id ) {
      break;
    }
  }
  return i;
};
todoApp.prototype.closeForm = function(e) {
  this.taskForm[0].reset();
  console.log(this.formWrap);
  this.formWrap.hide();
  this.panel.show(); 
};
todoApp.prototype.validateForm = function(e) {
  e.preventDefault();

  var form  = e.target,
      errorFlag = false,
      self = this;
  

  $(".required").each(function(){
    var inputValue = $(this).val();

    if(!inputValue.length) {
      $(this).addClass('error-empty').next().html(self.errors.required).show();
      errorFlag = true;
    } else {
      $(this).removeClass('error-empty').next().html(self.errors.required).hide();
    }
  });

  if(!errorFlag){
    this.saveTask(form);
  }
};
todoApp.prototype.saveTask = function(form) {
  if(this.edittingItem != null ) {
    this.updateTask(form);
  } else {
    this.createTask(form);
  }

  this.closeForm();
};
todoApp.prototype.updateTask = function(form) {
  var task = {
    title: $(form).find("input[name='name']").val(),
    priority:+$(form).find("select[name='priority']").val(),
    projectName:$(form).find("input[name='projectName']").val() ,
    description:$(form).find("textarea[name='description']").val()
  };

  this.todos[this.edittingItem] = Object.assign({}, this.todos[this.edittingItem], task);
  this.edittingItem = null;
  this.render();
};
todoApp.prototype.getDataFromForm = function(e) {
  var taksId = $(e.target).closest('.task').data('id'),
      taskData;

  if(taksId) {
    this.edittingItem = this.getElementNumById(taksId);
    taskData = this.todos[this.edittingItem];

    this.taskForm.find("input[name='name']").val(taskData.title);
    this.taskForm.find("select[name='priority']").val(taskData.priority);
    this.taskForm.find("input[name='projectName']").val(taskData.projectName);
    this.taskForm.find("textarea[name='description']").val(taskData.description);
  }

  this.showForm();
};
todoApp.prototype.showForm = function() {
  this.panel.hide();
  this.formWrap.show();
};
todoApp.prototype.toggleSlideTask = function(e) {
  var $el = $(e.target),
      $task = $(e.target).closest('.task'),
      $toogleValue = $(e.target).data('toggle-value');

  $(e.target).data('toggle-value', $(e.target).html()).html($toogleValue);
  $task.toggleClass('closed');
};
todoApp.prototype.deleteTask = function(e) {
  var taksId = $(e.target).closest('.task').data('id');

  this.todos.splice(this.getElementNumById(taksId), 1);
  this.render();
};
todoApp.prototype.setSort = function(e) {
  this.isSorted = e.target.checked;
  this.render();
};
todoApp.prototype.setActiveFilter = function(e) {
  this.activeFilter = $(e.target).val();
  this.render();
};
todoApp.prototype.getFilteredTodos = function() {
  var self = this;
  var filteredTodos = this.todos.filter(function (todo) {
    if(self.activeFilter !== 'all') {
      return todo.projectName == self.activeFilter;
    }
    return true;
  });

  if(!filteredTodos.length && self.activeFilter !== 'all'){
    self.activeFilter = 'all';
    filteredTodos = this.getFilteredTodos();
  }

  return filteredTodos;
};
todoApp.prototype.createTask = function(form) {
  var form = $(form);
  var newTask = {
    id: Date.now(),
    title: form.find("input[name='name']").val(),
    priority: +form.find("select[name='priority']").val(),
    projectName: form.find("input[name='projectName']").val(),
    description: form.find("textarea[name='description']").val()
  };

  this.todos.push(newTask);
  this.render();
};







$(document).ready(function() {

  var initialState = {
    todos: [],
    filters: [{
      label:'Все',
      value: 'all'
    }],
    activeFilter: 'all',
    isSorted:false,
    edittingItem: null,
    noTasksMsg:'No tasks :(',
    errors:{
      required: 'required'
    }
  };

  var testTask = new todoApp(initialState);

  testTask.init();

});