scriptLoad = (function(){
	var _taskPool = {}
	var _taskOrder = {
		'css':{},
		'javascript':{}
	}
	var _relyHas = {}
	/*
		基础event方法要被继承
	*/
	var _baseEvent = function(){ 
		this._event = {}
		this.setEvent = function($eventName,$eventFun){
			if (typeof $eventName != 'undefined' && typeof $eventFun == 'function') {
				this._event[$eventName] = $eventFun;
			}
		}
		this.runEvent = function($eventName){
			return this.runEventPro($eventName)();
		}
		this.runEventPro = function($eventName){
			return this._event[$eventName]
		}
		
	}
	/*
		基础的load任务生成类继承使用
	*/
	var _baseLoadTask = function(){
		_baseEvent.apply(this);
		var _this = this;
		this._option = {
			'src'		:null,
			'taskType'	:null,
			'element'	:{},
			'status'	:'ready',
			'ver'		:0,
			'callBack'	:function(){},
			'defaultOption':true
		}

		this._event = {
			'beforeLoad':function(){
				return true;
			},
			'afterLoad':function(){

			},
			'baseBeforeLoad':function(){
				if(_this.getOption('status') == 'complete'){
					return false;
				}	

				if (typeof _rely.getRely(_this.getOption('src'))  != 'undefined' && typeof _rely.getRely(_this.getOption('src')).rely  != 'undefined') {
					for (var $rely in _rely.getRely(_this.getOption('src')).rely) {
						if (_task.selectTask($rely).getOption('status') != 'complete') {
							return false;
						}
					}
				}
				return _this.runEvent('beforeLoad'); 
			},
			'baseAfterLoad':function(){
				_this.setOption({'status':'complete'});
				_this.runEvent('afterLoad');
				if (typeof _rely.getRely(_this.getOption('src'))  != 'undefined' && typeof _rely.getRely(_this.getOption('src')).beRely  != 'undefined') {
					for (var $beRely in _rely.getRely(_this.getOption('src')).beRely) {
						_task.selectTask($beRely).run();
					}
				}
			}
		}

		this.setOption = function($options){
			for (var $option in $options) {
				this._option[$option] = $options[$option];
				switch($option){ 
					case 'rely':
						var $relyData = {}
						if ($options['rely'] instanceof String) {
							var $tempValue = $options['rely'];
							$options['rely'] = new Array($tempValue);
						}
						for (var $rely in $options['rely']) {

							switch(true){
								case $options['rely'] instanceof Array:
									if (_task.hasTask($options['rely'][$rely])) { 
										_task.addTask(this.getOption('taskType'),$options['rely'][$rely]);
									}

									_rely.addRely(this.getOption('src'),$options['rely'][$rely]);
									$relyData[$options['rely'][$rely]] = $options['rely'][$rely];
								break;
								case $options['rely'] instanceof Object:
									if (_task.hasTask($rely)) { 
										_task.addTask(this.getOption('taskType'),$rely,$options['rely'][$rely]);
									}else{
										_task.selectTask($rely).setOption($options['rely'][$rely]);
									}
							 		
									_rely.addRely(this.getOption('src'),$rely);
									$relyData[$rely] = $options['rely'][$rely];

								break;
							}
						}

						this._option[$option] = $relyData;
					break;
					case 'callBack':
						this.setEvent('afterLoad',$options[$option]);
					break;
				}
			}
		}
		
		this.getOption = function($optionName){
			if (typeof $optionName == 'undefined') {
				return this._option;
			}else{ 
				return this._option[$optionName]
			}
			
		}

		this._createElement = function(){
			var _element = document.createElement(this._option['element']['type']); 
			if (_element.readyState){ //IE 
				_element.onreadystatechange = function(){ 
					if (_element.readyState == "loaded" || _element.readyState == "complete"){
						_element.onreadystatechange = null; 
						this.runEvent('baseAfterLoad');
					} 
				}; 
			} else { //Others: Firefox, Safari, Chrome, and Opera 
				_element.onload = this.runEventPro('baseAfterLoad');
			} 
			return _element;
		}

		this._taskElement = function(){

		}
		this._taskSrc = function(){
			return this._option['src']+'?ver='+this._option['ver'];
		}
		this._runLoad = function(){
			document.getElementsByTagName('head')[0].appendChild(this._taskElement());
		}

		this.run = function(){
			if (this.runEvent('baseBeforeLoad')) {
				this._runLoad();
			}
		}
	}
	/*
		javascript 的载入类
	*/
	var taskJavascript = function($src,$options){
		_baseLoadTask.apply(this);
		var _this = this;

		this.setOption({
			'src':$src,
			'taskType':'javascript',
			'element':{'type':'script'}
		});
		if (typeof $options == 'object') {
			$options['defaultOption'] = false;
			this.setOption($options);
		}
		
		this._taskElement = function(){
			var $script 	= this._createElement();
			$script.type 	= "text/javascript";
			$script.src 	= this._taskSrc();
			return $script;
		}
	}
	/*
		css 的载入类 （此功能并不理想）
	*/
	var taskCss = function($src,$options){ 
		_baseLoadTask.apply(this);
		var _this = this;

		this.setOption({
			'src':$src,
			'taskType':'css',
			'element':{'type':'link'}
		});
		if (typeof $options == 'object') {
			$options['defaultOption'] = false;
			this.setOption($options);
		}
		
		this._taskElement = function(){
			var $css 	= this._createElement();
			$css.rel 	= "stylesheet";
			$css.href 	= this._taskSrc();
			return $css;
		}
	}
	/*
		load任务 控制器
	*/
	var _task = {
		'_taskHas':{ 
			'javascript':taskJavascript,
			'css':taskCss
		},
		'addTask':function($type,$src,$options){
			_taskPool[$src] = new _task._taskHas[$type]($src,$options);	
			if (typeof _taskOrder[$type] == 'undefined'){ 
				_taskOrder[$type]= {}
			}	
			_taskOrder[$type][$src] = $src;

		},
		'selectTask':function($src){
			return _taskPool[$src];
		},
		'hasTask':function($src){
			return typeof _taskPool[$src] == 'undefined';
		}
	}
	/*
		脚步载入依赖类
	*/
	var _rely = {
		'addRely':function($src,$rely){
			if(typeof _relyHas[$src] != 'object'){
				_relyHas[$src] = { 
					'rely'	:{},
					'beRely':{}
				}
			}
			if(typeof _relyHas[$rely] != 'object'){
				_relyHas[$rely] = { 
					'rely'	:{},
					'beRely':{}
				}
			}

			_relyHas[$src]['rely'][$rely] = $rely;
			_relyHas[$rely]['beRely'][$src] = $src;
		},
		'getRely':function($src){
			return _relyHas[$src];
		}
	}
	/*
		包装一下添加load任务的方法
	*/
	var addTask = function($type,$src,$options){ 
		_task.addTask($type,$src,$options);
		return this;
	}
	/*
		最后的执行方法执行run时才会开始执行脚本加载
	*/
	var run = function($options){
		
		for(var $task in _taskPool){
			if (typeof $options == 'object' && _taskPool[$task].getOption('defaultOption')) {
				_taskPool[$task].setOption($options);
			}
			_taskPool[$task].run();
		}
	}
	
	/*
	按一定顺序加载脚本试验后因为依赖的机制效果不理想
	var run = function($options){
		for(var $taskType in _taskOrder){
			for(var $task in _taskOrder[$taskType]){ 
				if (typeof $options == 'object' && _taskPool[_taskOrder[$taskType][$task]].getOption('defaultOption')) {
					_taskPool[_taskOrder[$taskType][$task]].setOption($options);
				}
				_taskPool[_taskOrder[$taskType][$task]].run();
			}
		}
	}
	*/

	//闭包返回的方法列表
	_method = {
		'addTask':addTask,
		'run':run
	}
	return _method;
})();